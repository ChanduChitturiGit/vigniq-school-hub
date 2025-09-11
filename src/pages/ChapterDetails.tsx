import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Lightbulb,
  Plus,
  Edit3,
  CheckCircle2,
  Save,
  X,
  Eye,
  MessageSquare,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Circle,
  Loader2Icon,
  LoaderCircleIcon,
  TimerIcon,
  FileCheck
} from 'lucide-react';
import { getGradeByChapter, saveTopicByLesson, editTopicByLesson, savePrerequisite, editPrerequisiteByLesson, getChapterDetailsById } from '../services/grades'
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


interface Topic {
  sub_topic_id: number;
  sub_topic: string;
  completed?: boolean;
}

interface Prerequisite {
  prerequisite_id: number;
  topic: string;
  explanation: string;
}

interface LessonPlanDay {
  lesson_plan_day_id: number;
  day: number;
  status: string;
}

type LessonPlan = LessonPlanDay[];

const ChapterDetails: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const { chapterId } = useParams();
  const [searchParams] = useSearchParams();
  const className = searchParams.get('class') || '';
  const section = searchParams.get('section') || '';
  const subject = searchParams.get('subject') || '';
  const chapterName = searchParams.get('chapter_name') || '';
  const chapterNumber = searchParams.get('chapter_number') || '';
  const progress = parseInt(searchParams.get('progress') || '0');
  const classId = searchParams.get('class_id') || '';
  const subjectId = searchParams.get('subject_id') || '';
  const schoolId = searchParams.get('school_id') || '';
  const boardId = searchParams.get('school_board_id') || '';
  const tab = searchParams.get('tab') || '';
  const pathData = `class=${className}&class_id=${classId}&section=${section}&subject=${subject}&subject_id=${subjectId}&school_board_id=${boardId}&school_id=${schoolId}`


  const [topics, setTopics] = useState<Topic[]>([]);
  const [prerequisites, setPrerequisites] = useState<Prerequisite[]>([]);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan>([]);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [showAddPrerequisite, setShowAddPrerequisite] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editingPrerequisite, setEditingPrerequisite] = useState<Prerequisite | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newPrerequisiteTitle, setNewPrerequisiteTitle] = useState('');
  const [newPrerequisiteExplanation, setNewPrerequisiteExplanation] = useState('');

  const breadcrumbItems = [
    { label: 'Grades', path: '/grades' },
    { label: `${subject} - ${className}`, path: `/grades/syllabus?class=${className}&section=${section}&subject=${subject}` },
    { label: `Chapter ${chapterNumber}: ${chapterName}` }
  ];

  // const sampleTopics: Topic[] = [
  //   { sub_topic_id: 1, sub_topic: 'Introduction to Real Numbers', completed: true },
  //   { sub_topic_id: 2, sub_topic: 'Rational and Irrational Numbers', completed: true },
  //   { sub_topic_id: 3, sub_topic: 'Decimal Representation', completed: false },
  //   { sub_topic_id: 4, sub_topic: 'Operations on Real Numbers', completed: false },
  //   { sub_topic_id: 5, sub_topic: 'Laws of Exponents', completed: false }
  // ];

  // const samplePrerequisites: Prerequisite[] = [
  //   {
  //     prerequisite_id: 1,
  //     topic: 'Basic Algebra and Squaring',
  //     explanation: 'Understanding basic algebraic manipulation and the concept of squaring a number is crucial for following the proofs in this chapter. **Basic Algebra:** This involves working with variables (like \'a\' or \'b\'), performing operations (addition, subtraction, multiplication, division) with them, and solving simple equations. **Squaring:** Multiplying a number by itself. For example, \'a squared\' (a²) means a × a. Example: - If a = 5, then a² = 5 × 5 = 25. - If you have an equation like b² = 2c², you should understand that if 2 divprerequisite_ides b², it implies something about b.'
  //   },
  //   {
  //     prerequisite_id: 2,
  //     topic: 'Coprime Numbers (Relatively Prime)',
  //     explanation: 'Two numbers are coprime if their greatest common divisor (GCD) is 1. This concept is fundamental in proofs involving rational numbers.'
  //   },
  //   {
  //     prerequisite_id: 3,
  //     topic: 'Highest Common Factor (HCF) and Least Common Multiple (LCM)',
  //     explanation: 'Understanding HCF and LCM is essential for simplifying fractions and understanding rational number properties.'
  //   }
  // ];

  // const sampleLessonPlan: LessonPlan = [
  //   { lesson_plan_day_id: 1, day: 1, status: "not_started" },
  //   { lesson_plan_day_id: 2, day: 2, status: "not_started" },
  //   { lesson_plan_day_id: 3, day: 3, status: "not_started" },
  //   { lesson_plan_day_id: 4, day: 4, status: "not_started" },
  //   { lesson_plan_day_id: 5, day: 5, status: "not_started" }
  // ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'pending':
        return AlertCircle;
      default:
        return TimerIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-orange-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getGradesData = async () => {
    try {
      const data = {
        class_section_id: classId,
        subject_id: subjectId,
        chapter_id: chapterId,
        school_id: schoolId,
        school_board_id: boardId
      };
      // localStorage.setItem('gradesData', JSON.stringify(data));
      const response = await getChapterDetailsById(data);
      if (response && response.data) {
        setTopics(response.data.sub_topics);
        setPrerequisites(response.data.prerequisites);
        setLessonPlan(response.data.lesson_plan_days);
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }


  //save topic by lesson
  const saveTopic = async (data: any) => {
    try {
      const payload = {
        class_section_id: Number(classId),
        subject_id: Number(subjectId),
        school_id: Number(schoolId),
        school_board_id: Number(boardId),
        chapter_id: Number(chapterId),
        sub_topic: data.sub_topic
      };
      const response = await saveTopicByLesson(payload);
      if (response && response.message) {
        getGradesData();
        showSnackbar({
          title: "✅ Success",
          description: `${response.message}`,
          status: "success"
        });
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }


  //edit topic by lesson
  const editTopic = async (data: any) => {
    try {
      const payload = {
        class_section_id: Number(classId),
        subject_id: Number(subjectId),
        school_id: Number(schoolId),
        school_board_id: Number(boardId),
        chapter_id: Number(chapterId),
        sub_topic_id: data.sub_topic_id,
        sub_topic: data.sub_topic
      };
      const response = await editTopicByLesson(payload);
      if (response && response.message) {
        getGradesData();
        showSnackbar({
          title: "✅ Success",
          description: `${response.message}`,
          status: "success"
        });
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }


  //save prerequiste by lesson
  const savePrerequisteData = async (data: any) => {
    try {
      const payload = {
        class_section_id: Number(classId),
        subject_id: Number(subjectId),
        school_id: Number(schoolId),
        school_board_id: Number(boardId),
        chapter_id: Number(chapterId),
        topic: data.topic,
        explanation: data.explanation
      };
      const response = await savePrerequisite(payload);
      if (response && response.message) {
        getGradesData();
        showSnackbar({
          title: "✅ Success",
          description: `${response.message}`,
          status: "success"
        });
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }

  //edit prerequisite by lesson
  const editPrerequisite = async (data: any) => {
    try {
      const payload = {
        class_section_id: Number(classId),
        subject_id: Number(subjectId),
        school_id: Number(schoolId),
        school_board_id: Number(boardId),
        chapter_id: Number(chapterId),
        prerequisite_id: data.prerequisite_id,
        topic: data.topic,
        explanation: data.explanation
      };
      const response = await editPrerequisiteByLesson(payload);
      if (response && response.message) {
        getGradesData();
        showSnackbar({
          title: "✅ Success",
          description: `${response.message}`,
          status: "success"
        });
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }


  useEffect(() => {
    getGradesData();
  }, []);

  const handleAddTopic = () => {
    if (newTopicTitle.trim()) {
      const newTopic: Topic = {
        sub_topic_id: Math.max(...topics.map(t => t.sub_topic_id)) + 1,
        sub_topic: newTopicTitle.trim(),
        completed: false
      };
      saveTopic(newTopic);
      //setTopics([...topics, newTopic]);
      setNewTopicTitle('');
      setShowAddTopic(false);
    }
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setNewTopicTitle(topic.sub_topic);
  };

  const handleSaveTopicEdit = () => {
    if (editingTopic && newTopicTitle.trim()) {
      editTopic({sub_topic_id: editingTopic.sub_topic_id, sub_topic: newTopicTitle.trim()});
      setEditingTopic(null);
      setNewTopicTitle('');
    }
  };

  const handleAddPrerequisite = () => {
    if (newPrerequisiteTitle.trim() && newPrerequisiteExplanation.trim()) {
      const newPrerequisite: any = {
        topic: newPrerequisiteTitle.trim(),
        explanation: newPrerequisiteExplanation.trim()
      };
      savePrerequisteData(newPrerequisite);
      //setPrerequisites([...prerequisites, newPrerequisite]);
      setNewPrerequisiteTitle('');
      setNewPrerequisiteExplanation('');
      setShowAddPrerequisite(false);
    }
  };

  const handleEditPrerequisite = (prerequisite: Prerequisite) => {
    setEditingPrerequisite(prerequisite);
    setNewPrerequisiteTitle(prerequisite.topic);
    setNewPrerequisiteExplanation(prerequisite.explanation);
  };

  const handleSavePrerequisiteEdit = () => {
    if (editingPrerequisite && newPrerequisiteTitle.trim() && newPrerequisiteExplanation.trim()) {
      // setPrerequisites(prerequisites.map(p =>
      //   p.prerequisite_id === editingPrerequisite.prerequisite_id
      //     ? { ...p, topic: newPrerequisiteTitle.trim(), explanation: newPrerequisiteExplanation.trim() }
      //     : p
      // ));
      editPrerequisite({prerequisite_id: editingPrerequisite.prerequisite_id, topic: newPrerequisiteTitle.trim(), explanation: newPrerequisiteExplanation.trim()});
      setEditingPrerequisite(null);
      setNewPrerequisiteTitle('');
      setNewPrerequisiteExplanation('');
    }
  };

  const completedTopics = topics.filter(topic => topic.completed).length;
  const totalTopics = topics.length;

  return (
    <MainLayout pageTitle={`${subject} - Chapter ${chapterNumber}: ${chapterName} ( ${className} - ${section})`}>
      <div className="space-y-8">
        {/* <Breadcrumb items={breadcrumbItems} /> */}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <Link
            to={`/grades/syllabus/${chapterId}?${pathData}`}
            className="max-w-fit flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Subject</span>
          </Link>
          <div className="text-right">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="text-2xl font-bold text-gray-900">{progress}% Complete</div>
          </div>
        </div>

        {/* Chapter Header */}
        {/* <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">{chapterNumber}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chapter {chapterNumber}: {chapterName}</h1>
              <p className="text-lg text-gray-600">{subject} - {className} - Section {section}</p>
            </div>
          </div>
        </div> */}

        {/* Tabs */}
        <Tabs defaultValue={tab && tab.length>0 ?  tab : `topics`} className="space-y-6">
          <TabsList className="grid md:w-[60%] xl:w-[40%] grid-cols-3 bg-gray-100">
            <TabsTrigger value="topics" className="flex items-center gap-1 md:gap-2">
              <BookOpen className="w-4 h-4" />
              Topics
            </TabsTrigger>
            <TabsTrigger value="lesson-plan" className="flex items-center gap-1 md:gap-2">
              <FileText className="w-4 h-4" />
              Lesson Plan
            </TabsTrigger>
            <TabsTrigger value="prerequisites" className="flex items-center gap-1 md:gap-2">
              <Lightbulb className="w-4 h-4" />
              Prerequisites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topics" className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Chapter Topics</h2>
                <p className="text-gray-600">Manage topics for this chapter</p>
              </div>
              <Dialog open={showAddTopic} onOpenChange={setShowAddTopic}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                    Add Topic
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Topic</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Topic Title
                      </label>
                      <Input
                        value={newTopicTitle}
                        onChange={(e) => setNewTopicTitle(e.target.value)}
                        placeholder="Enter topic title..."
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddTopic(false);
                          setNewTopicTitle('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddTopic} className="bg-blue-600 hover:bg-blue-700">
                        Add Topic
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Inline topic edit card */}
            {editingTopic && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">Edit Topic</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingTopic(null);
                        setNewTopicTitle('');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topic Title
                    </label>
                    <Input
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      placeholder="Enter topic title..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingTopic(null);
                        setNewTopicTitle('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveTopicEdit} className="bg-blue-600 hover:bg-blue-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {topics.map((topic, index) => (
                <Card key={topic.sub_topic_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                          <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{topic.sub_topic}</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* {topic.completed && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )} */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => handleEditTopic(topic)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="lesson-plan" className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Lesson Plan</h2>
                <p className="text-gray-600">Create and manage lesson plans for this chapter</p>
              </div>
              <div className='flex flex-col md:flex-row gap-2'>
                {lessonPlan && lessonPlan.length > 0 ? (
                  <Link to={`/grades/lesson-plan/create/${chapterId}?subject=${subject}&class=${className}&section=${section}&chapter_name=${encodeURIComponent(chapterName)}&${pathData}`}>
                    <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                      <RefreshCw className="w-4 h-4" />
                      Re-generate Lesson Plan
                    </Button>
                  </Link>
                ) : (
                  <Link to={`/grades/lesson-plan/create/${chapterId}?subject=${subject}&class=${className}&section=${section}&chapter_name=${encodeURIComponent(chapterName)}&${pathData}`}>
                    <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4" />
                      Generate Lesson Plan
                    </Button>
                  </Link>
                )}
                {/* <Link
                  to={`/grades/lesson-plan/customize/${chapterId}?subject=${subject}&class=${className}&section=${section}&chapterName=${encodeURIComponent(chapterName)}&${pathData}`}
                >
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <FileCheck className="w-4 h-4 mr-2" />
                    Customize Lesson Plan
                  </Button>
                </Link> */}
              </div>
            </div>

            {lessonPlan && lessonPlan.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lessonPlan.map((day) => {
                  const StatusIcon = getStatusIcon(day.status);
                  const statusColor = getStatusColor(day.status);
                  return (
                    <Card key={day.lesson_plan_day_id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Day {day.day}</h3>
                            {/* <p className="text-sm text-gray-500">{day.status}</p> */}
                            <div className='flex gap-1 items-center'>
                              <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                              <span className={`text-xs font-medium ${statusColor}`}>
                                {day.status === 'completed' ? 'Completed' : day.status === 'pending' ? 'Pending' : 'Not Started'}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 space-y-2">
                            <Link
                              to={`/grades/lesson-plan/day/${chapterId}/${day.lesson_plan_day_id}?subject=${subject}&class=${className}&section=${section}&chapter_name=${encodeURIComponent(chapterName)}&day=${day.day}&${pathData}&status=${day.status}`}
                              className="w-full"
                            >
                              <Button variant="outline" className="w-full flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                                <Eye className="w-4 h-4" />
                                View
                              </Button>
                            </Link>

                            <Link
                              to={`/grades/lesson-plan/ai-chat/${chapterId}/${day.day}?subject=${subject}&class=${className}&section=${section}&chapter_name=${encodeURIComponent(chapterName)}&${pathData}`}
                              className="w-full"
                            >
                              <Button className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                                <MessageSquare className="w-4 h-4" />
                                Chat with AI Assistant
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
                }
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Lesson Plan Available</h3>
                  <p className="text-gray-500 mb-4">
                    Generate a lesson plan for this chapter to get started with structured teaching.
                  </p>
                  <Link to={`/grades/lesson-plan/create/${chapterId}?subject=${subject}&class=${className}&section=${section}&chapter_name=${encodeURIComponent(chapterName)}&${pathData}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Create Lesson Plan
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="prerequisites" className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Prerequisites</h2>
                <p className="text-gray-600">Define prerequisites for this chapter</p>
              </div>
              <Dialog open={showAddPrerequisite} onOpenChange={setShowAddPrerequisite}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                    Add Prerequisite
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Prerequisite</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prerequisite Title
                      </label>
                      <Input
                        value={newPrerequisiteTitle}
                        onChange={(e) => setNewPrerequisiteTitle(e.target.value)}
                        placeholder="Enter prerequisite title..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Explanation
                      </label>
                      <Textarea
                        value={newPrerequisiteExplanation}
                        onChange={(e) => setNewPrerequisiteExplanation(e.target.value)}
                        placeholder="Enter detailed explanation..."
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddPrerequisite(false);
                          setNewPrerequisiteTitle('');
                          setNewPrerequisiteExplanation('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddPrerequisite} className="bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {editingPrerequisite && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">Edit Prerequisite</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingPrerequisite(null);
                        setNewPrerequisiteTitle('');
                        setNewPrerequisiteExplanation('');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prerequisite Title
                    </label>
                    <Input
                      value={newPrerequisiteTitle}
                      onChange={(e) => setNewPrerequisiteTitle(e.target.value)}
                      placeholder="Enter prerequisite title..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Explanation
                    </label>
                    <Textarea
                      value={newPrerequisiteExplanation}
                      onChange={(e) => setNewPrerequisiteExplanation(e.target.value)}
                      placeholder="Enter detailed explanation..."
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingPrerequisite(null);
                        setNewPrerequisiteTitle('');
                        setNewPrerequisiteExplanation('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSavePrerequisiteEdit} className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <Accordion type="multiple" className="space-y-4">
                {prerequisites.map((prerequisite) => (
                  <AccordionItem key={prerequisite.prerequisite_id} value={`prerequisite-${prerequisite.prerequisite_id}`} className="border rounded-lg">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <Lightbulb className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-left">{prerequisite.topic}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 mr-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPrerequisite(prerequisite);
                          }}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      {/* <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {prerequisite.explanation}
                      </p> */}
                      <p className="text-sm leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                           {prerequisite.explanation}
                        </ReactMarkdown>
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ChapterDetails;
