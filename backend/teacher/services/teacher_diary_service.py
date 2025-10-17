"""Teacher Diary Service"""

import logging
from datetime import date
from datetime import datetime
from django.http import JsonResponse
from teacher.models import TeacherDiary, TeacherSubjectAssignment

from core.models import User
from core.common_modules.common_functions import CommonFunctions
from classes.models import SchoolSection

logger = logging.getLogger(__name__)


class TeacherDiaryService:
    """Service class for managing teacher diaries."""

    def __init__(self, request):
        self.request = request

    def get_teacher_diary_kpis(self):
        """Retrieve key performance indicators for teacher diaries."""
        try:
            school_id = self.request.GET.get('school_id')
            if not school_id:
                return JsonResponse({"error": "Missing school_id"}, status=400)

            # Get DB name
            school_db_name = CommonFunctions().get_school_db_name(school_id)
            if not school_db_name:
                return JsonResponse({"error": "Invalid school ID"}, status=400)

            # Get latest academic year
            academic_year_obj = CommonFunctions().get_latest_academic_year(school_db_name)
            if not academic_year_obj:
                return JsonResponse({"error": "No academic year found for the school"}, status=400)

            today = date.today()

            # All teacher assignments for this academic year
            all_assignments = TeacherSubjectAssignment.objects.using(school_db_name).filter(
                academic_year=academic_year_obj,
                teacher__is_active=True
            ).select_related("teacher", "school_class", "subject")

            # Group assignments per teacher
            teacher_assignments = {}
            for assign in all_assignments:
                teacher_id = assign.teacher.teacher_id
                teacher_assignments.setdefault(teacher_id, []).append(assign)

            board_dict = CommonFunctions().get_boards_dict()
            total_teachers = len(teacher_assignments)
            submitted_teachers = 0
            pending_teachers = 0
            pending_teacher_list = {}

            # Iterate over each teacher and check diary submission
            for teacher_id, assignments in teacher_assignments.items():
                # Group assignments per class-section for the teacher
                class_subject_map = {}
                for a in assignments:
                    class_subject_map.setdefault(a.school_class.id, []).append(a.subject.id)

                # Get all diary entries of this teacher for today
                diaries_today = TeacherDiary.objects.using(school_db_name).filter(
                    teacher_id=teacher_id,
                    academic_year=academic_year_obj,
                    date=today
                )

                # Map submitted subjects per class-section
                submitted_map = {}
                for d in diaries_today.filter(status='submitted'):
                    submitted_map.setdefault(d.school_class_section_id, set()).add(d.subject_id)

                pending_classes = []
                for class_id, assigned_subjects in class_subject_map.items():
                    submitted_subjects = submitted_map.get(class_id, set())
                    # If not all assigned subjects are submitted, class is pending
                    if set(assigned_subjects) - submitted_subjects:
                        pending_classes.append(class_id)

                if not pending_classes:
                    submitted_teachers += 1
                else:
                    pending_teachers += 1
                    pending_teacher_list[teacher_id] = [
                        f"{section.class_instance_id} - {section.section} ({board_dict.get(section.board_id, 'Unknown')})"
                        for section in SchoolSection.objects.using(school_db_name).filter(id__in=pending_classes)
                    ]
            teacher_objs = User.objects.filter(id__in=pending_teacher_list.keys()).values("id", "first_name", "last_name")
            teacher_name_map = {t["id"]: f"{t['first_name']} {t['last_name']}" for t in teacher_objs}
            pending_teacher_list = {teacher_name_map[tid]: classes for tid, classes in pending_teacher_list.items()}

            kpis = {
                "total_teachers": total_teachers,
                "submitted_teachers": submitted_teachers,
                "pending_teachers": pending_teachers,
                "pending_teacher_list": pending_teacher_list
            }

            return JsonResponse({"data": kpis}, status=200)

        except Exception as e:
            logger.exception(f"Error retrieving diary KPIs: {e}")
            return JsonResponse({"error": "Internal server error"}, status=500)

    
    def get_diary_by_class_section_and_date(self):
        """Retrieve diary entries for a specific class section and date (optimized)."""
        try:
            class_section_id = self.request.GET.get('class_section_id')
            school_id = self.request.GET.get('school_id')
            date = self.request.GET.get('date')

            if not class_section_id or not date or not school_id:
                return JsonResponse({"error": "Required parameters are missing"}, status=400)

            school_db_name = CommonFunctions().get_school_db_name(school_id)
            if not school_db_name:
                return JsonResponse({"error": "Invalid school ID"}, status=400)

            academic_year_obj = CommonFunctions().get_latest_academic_year(school_db_name)
            if not academic_year_obj:
                return JsonResponse({"error": "No academic year found for the school"}, status=400)

            if datetime.strptime(date, "%Y-%m-%d").date() == datetime.today().date():
                assignments = list(
                    TeacherSubjectAssignment.objects.using(school_db_name)
                    .filter(school_class_id=class_section_id, academic_year=academic_year_obj,teacher__is_active=True)
                    .select_related("teacher", "subject")
                )



                existing_diaries = TeacherDiary.objects.using(school_db_name).filter(
                    school_class_section_id=class_section_id,
                    date=date,
                    academic_year=academic_year_obj,
                ).values_list("subject_id", flat=True)

                existing_subject_ids = set(existing_diaries)

                new_diaries = [
                    TeacherDiary(
                        teacher=assignment.teacher,
                        subject=assignment.subject,
                        school_class_section_id=class_section_id,
                        date=date,
                        academic_year=academic_year_obj,
                    )
                    for assignment in assignments
                    if assignment.subject_id not in existing_subject_ids
                ]

                if new_diaries:
                    TeacherDiary.objects.using(school_db_name).bulk_create(new_diaries)

            diaries = (
                TeacherDiary.objects.using(school_db_name)
                .filter(
                    school_class_section_id=class_section_id,
                    date=date,
                    academic_year=academic_year_obj,
                )
                .select_related("subject", "teacher")
                .order_by("subject__name")
            )
            teacher_ids = [diary.teacher_id for diary in diaries]
            teacher_user_objs = User.objects.filter(id__in=teacher_ids).values("id", "first_name", "last_name")
            teacher_dict = {user["id"]: f"{user['first_name']} {user['last_name']}" for user in teacher_user_objs}
            output = [
                {
                    "diary_id": d.id,
                    "teacher_id": d.teacher.teacher_id,
                    "teacher_name": teacher_dict.get(d.teacher.teacher_id, "Unknown"),
                    "subject_id": d.subject.id,
                    "subject_name": d.subject.name,
                    "notes": d.notes,
                    "homework_assigned": d.homework_assigned,
                    "date": d.date,
                    "status": d.status,
                    "is_admin_reviewed": d.is_admin_reviewed,
                    "created_at": d.created_at,
                    "updated_at": d.updated_at,
                }
                for d in diaries
            ]

            return JsonResponse({"data": output}, status=200)

        except Exception as e:
            logger.exception(f"Error retrieving diaries: {e}")
            return JsonResponse({"error": "Internal server error"}, status=500)
    
    def get_diary_by_teacher_and_date(self):
        """Retrieve diary entries for a specific teacher and date."""
        try:
            teacher_id = self.request.GET.get('teacher_id')
            school_id = self.request.GET.get('school_id')
            date = self.request.GET.get('date')

            if not teacher_id or not date or not school_id:
                return JsonResponse({"error": "Required parameters are missing"}, status=400)

            school_db_name = CommonFunctions().get_school_db_name(school_id)
            if not school_db_name:
                return JsonResponse({"error": "Invalid school ID"}, status=400)

            academic_year_obj = CommonFunctions().get_latest_academic_year(school_db_name)
            if not academic_year_obj:
                return JsonResponse({"error": "No academic year found for the school"}, status=400)

            if datetime.strptime(date, "%Y-%m-%d").date() == datetime.today().date():
                assignments = list(
                    TeacherSubjectAssignment.objects.using(school_db_name)
                    .filter(teacher_id=teacher_id, academic_year=academic_year_obj)
                    .select_related("school_class", "subject")
                )

                if not assignments:
                    return JsonResponse({"data": [], "message": "No subject assignments found for this teacher."}, status=200)

                existing_diaries = TeacherDiary.objects.using(school_db_name).filter(
                    teacher_id=teacher_id,
                    date=date,
                    academic_year=academic_year_obj,
                ).values_list("subject_id", "school_class_section_id")

                existing_entries = set(existing_diaries)

                new_diaries = [
                    TeacherDiary(
                        teacher_id=teacher_id,
                        subject=assignment.subject,
                        school_class_section=assignment.school_class,
                        date=date,
                        academic_year=academic_year_obj,
                    )
                    for assignment in assignments
                    if (assignment.subject_id, assignment.school_class_id) not in existing_entries
                ]

                if new_diaries:
                    TeacherDiary.objects.using(school_db_name).bulk_create(new_diaries)

            diaries = (
                TeacherDiary.objects.using(school_db_name)
                .filter(
                    teacher_id=teacher_id,
                    date=date,
                    academic_year=academic_year_obj,
                )
                .select_related("subject", "teacher", "school_class_section")
                .order_by("subject__name")
            )

            boards_dict = CommonFunctions().get_boards_dict()
            output = [
                {
                    "diary_id": d.id,
                    "teacher_id": d.teacher.teacher_id,
                    "teacher_name": d.teacher.full_name,
                    "subject_id": d.subject.id,
                    "subject_name": d.subject.name,
                    "class_section_id": d.school_class_section.id,
                    "class_section": d.school_class_section.section,
                    "class_number": d.school_class_section.class_instance_id,
                    "board_id": d.school_class_section.board_id,
                    "board_name": boards_dict.get(d.school_class_section.board_id, "Unknown"),
                    "notes": d.notes,
                    "homework_assigned": d.homework_assigned,
                    "date": d.date,
                    "status": d.status,
                    "is_admin_reviewed": d.is_admin_reviewed,
                    "created_at": d.created_at,
                    "updated_at": d.updated_at,
                }
                for d in diaries
            ]

            return JsonResponse({"data": output}, status=200)

        except Exception as e:
            logger.exception(f"Error retrieving diaries: {e}")
            return JsonResponse({"error": "Internal server error"}, status=500)

    def save_or_update_diary(self):
        """Save or update a diary entry."""
        try:
            data = self.request.data
            diary_id = data.get("diary_id")
            notes = data.get("notes")
            homework_assigned = data.get("homework_assigned")
            school_id = data.get("school_id")

            if not notes or not diary_id or not school_id:
                return JsonResponse({"error": "Missing required fields"}, status=400)
            
            school_db_name = CommonFunctions().get_school_db_name(school_id)
            if not school_db_name:
                return JsonResponse({"error": "Invalid school ID"}, status=400)

            diary_entry = TeacherDiary.objects.using(
                school_db_name
            ).get(
                id=diary_id
            )

            if diary_entry.is_admin_reviewed:
                return JsonResponse({"error": "Cannot update a diary entry that has been reviewed by admin"}, status=400)

            diary_entry.notes = notes
            diary_entry.homework_assigned = homework_assigned
            diary_entry.status = 'submitted'

            diary_entry.save(using=school_db_name)

            return JsonResponse({"message": "Diary entry updated successfully"}, status=200)

        except TeacherDiary.DoesNotExist:
            return JsonResponse({"error": "Diary entry not found"}, status=404)
        except Exception as e:
            logger.exception("Error updating diary entry: %s", e)
            return JsonResponse({"error": "Internal server error"}, status=500)

    def mark_diary_as_reviewed(self):
        """Mark a diary entry as reviewed by admin."""
        try:
            data = self.request.data
            diary_id = data.get("diary_id")
            school_id = data.get("school_id")
            if not diary_id or not school_id:
                return JsonResponse({"error": "Missing Required Fields"}, status=400)
            school_db_name = CommonFunctions().get_school_db_name(school_id)
            if not school_db_name:
                return JsonResponse({"error": "Invalid school ID"}, status=400)
            diary_entry = TeacherDiary.objects.using(
                school_db_name
            ).get(
                id=diary_id
            )
            diary_entry.is_admin_reviewed = True
            diary_entry.save(using=school_db_name)
            return JsonResponse({"message": "Diary entry marked as reviewed"}, status=200)
        except TeacherDiary.DoesNotExist:
            return JsonResponse({"error": "Diary entry not found"}, status=404)
        except Exception as e:  
            logger.exception("Error marking diary as reviewed: %s", e)
            return JsonResponse({"error": "Internal server error"}, status=500)


    def mark_all_diary_as_reviewed_by_class_section_id(self):
        """Mark all diary entries for a specific date and class section as reviewed by admin."""
        try:
            data = self.request.data
            class_section_id = data.get("class_section_id")
            date = data.get("date")
            school_id = data.get("school_id")

            if not class_section_id or not date or not school_id:
                return JsonResponse({"error": "Missing Required Fields"}, status=400)

            school_db_name = CommonFunctions().get_school_db_name(school_id)
            if not school_db_name:
                return JsonResponse({"error": "Invalid school ID"}, status=400)

            academic_year_obj = CommonFunctions().get_latest_academic_year(school_db_name)
            if not academic_year_obj:
                return JsonResponse({"error": "No academic year found for the school"}, status=400)

            updated_count = TeacherDiary.objects.using(
                school_db_name
            ).filter(
                school_class_section_id=class_section_id,
                date=date,
                academic_year=academic_year_obj
            ).update(is_admin_reviewed=True)

            return JsonResponse({"message": f"{updated_count} diary entries marked as reviewed"}, status=200)
        except Exception as e:  
            logger.exception("Error marking all diaries as reviewed: %s", e)
            return JsonResponse({"error": "Internal server error"}, status=500)
