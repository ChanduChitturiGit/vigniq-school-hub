"""Syllabus progress report service"""

import logging
from django.http import JsonResponse
from django.db.models import Count, Q, F, Max, Prefetch

from core.models import User
from teacher.models import TeacherSubjectAssignment
from syllabus.models import SchoolLessonPlanDay, SchoolChapter, SchoolSection, Topic
from core.common_modules.common_functions import CommonFunctions

logger = logging.getLogger(__name__)

class SyllabusProgressReportService:
    """Service for generating syllabus progress reports"""

    def __init__(self, request):
        """Initialize with request"""
        self.request = request

    
    def get_report_by_class(self):
        """Generate syllabus progress report by class using fewer queries."""
        try:
            school_id = self.request.GET.get('school_id')
            if not school_id:
                return JsonResponse({"error": "Missing school_id"}, status=400)

            school_db_name = CommonFunctions.get_school_db_name(school_id)
            if not school_db_name:
                return JsonResponse({"error": "Invalid school ID"}, status=400)

            latest_academic_year = CommonFunctions().get_latest_academic_year(school_db_name)
            boards_dict = CommonFunctions().get_boards_dict()

            # 1) Get all class sections with subjects
            classes_with_subjects = list(
                TeacherSubjectAssignment.objects.using(school_db_name)
                .filter(academic_year=latest_academic_year)
                .values(
                    'school_class_id',
                    'school_class__class_instance__id',
                    'school_class__class_instance__class_number',
                    'school_class__section',
                    'school_class__board_id',
                )
                .annotate(number_of_subjects=Count('subject', distinct=True))
                .order_by('school_class__class_instance__class_number', 'school_class__section')
            )
            if not classes_with_subjects:
                return JsonResponse({"data": []}, status=200)

            class_section_ids = [c['school_class_id'] for c in classes_with_subjects]
            class_instance_ids = list({c['school_class__class_instance__id'] for c in classes_with_subjects})

            # Map class_section_id -> (class_instance_id, board_id)
            class_section_info = {
                c['school_class_id']: {
                    'class_instance_id': c['school_class__class_instance__id'],
                    'board_id': c['school_class__board_id']
                }
                for c in classes_with_subjects
            }

            # 2) Aggregate lesson plan completion per chapter & class_section
            chapter_completion = (
                SchoolLessonPlanDay.objects.using(school_db_name)
                .filter(
                    class_section_id__in=class_section_ids,
                    chapter__academic_year=latest_academic_year
                )
                .values('chapter_id', 'chapter__subject_id', 'class_section_id')
                .annotate(
                    total_lessons=Count('id'),
                    completed_lessons=Count('id', filter=Q(status='completed'))
                )
            )

            # Build map: (class_section_id, subject_id) -> completed_chapters
            completed_chapters_map = {}
            for r in chapter_completion:
                if r['total_lessons'] == r['completed_lessons']:
                    key = (r['class_section_id'], r['chapter__subject_id'])
                    completed_chapters_map[key] = completed_chapters_map.get(key, 0) + 1

            # 3) Total chapters per class_instance, board, subject
            total_chapters_qs = (
                SchoolChapter.objects.using(school_db_name)
                .filter(academic_year=latest_academic_year, class_number_id__in=class_instance_ids)
                .values('class_number_id', 'school_board_id', 'subject_id')
                .annotate(total_chapters=Count('id'))
            )
            total_chapters_map = {
                (t['class_number_id'], t['school_board_id'], t['subject_id']): t['total_chapters']
                for t in total_chapters_qs
            }

            # 4) Calculate completed subjects per section
            completed_subjects_per_section = {}
            for (class_section_id, subject_id), completed_ch_count in completed_chapters_map.items():
                info = class_section_info.get(class_section_id)
                if not info:
                    continue
                total_ch_count = total_chapters_map.get((info['class_instance_id'], info['board_id'], subject_id), 0)
                if total_ch_count > 0 and completed_ch_count == total_ch_count:
                    completed_subjects_per_section[class_section_id] = completed_subjects_per_section.get(class_section_id, 0) + 1

            # 5) Bulk fetch all assignments and chapters to avoid per-class queries
            assignments_qs = TeacherSubjectAssignment.objects.using(school_db_name).filter(
                academic_year=latest_academic_year,
                school_class_id__in=class_section_ids
            ).select_related('subject', 'school_class')

            chapters_qs = SchoolChapter.objects.using(school_db_name).filter(
                academic_year=latest_academic_year,
                class_number_id__in=class_instance_ids
            )

            # Build maps for fast access
            chapters_map = {}
            for ch in chapters_qs:
                key = (ch.class_number_id, ch.school_board_id, ch.subject_id)
                chapters_map.setdefault(key, []).append(ch.id)

            lesson_plan_map = {}
            lesson_plan_qs = SchoolLessonPlanDay.objects.using(school_db_name).filter(
                class_section_id__in=class_section_ids,
                chapter_id__in=[ch.id for ch in chapters_qs]
            ).values('chapter_id', 'class_section_id', 'status')

            for lp in lesson_plan_qs:
                key = (lp['class_section_id'], lp['chapter_id'])
                lesson_plan_map.setdefault(key, []).append(lp['status'])

            # 6) Build final report
            report_data = []
            for c in classes_with_subjects:
                cs_id = c['school_class_id']
                # Assignments for this section
                assignments = [a for a in assignments_qs if a.school_class_id == cs_id]
                total_progress = 0
                weight = 100 / len(assignments) if assignments else 0
                for a in assignments:
                    ch_ids = chapters_map.get((a.school_class.class_instance_id, a.school_class.board_id, a.subject_id), [])
                    chapter_count = len(ch_ids)
                    chapter_weight = weight / chapter_count if chapter_count else 0
                    for ch_id in ch_ids:
                        statuses = lesson_plan_map.get((cs_id, ch_id), [])
                        if statuses:
                            completed = statuses.count('completed')
                            chapter_progress = (completed / len(statuses)) * chapter_weight
                            total_progress += chapter_progress

                report_data.append({
                    "class_number": c['school_class__class_instance__class_number'],
                    "class_section": c['school_class__section'],
                    "board_id": c['school_class__board_id'],
                    "board_name": boards_dict.get(c['school_class__board_id'], 'Unknown Board'),
                    "total_subjects": c['number_of_subjects'],
                    "class_section_id": cs_id,
                    "completed_subjects": completed_subjects_per_section.get(cs_id, 0),
                    "completion_percentage": round(total_progress,2)
                })

            return JsonResponse({"data": report_data}, status=200)

        except Exception as e:
            logger.error("Error generating report by class: %s", e)
            return JsonResponse({"error": "Failed to generate report"}, status=500)

    

    def get_subject_progress_by_class_section(self):
        """Get subject-wise progress for a given class_section_id"""
        try:
            school_id = self.request.GET.get('school_id')
            class_section_id = self.request.GET.get('class_section_id')

            if not (school_id and class_section_id):
                return JsonResponse({"error": "Missing school_id or class_section_id"}, status=400)

            school_db_name = CommonFunctions.get_school_db_name(school_id)
            if not school_db_name:
                return JsonResponse({"error": "Invalid school ID"}, status=400)

            latest_academic_year = CommonFunctions().get_latest_academic_year(school_db_name)

            # 1) Get all subjects assigned to this class_section
            subjects_qs = (
                TeacherSubjectAssignment.objects.using(school_db_name)
                .filter(
                    academic_year=latest_academic_year,
                    school_class_id=class_section_id
                )
                .values('subject__id', 'subject__name','teacher_id')
                .distinct()
            )

            if not subjects_qs:
                return JsonResponse({"data": []}, status=200)

            subject_ids = [s['subject__id'] for s in subjects_qs]

            teacher_ids = [s['teacher_id'] for s in subjects_qs]

            teacher_names_map = {}
            teachers = User.objects.filter(id__in=teacher_ids).values('id', 'first_name', 'last_name')
            for t in teachers:
                teacher_names_map[t['id']] = f"{t['first_name']} {t['last_name']}"

            # 2) Get class_instance_id and board_id for the class_section
            section_info = (
                SchoolSection.objects.using(school_db_name)
                .filter(id=class_section_id)
                .values('class_instance_id', 'board_id')
                .first()
            )

            if not section_info:
                return JsonResponse({"error": "Invalid class_section_id"}, status=400)

            class_instance_id = section_info['class_instance_id']
            board_id = section_info['board_id']

            # 3) Get total chapters per subject for that class and board
            total_chapters_qs = (
                SchoolChapter.objects.using(school_db_name)
                .filter(
                    academic_year=latest_academic_year,
                    class_number_id=class_instance_id,
                    school_board_id=board_id,
                    subject_id__in=subject_ids
                )
                .values('subject_id')
                .annotate(total_chapters=Count('id'))
            )

            total_chapters_map = {t['subject_id']: t['total_chapters'] for t in total_chapters_qs}

            # 4) Get completed chapters (where all lesson plan days for that chapter are completed)
            chapter_completion_qs = (
                SchoolLessonPlanDay.objects.using(school_db_name)
                .filter(
                    class_section_id=class_section_id,
                    chapter__academic_year=latest_academic_year,
                    chapter__subject_id__in=subject_ids
                )
                .values('chapter_id', 'chapter__subject_id')
                .annotate(
                    total_lessons=Count('id'),
                    completed_lessons=Count('id', filter=Q(status='completed'))
                )
            )

            # determine which chapters are fully completed
            completed_chapters_map = {}
            for r in chapter_completion_qs:
                total = r['total_lessons']
                comp = r['completed_lessons']
                if total > 0 and total == comp:
                    subj_id = r['chapter__subject_id']
                    completed_chapters_map[subj_id] = completed_chapters_map.get(subj_id, 0) + 1

            # 5) Build final response
            subject_progress_data = []
            for s in subjects_qs:
                subj_id = s['subject__id']
                subj_name = s['subject__name']
                total_ch = total_chapters_map.get(subj_id, 0)
                completed_ch = completed_chapters_map.get(subj_id, 0)
                completion_pct = round((completed_ch / total_ch) * 100, 2) if total_ch > 0 else 0.0

                subject_progress_data.append({
                    "subject_id": subj_id,
                    "subject_name": subj_name,
                    "total_chapters": total_ch,
                    "completed_chapters": completed_ch,
                    "completion_percentage": completion_pct,
                    "teacher_name": teacher_names_map.get(s['teacher_id'], 'Unknown Teacher')
                })

            return JsonResponse({"data": subject_progress_data}, status=200)

        except Exception as e:
            logger.error("Error generating subject progress for class_section %s: %s", class_section_id, e)
            return JsonResponse({"error": "Failed to generate subject progress"}, status=500)

    def get_chapter_progress_by_subject(self):
        """Get chapter-wise progress for a given class_section_id and subject_id"""
        try:
            school_id = self.request.GET.get('school_id')
            class_section_id = self.request.GET.get('class_section_id')
            subject_id = self.request.GET.get('subject_id')

            if not (school_id and class_section_id and subject_id):
                return JsonResponse({"error": "Missing school_id, class_section_id, or subject_id"}, status=400)

            school_db_name = CommonFunctions.get_school_db_name(school_id)
            if not school_db_name:
                return JsonResponse({"error": "Invalid school ID"}, status=400)

            latest_academic_year = CommonFunctions().get_latest_academic_year(school_db_name)

            # 1) Get class_instance_id and board_id for the class_section
            section_info = (
                SchoolSection.objects.using(school_db_name)
                .filter(id=class_section_id)
                .values('class_instance_id', 'board_id')
                .first()
            )
            if not section_info:
                return JsonResponse({"error": "Invalid class_section_id"}, status=400)

            class_instance_id = section_info['class_instance_id']
            board_id = section_info['board_id']

            # 2) Get all chapters for this subject in this class and board
            chapters_qs = (
                SchoolChapter.objects.using(school_db_name)
                .filter(
                    academic_year=latest_academic_year,
                    class_number_id=class_instance_id,
                    school_board_id=board_id,
                    subject_id=subject_id
                )
                .values('id', 'chapter_name','chapter_number')
                .order_by('chapter_number')
            )

            if not chapters_qs:
                return JsonResponse({"data": []}, status=200)

            chapter_ids = [c['id'] for c in chapters_qs]

            # 3) Get lesson plan days per chapter for this class_section
            lessonplans_qs = (
                SchoolLessonPlanDay.objects.using(school_db_name)
                .filter(
                    class_section_id=class_section_id,
                    chapter_id__in=chapter_ids
                )
                .values('chapter_id')
                .annotate(
                    total_lessons=Count('id'),
                    completed_lessons=Count('id', filter=Q(status='completed')),
                    last_completed_date=Max('updated_at', filter=Q(status='completed'))
                )
            )

            # Map: chapter_id -> info
            lessonplans_map = {l['chapter_id']: l for l in lessonplans_qs}

            # 4) Build response
            chapter_progress_data = []
            completed_chapters_count = 0
            for c in chapters_qs:
                chap_id = c['id']
                chap_name = c['chapter_name']
                info = lessonplans_map.get(chap_id, {})
                total = info.get('total_lessons', 0)
                completed = info.get('completed_lessons', 0)
                last_completed_date = info.get('last_completed_date')

                if total > 0 and total == completed:
                    status = 'completed'
                    completed_chapters_count += 1
                else:
                    status = 'not completed'
                    last_completed_date = None

                chapter_progress_data.append({
                    "chapter_id": chap_id,
                    "chapter_name": chap_name,
                    "status": status,
                    "completed_date": last_completed_date,
                    'chaper_number': c['chapter_number'],
                    "offline_exams_conducted": 0
                })

            total_chapters = len(chapters_qs)
            overall_progress = round((completed_chapters_count / total_chapters) * 100, 2) if total_chapters > 0 else 0.0

            return JsonResponse({
                "data": {
                    "subject_id": subject_id,
                    "total_chapters": total_chapters,
                    "completed_chapters": completed_chapters_count,
                    "overall_progress_percentage": overall_progress,
                    "chapters": chapter_progress_data
                }
            }, status=200)

        except Exception as e:
            logger.error(
                "Error generating chapter progress for class_section %s and subject %s: %s",
                class_section_id, subject_id, e
            )
            return JsonResponse({"error": "Failed to generate chapter progress"}, status=500)

    def get_lesson_plan_details(self,):
        """Get detailed lesson plan days for a given class_section and chapter"""
        try:
            school_id = self.request.GET.get('school_id')
            class_section_id = self.request.GET.get('class_section_id')
            chapter_id = self.request.GET.get('chapter_id')
            if not class_section_id or not chapter_id:
                return JsonResponse({"error": "Missing required parameters"}, status=400)
            if not school_id:
                return JsonResponse({"error": "Missing school_id"}, status=400)

            school_db_name = CommonFunctions.get_school_db_name(school_id)
            if not school_db_name:
                return JsonResponse({"error": "Invalid school ID"}, status=400)

            lesson_plans = (
                SchoolLessonPlanDay.objects.using(school_db_name)
                .filter(class_section_id=class_section_id, chapter_id=chapter_id)
                .prefetch_related(
                    Prefetch(
                        'school_lesson_topics',
                        queryset=Topic.objects.using(school_db_name).all()
                    )
                )
                .order_by('day')
            )

            output = []
            for lp in lesson_plans:
                output.append({
                    "day": lp.day,
                    "learning_outcomes": lp.learning_outcomes,
                    "real_world_applications": lp.real_world_applications,
                    "taxonomy_alignment": lp.taxonomy_alignment,
                    "status": lp.status,
                    "completed_date": lp.updated_at if lp.status == 'completed' else None,
                    "topics": [
                        {
                            "title": t.title,
                            "summary": t.summary,
                            "time_minutes": t.time_minutes
                        }
                        for t in lp.school_lesson_topics.all()
                    ]
                })
            return JsonResponse({"data": output}, status=200)

        except Exception as e:
            logger.error(
                "Error fetching lesson plan details for class_section %s and chapter %s: %s",
                class_section_id, chapter_id, e
            )
            return JsonResponse({"error": "Failed to fetch lesson plan details"}, status=500)

    def get_teacher_progress(self):
        """
        Computes teacher-wise subject progress using aggregated queries to minimize DB hits.
        """
        try:
            school_id = self.request.GET.get('school_id')
            if not school_id:
                return JsonResponse({"error": "Missing school_id"}, status=400)

            school_db_name = CommonFunctions.get_school_db_name(school_id)
            if not school_db_name:
                return JsonResponse({"error": "Invalid school ID"}, status=400)

            latest_academic_year = CommonFunctions().get_latest_academic_year(school_db_name)

            # 1️⃣ Get teacher assignments in one query
            assignments = (
                TeacherSubjectAssignment.objects.using(school_db_name)
                .filter(academic_year=latest_academic_year)
                .select_related('subject', 'school_class')
                .values(
                    'teacher_id',
                    'subject_id',
                    'school_class__id',
                    'school_class__class_instance_id',
                    'school_class__board_id',
                    'school_class__section'
                )
            )
            if not assignments:
                return JsonResponse({"data": []}, status=200)

            teacher_ids = list({a['teacher_id'] for a in assignments})

            # 2️⃣ Preload teacher names
            teachers = User.objects.filter(id__in=teacher_ids).values('id', 'first_name', 'last_name')
            teacher_names_map = {t['id']: f"{t['first_name']} {t['last_name']}".strip() for t in teachers}

            # 3️⃣ Fetch all chapters for relevant classes/subjects/boards
            chapters = (
                SchoolChapter.objects.using(school_db_name)
                .filter(
                    academic_year=latest_academic_year,
                    class_number_id__in={a['school_class__class_instance_id'] for a in assignments},
                    subject_id__in={a['subject_id'] for a in assignments},
                    school_board_id__in={a['school_class__board_id'] for a in assignments},
                )
                .values('id', 'class_number_id', 'subject_id', 'school_board_id')
            )
            chapters_map = {}
            for ch in chapters:
                key = (ch['class_number_id'], ch['subject_id'], ch['school_board_id'])
                chapters_map.setdefault(key, []).append(ch['id'])

            # 4️⃣ Fetch lesson plan completion info (aggregated)
            lesson_progress = (
                SchoolLessonPlanDay.objects.using(school_db_name)
                .filter(
                    chapter_id__in=[ch['id'] for ch in chapters],
                    class_section_id__in={a['school_class__id'] for a in assignments}
                )
                .values('chapter_id', 'class_section_id')
                .annotate(
                    total_days=Count('id'),
                    completed_days=Count('id', filter=Q(status='completed'))
                )
            )

            lesson_progress_map = {}
            for lp in lesson_progress:
                lesson_progress_map[(lp['chapter_id'], lp['class_section_id'])] = lp

            # 5️⃣ Calculate progress
            results = []
            for teacher_id in teacher_ids:
                teacher_assignments = [a for a in assignments if a['teacher_id'] == teacher_id]
                num_classes = len(teacher_assignments)
                if num_classes == 0:
                    continue

                class_weight = 100 / num_classes
                total_progress = 0
                classes = []
                for a in teacher_assignments:
                    key = (a['school_class__class_instance_id'], a['subject_id'], a['school_class__board_id'])
                    class_chapters = chapters_map.get(key, [])
                    num_chapters = len(class_chapters)
                    if num_chapters == 0:
                        continue

                    chapter_weight = class_weight / num_chapters
                    class_progress = 0

                    for chapter_id in class_chapters:
                        lp = lesson_progress_map.get((chapter_id, a['school_class__id']))
                        if not lp or lp['total_days'] == 0:
                            continue
                        chapter_progress = (lp['completed_days'] / lp['total_days']) * chapter_weight
                        class_progress += chapter_progress

                    total_progress += class_progress
                    classes.append(f"{a['school_class__class_instance_id']}-{a['school_class__section']}")

                results.append({
                    "teacher_id": teacher_id,
                    "teacher_name": teacher_names_map.get(teacher_id, "Unknown Teacher"),
                    "completion_percentage": round(total_progress, 2),
                    "classes": classes
                })

            return JsonResponse({"data": results}, status=200)

        except Exception as e:
            logger.error("Error generating teacher subject progress: %s", e, exc_info=True)
            return JsonResponse({"error": "Failed to generate teacher subject progress"},
                                status=500)

    def get_teacher_subject_progress(self):
        """
        Returns all classes assigned to a teacher for a given subject (and board) with progress.
        Uses bulk queries and in-memory aggregation to minimize DB hits.
        """
        try:
            school_id = self.request.GET.get('school_id')
            teacher_id = self.request.GET.get('teacher_id')
            if not (teacher_id and school_id):
                return JsonResponse({"error": "Missing parameters"}, status=400)

            school_db_name = CommonFunctions.get_school_db_name(school_id)
            if not school_db_name:
                return JsonResponse({"error": "Invalid school ID"}, status=400)

            latest_academic_year = CommonFunctions().get_latest_academic_year(school_db_name)
            boards_dict = CommonFunctions().get_boards_dict()

            # 1️⃣ Get all teacher assignments
            assignments = (
                TeacherSubjectAssignment.objects.using(school_db_name)
                .filter(teacher_id=teacher_id, academic_year=latest_academic_year)
                .select_related('subject', 'school_class')
                .values(
                    'id',
                    'subject_id',
                    'subject__name',
                    'school_class__id',
                    'school_class__class_instance_id',
                    'school_class__section',
                    'school_class__board_id'
                )
            )
            if not assignments:
                return JsonResponse({"data": []}, status=200)

            # Build lookup sets for filtering
            class_ids = {a['school_class__id'] for a in assignments}
            subject_ids = {a['subject_id'] for a in assignments}
            board_ids = {a['school_class__board_id'] for a in assignments}
            class_instance_ids = {a['school_class__class_instance_id'] for a in assignments}

            # 2️⃣ Fetch all chapters (bulk)
            chapters = (
                SchoolChapter.objects.using(school_db_name)
                .filter(
                    academic_year=latest_academic_year,
                    class_number_id__in=class_instance_ids,
                    subject_id__in=subject_ids,
                    school_board_id__in=board_ids,
                )
                .values('id', 'class_number_id', 'subject_id', 'school_board_id')
            )

            # Map chapters to their class-subject-board combination
            chapter_map = {}
            for ch in chapters:
                key = (ch['class_number_id'], ch['subject_id'], ch['school_board_id'])
                chapter_map.setdefault(key, []).append(ch['id'])

            # 3️⃣ Fetch all lesson plan day stats in one aggregated query
            lesson_progress = (
                SchoolLessonPlanDay.objects.using(school_db_name)
                .filter(chapter_id__in=[c['id'] for c in chapters], class_section_id__in=class_ids)
                .values('chapter_id', 'class_section_id')
                .annotate(
                    total_days=Count('id'),
                    completed_days=Count('id', filter=Q(status='completed'))
                )
            )

            # Map (chapter, class_section) → {total_days, completed_days}
            lesson_map = {
                (lp['chapter_id'], lp['class_section_id']): lp
                for lp in lesson_progress
            }

            # 4️⃣ Compute results
            results = []
            for a in assignments:
                key = (a['school_class__class_instance_id'], a['subject_id'], a['school_class__board_id'])
                chapter_ids = chapter_map.get(key, [])
                if not chapter_ids:
                    completion = 0
                else:
                    chapter_weight = 100 / len(chapter_ids)
                    total_progress = 0

                    for chapter_id in chapter_ids:
                        lp = lesson_map.get((chapter_id, a['school_class__id']))
                        if lp and lp['total_days'] > 0:
                            total_progress += (lp['completed_days'] / lp['total_days']) * chapter_weight

                    completion = round(total_progress, 2)

                results.append({
                    "class_section_id": a['school_class__id'],
                    "class_number": a['school_class__class_instance_id'],
                    "class_section": a['school_class__section'],
                    "subject_id": a['subject_id'],
                    "subject_name": a['subject__name'],
                    "board_id": a['school_class__board_id'],
                    "board_name": boards_dict.get(a['school_class__board_id'], 'Unknown Board'),
                    "completion_percentage": completion,
                })

            return JsonResponse({"data": results}, status=200)

        except Exception as e:
            logger.error("Error fetching assignments: %s", e, exc_info=True)
            return JsonResponse({"error": "Failed to fetch assignments"}, status=500)

