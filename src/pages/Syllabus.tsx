import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Edit2,
  Save,
  X,
  BookOpen,
  FileText,
  Eye,
  Lightbulb,
  TrendingUp,
  PlusCircle,
  EditIcon,
  MessageSquare,
  RotateCcw
} from 'lucide-react';
import { getGradeByChapter, getLessonPlanData, getPrerequisitesData } from '../services/grades'
import { useSnackbar } from "../components/snackbar/SnackbarContext";

interface DayPlan {
  day: number;
  date: string;
}

interface Chapter {
  chapter_id: string;
  chapter_name: string;
  chapter_number: number;
  progress: number;
  sub_topics: any[];
  dayPlans: DayPlan[];
  prerequisites: any[];
}

const Syllabus: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  //const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const className = searchParams.get('class') || '';
  const section = searchParams.get('section') || '';
  const subject = searchParams.get('subject') || '';
  const classId = searchParams.get('class_id') || '';
  const subjectId = searchParams.get('subject_id') || '';
  const schoolId = searchParams.get('school_id') || '';
  const boardId = searchParams.get('school_board_id') || '';

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [openChapters, setOpenChapters] = useState<{ [key: string]: boolean }>({});
  const [editingTopic, setEditingTopic] = useState<{ chapterId: string; topicIndex: number } | null>(null);
  const [editingPrerequisite, setEditingPrerequisite] = useState<{ chapterId: string; prereqIndex: number } | null>(null);
  const [newTopicText, setNewTopicText] = useState('');
  const [newPrerequisiteTitle, setNewPrerequisiteTitle] = useState('');
  const [newPrerequisiteExplanation, setNewPrerequisiteExplanation] = useState('');
  const [addingTopic, setAddingTopic] = useState<string | null>(null);
  const [addingPrerequisite, setAddingPrerequisite] = useState<string | null>(null);
  //const [chaptersData, setChaptersData] = useState<any[]>([]);
  const [lessonPlanData, setLessonPlanData] = useState<any[]>([]);
  const [prerequisitesData, setPrerequisitesData] = useState<any[]>([]);

  const breadcrumbItems = [
    { label: 'Grades', path: '/grades' },
    { label: `${subject} - ${className} ${section}` }
  ];

  const sampleChapters: Chapter[] = [
    {
      chapter_id: '1',
      chapter_name: 'Knowing Our Numbers',
      chapter_number: 1,
      progress: 75,
      sub_topics: [
        {
          "sub_topic_id": 1,
          "sub_topic": "Euclid's Division Algorithm"
        },
        {
          "sub_topic_id": 2,
          "sub_topic": "Exponents and Logarithms"
        },
        {
          "sub_topic_id": 3,
          "sub_topic": "Fundamental Theorem of Arithmetic"
        },
        {
          "sub_topic_id": 4,
          "sub_topic": "Introduction to Real Numbers"
        },
        {
          "sub_topic_id": 5,
          "sub_topic": "Irrational Numbers"
        },
        {
          "sub_topic_id": 6,
          "sub_topic": "Properties of Logarithms"
        },
        {
          "sub_topic_id": 7,
          "sub_topic": "Rational Numbers and Decimal Expansions"
        }
      ],
      dayPlans: [
        { day: 1, date: 'October 26, 2023' },
        { day: 2, date: 'October 27, 2023' },
        { day: 3, date: 'October 28, 2023' },
        { day: 4, date: 'October 29, 2023' },
        { day: 5, date: 'October 30, 2023' }
      ],
      prerequisites: [
        {
          "prerequisite_id": 6,
          "topic": "Basic Number Systems",
          "explanation": "Familiarity with natural numbers, whole numbers, integers, rational numbers. Understanding different categories of numbers like natural numbers (1, 2, 3...), whole numbers (0, 1, 2, 3...), integers (..., -1, 0, 1,...), and rational numbers (fractions). Sets often categorize these numbers."
        },
        {
          "prerequisite_id": 7,
          "topic": "Logical Thinking/Classification",
          "explanation": "Ability to group objects based on common properties. This involves the ability to identify shared characteristics among items and sort them into groups, or to understand rules that define a collection of items. This is fundamental to defining what belongs in a set."
        }
      ]
    },
    {
      chapter_id: '2',
      chapter_name: 'Whole Numbers',
      chapter_number: 2,
      progress: 45,
      sub_topics: [
        {
          "sub_topic_id": 8,
          "sub_topic": "Cardinality of Sets"
        },
        {
          "sub_topic_id": 9,
          "sub_topic": "Introduction to Sets"
        },
        {
          "sub_topic_id": 10,
          "sub_topic": "Set Operations (Union, Intersection, Difference)"
        },
        {
          "sub_topic_id": 11,
          "sub_topic": "Set Representation (Roster, Set Builder)"
        },
        {
          "sub_topic_id": 12,
          "sub_topic": "Subsets and Equal Sets"
        },
        {
          "sub_topic_id": 13,
          "sub_topic": "Types of Sets (Empty, Finite, Infinite, Universal)"
        },
        {
          "sub_topic_id": 14,
          "sub_topic": "Venn Diagrams"
        }
      ],
      dayPlans: [],
      prerequisites: [
        {
          "prerequisite_id": 6,
          "topic": "Basic Number Systems",
          "explanation": "Familiarity with natural numbers, whole numbers, integers, rational numbers. Understanding different categories of numbers like natural numbers (1, 2, 3...), whole numbers (0, 1, 2, 3...), integers (..., -1, 0, 1,...), and rational numbers (fractions). Sets often categorize these numbers."
        },
        {
          "prerequisite_id": 7,
          "topic": "Logical Thinking/Classification",
          "explanation": "Ability to group objects based on common properties. This involves the ability to identify shared characteristics among items and sort them into groups, or to understand rules that define a collection of items. This is fundamental to defining what belongs in a set."
        }
      ]
    },
    {
      chapter_id: '3',
      chapter_name: 'Playing with Numbers',
      chapter_number: 3,
      progress: 90,
      sub_topics: [
        {
          "sub_topic_id": 8,
          "sub_topic": "Cardinality of Sets"
        },
        {
          "sub_topic_id": 9,
          "sub_topic": "Introduction to Sets"
        },
        {
          "sub_topic_id": 10,
          "sub_topic": "Set Operations (Union, Intersection, Difference)"
        },
        {
          "sub_topic_id": 11,
          "sub_topic": "Set Representation (Roster, Set Builder)"
        },
        {
          "sub_topic_id": 12,
          "sub_topic": "Subsets and Equal Sets"
        },
        {
          "sub_topic_id": 13,
          "sub_topic": "Types of Sets (Empty, Finite, Infinite, Universal)"
        },
        {
          "sub_topic_id": 14,
          "sub_topic": "Venn Diagrams"
        }
      ],
      dayPlans: [
        { day: 1, date: 'November 15, 2023' },
        { day: 2, date: 'November 16, 2023' },
        { day: 3, date: 'November 17, 2023' }
      ],
      prerequisites: [
        {
          "prerequisite_id": 6,
          "topic": "Basic Number Systems",
          "explanation": "Familiarity with natural numbers, whole numbers, integers, rational numbers. Understanding different categories of numbers like natural numbers (1, 2, 3...), whole numbers (0, 1, 2, 3...), integers (..., -1, 0, 1,...), and rational numbers (fractions). Sets often categorize these numbers."
        },
        {
          "prerequisite_id": 7,
          "topic": "Logical Thinking/Classification",
          "explanation": "Ability to group objects based on common properties. This involves the ability to identify shared characteristics among items and sort them into groups, or to understand rules that define a collection of items. This is fundamental to defining what belongs in a set."
        }
      ]
    }
  ];

  const getGradesData = async () => {
    try {
      const data = {
        class_id: classId,
        subject_id: subjectId,
        school_id: schoolId,
        school_board_id: boardId
      };
      const response = await getGradeByChapter(data);
      if (response && response.data) {
        console.log("topics", response);
        //setChapters(response.data);
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }

  const getLessonPlan = async (id: Number) => {
    try {
      const data = {
        class_section_id: classId,
        subject_id: subjectId,
        school_id: schoolId,
        school_board_id: boardId,
        chapter_id: id
      };
      const response = await getLessonPlanData(data);
      if (response && response.data) {
        console.log('lessonData', response);
        setLessonPlanData(response.data);
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }

  const getPrerequisites = async (id: Number) => {
    try {
      const data = {
        class_section_id: classId,
        subject_id: subjectId,
        school_id: schoolId,
        school_board_id: boardId,
        chapter_id: id
      };
      const response = await getPrerequisitesData(data);
      if (response && response.data) {
        console.log('prerequisitesData', response);
        setPrerequisitesData(response.data);
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
    setChapters(sampleChapters);
  }, []);

  const toggleChapter = (chapterId: string) => {
    setOpenChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
    if (!openChapters[chapterId]) {
      getLessonPlan(Number(chapterId));
      getPrerequisites(Number(chapterId));
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-blue-600';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-blue-400';
  };

  const handleTopicEdit = (chapterId: string, topicIndex: number, newValue: string) => {
    setChapters(prev => prev.map(chapter => {
      if (chapter.chapter_id === chapterId) {
        const newTopics = [...chapter.sub_topics];
        newTopics[topicIndex] = newValue;
        return { ...chapter, topics: newTopics };
      }
      return chapter;
    }));
    setEditingTopic(null);
    setNewTopicText('');
  };

  const handlePrerequisiteEdit = (chapterId: string, prereqIndex: number, newTitle: string, newExplanation: string) => {
    setChapters(prev => prev.map(chapter => {
      if (chapter.chapter_id === chapterId) {
        const newPrerequisites = [...chapter.prerequisites];
        newPrerequisites[prereqIndex] = {
          ...newPrerequisites[prereqIndex],
          topic: newTitle,
          explanation: newExplanation
        };
        return { ...chapter, prerequisites: newPrerequisites };
      }
      return chapter;
    }));
    setEditingPrerequisite(null);
    setNewPrerequisiteTitle('');
    setNewPrerequisiteExplanation('');
  };

  const addTopic = (chapterId: string, newTopic: string) => {
    if (newTopic.trim()) {
      setChapters(prev => prev.map(chapter => {
        if (chapter.chapter_id === chapterId) {
          return { ...chapter, topics: [...chapter.sub_topics, newTopic.trim()] };
        }
        return chapter;
      }));
    }
    setAddingTopic(null);
    setNewTopicText('');
  };

  const addPrerequisite = (chapterId: string, newTitle: string, newExplanation: string) => {
    if (newTitle.trim() && newExplanation.trim()) {
      setChapters(prev => prev.map(chapter => {
        if (chapter.chapter_id === chapterId) {
          const newPrerequisite = {
            prerequisite_id: chapter.prerequisites.length + 1,
            topic: newTitle.trim(),
            explanation: newExplanation.trim()
          };
          return { ...chapter, prerequisites: [...chapter.prerequisites, newPrerequisite] };
        }
        return chapter;
      }));
    }
    setAddingPrerequisite(null);
    setNewPrerequisiteTitle('');
    setNewPrerequisiteExplanation('');
  };

  return (
    <MainLayout pageTitle={`${subject} - ${className} ${section}`}>
      <div className="space-y-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">{subject}</h1>
            <p className="text-lg font-medium text-gray-700 mt-1">{className} {section}</p>
            <p className="text-base text-gray-500 mt-1">Manage syllabus content and track progress</p>
          </div>
          <Link
            to={`/grades/progress/${subjectId}?class=${className}&section=${section}&subject=${subject}`}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
          >
            <TrendingUp className="w-5 h-5" />
            View Progress
          </Link>
        </div>

        {/* Chapters */}
        <div className="space-y-6">
          {chapters.map((chapter) => (
            <div key={chapter.chapter_id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <Collapsible
                open={openChapters[chapter.chapter_id]}
                onOpenChange={() => toggleChapter(chapter.chapter_id)}
              >
                <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-medium text-gray-900">
                        Chapter {chapter.chapter_id}: {chapter.chapter_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-32 h-3 bg-gray-200 rounded-full overflow-hidden`}>
                        <div
                          className={`h-full ${getProgressColor(chapter.progress)} transition-all duration-500`}
                          style={{ width: `${chapter.progress}%` }}
                        />
                      </div>
                      <span className="text-base font-medium text-gray-600 min-w-[50px]">{chapter.progress}%</span>
                    </div>
                  </div>
                  {openChapters[chapter.chapter_id] ?
                    <ChevronUp className="w-6 h-6 text-gray-500" /> :
                    <ChevronDown className="w-6 h-6 text-gray-500" />
                  }
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t border-gray-200 p-6">
                    <Tabs defaultValue="topics" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-50 p-1 rounded-lg">
                        <TabsTrigger
                          value="topics"
                          className="text-base py-3 px-6 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all"
                        >
                          Topics
                        </TabsTrigger>
                        <TabsTrigger
                          value="lessonplan"
                          className="text-base py-3 px-6 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all"
                        >
                          Lesson Plan
                        </TabsTrigger>
                        <TabsTrigger
                          value="prerequisites"
                          className="text-base py-3 px-6 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all"
                        >
                          Prerequisites
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="topics" className="mt-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-800">Chapter Topics</h3>
                            <Button
                              onClick={() => setAddingTopic(chapter.chapter_id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                            >
                              <PlusCircle className="w-4 h-4" />
                              Add Topic
                            </Button>
                          </div>

                          {chapter.sub_topics.map((topic, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                              <div className="flex items-center gap-4 flex-1">
                                <span className="text-sm font-medium text-blue-600 bg-blue-200 rounded-full w-7 h-7 flex items-center justify-center">
                                  {index + 1}
                                </span>
                                {editingTopic?.chapterId === chapter.chapter_id && editingTopic?.topicIndex === index ? (
                                  <div className="flex items-center gap-3 flex-1">
                                    <Input
                                      value={newTopicText}
                                      onChange={(e) => setNewTopicText(e.target.value)}
                                      className="flex-1 text-base py-2 border-2 border-blue-300 focus:border-blue-500"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleTopicEdit(chapter.chapter_id, index, newTopicText);
                                        }
                                        if (e.key === 'Escape') {
                                          setEditingTopic(null);
                                          setNewTopicText('');
                                        }
                                      }}
                                      autoFocus
                                    />
                                    <Button
                                      onClick={() => handleTopicEdit(chapter.chapter_id, index, newTopicText)}
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 px-3 py-1"
                                    >
                                      <Save className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        setEditingTopic(null);
                                        setNewTopicText('');
                                      }}
                                      size="sm"
                                      variant="outline"
                                      className="px-3 py-1"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-base text-gray-700">{topic.sub_topic}</span>
                                )}
                              </div>
                              {!editingTopic && (
                                <Button
                                  onClick={() => {
                                    setEditingTopic({ chapterId: chapter.chapter_id, topicIndex: index });
                                    setNewTopicText(topic.sub_topic);
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1"
                                >
                                  <EditIcon className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                              )}
                            </div>
                          ))}

                          {addingTopic === chapter.chapter_id && (
                            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                              <span className="text-sm font-medium text-blue-600 bg-blue-200 rounded-full w-7 h-7 flex items-center justify-center">
                                {chapter.sub_topics.length + 1}
                              </span>
                              <Input
                                value={newTopicText}
                                onChange={(e) => setNewTopicText(e.target.value)}
                                placeholder="Enter new topic..."
                                className="flex-1 text-base py-2 border-2 border-blue-300 focus:border-blue-500"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    addTopic(chapter.chapter_id, newTopicText);
                                  }
                                  if (e.key === 'Escape') {
                                    setAddingTopic(null);
                                    setNewTopicText('');
                                  }
                                }}
                                autoFocus
                              />
                              <Button
                                onClick={() => addTopic(chapter.chapter_id, newTopicText)}
                                className="bg-green-600 hover:bg-green-700 px-3 py-2"
                              >
                                <Save className="w-4 h-4 mr-1" />
                                Save
                              </Button>
                              <Button
                                onClick={() => {
                                  setAddingTopic(null);
                                  setNewTopicText('');
                                }}
                                variant="outline"
                                className="px-3 py-2"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="lessonplan" className="mt-6">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-800">Lesson Plan</h3>
                            <Link
                              to={`/grades/lesson-plan/create/${chapter.chapter_id}?subject=${subject}&class=${className}&section=${section}&chapterName=${encodeURIComponent(chapter.chapter_name)}`}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                            >
                              {chapter.dayPlans.length > 0 ? (
                                <>
                                  <RotateCcw className="w-4 h-4" />
                                  Re-generate Lesson Plan
                                </>
                              ) : (
                                <>
                                  <PlusCircle className="w-4 h-4" />
                                  Create Lesson Plan
                                </>
                              )}
                            </Link>
                          </div>

                          {chapter.dayPlans.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {chapter.dayPlans.map((dayPlan) => (
                                <Card key={dayPlan.day} className="shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                                  <CardContent className="p-4">
                                    <div className="space-y-3">
                                      <div>
                                        <h4 className="text-lg font-semibold text-gray-900">
                                          Day {dayPlan.day}
                                        </h4>
                                        <p className="text-sm text-gray-600">{dayPlan.date}</p>
                                      </div>

                                      <div className="flex flex-col gap-2">
                                        <Link
                                          to={`/grades/lesson-plan/day/${chapter.chapter_id}/${dayPlan.day}?subject=${subject}&class=${className}&section=${section}&chapterName=${encodeURIComponent(chapter.chapter_name)}`}
                                          className="flex items-center justify-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                                        >
                                          <Eye className="w-4 h-4" />
                                          View
                                        </Link>
                                        <Link
                                          to={`/grades/lesson-plan/ai-chat/${chapter.chapter_id}/${dayPlan.day}?subject=${subject}&class=${className}&section=${section}&chapterName=${encodeURIComponent(chapter.chapter_name)}`}
                                          className="flex items-center justify-center gap-2 bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                                        >
                                          <MessageSquare className="w-4 h-4" />
                                          Chat with AI Assistant
                                        </Link>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                              <h4 className="text-lg font-medium text-gray-600 mb-2">No lesson plan created yet</h4>
                              <p className="text-base text-gray-500 mb-4">Create your first lesson plan to get started</p>
                              <Link
                                to={`/grades/lesson-plan/create/${chapter.chapter_id}?subject=${subject}&class=${className}&section=${section}&chapterName=${encodeURIComponent(chapter.chapter_name)}`}
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                              >
                                <PlusCircle className="w-4 h-4" />
                                Create Lesson Plan
                              </Link>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="prerequisites" className="mt-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-800">Prerequisites</h3>
                            <Button
                              onClick={() => setAddingPrerequisite(chapter.chapter_id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                            >
                              <PlusCircle className="w-4 h-4" />
                              Add Prerequisite
                            </Button>
                          </div>

                          {addingPrerequisite === chapter.chapter_id && (
                            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200 space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="prerequisite-title" className="text-sm font-medium text-gray-700">
                                  Prerequisite Title
                                </Label>
                                <Input
                                  id="prerequisite-title"
                                  value={newPrerequisiteTitle}
                                  onChange={(e) => setNewPrerequisiteTitle(e.target.value)}
                                  placeholder="Enter prerequisite title..."
                                  className="text-base py-2 border-2 border-blue-300 focus:border-blue-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="prerequisite-explanation" className="text-sm font-medium text-gray-700">
                                  Explanation
                                </Label>
                                <Textarea
                                  id="prerequisite-explanation"
                                  value={newPrerequisiteExplanation}
                                  onChange={(e) => setNewPrerequisiteExplanation(e.target.value)}
                                  placeholder="Enter detailed explanation..."
                                  className="text-base py-2 border-2 border-blue-300 focus:border-blue-500"
                                  rows={4}
                                />
                              </div>
                              <div className="flex gap-3">
                                <Button
                                  onClick={() => addPrerequisite(chapter.chapter_id, newPrerequisiteTitle, newPrerequisiteExplanation)}
                                  className="bg-green-600 hover:bg-green-700 px-4 py-2"
                                  disabled={!newPrerequisiteTitle.trim() || !newPrerequisiteExplanation.trim()}
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  Save
                                </Button>
                                <Button
                                  onClick={() => {
                                    setAddingPrerequisite(null);
                                    setNewPrerequisiteTitle('');
                                    setNewPrerequisiteExplanation('');
                                  }}
                                  variant="outline"
                                  className="px-4 py-2"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}

                          {chapter.prerequisites.length > 0 && (
                            <Accordion type="single" collapsible className="space-y-2">
                              {chapter.prerequisites.map((prerequisite, index) => (
                                <AccordionItem 
                                  key={index} 
                                  value={`prerequisite-${index}`}
                                  className="bg-blue-50 rounded-lg border border-blue-200 px-4"
                                >
                                  <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex items-center gap-3 text-left">
                                      <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                      <span className="text-base font-medium text-gray-800">
                                        {prerequisite.topic}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                      {!editingPrerequisite && (
                                        <Button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingPrerequisite({ chapterId: chapter.chapter_id, prereqIndex: index });
                                            setNewPrerequisiteTitle(prerequisite.topic);
                                            setNewPrerequisiteExplanation(prerequisite.explanation);
                                          }}
                                          variant="ghost"
                                          size="sm"
                                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-2 py-1"
                                        >
                                          <EditIcon className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="pb-4">
                                    {editingPrerequisite?.chapterId === chapter.chapter_id && editingPrerequisite?.prereqIndex === index ? (
                                      <div className="space-y-4 pt-2">
                                        <div className="space-y-2">
                                          <Label htmlFor={`edit-title-${index}`} className="text-sm font-medium text-gray-700">
                                            Title
                                          </Label>
                                          <Input
                                            id={`edit-title-${index}`}
                                            value={newPrerequisiteTitle}
                                            onChange={(e) => setNewPrerequisiteTitle(e.target.value)}
                                            className="text-base py-2 border-2 border-blue-300 focus:border-blue-500"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor={`edit-explanation-${index}`} className="text-sm font-medium text-gray-700">
                                            Explanation
                                          </Label>
                                          <Textarea
                                            id={`edit-explanation-${index}`}
                                            value={newPrerequisiteExplanation}
                                            onChange={(e) => setNewPrerequisiteExplanation(e.target.value)}
                                            className="text-base py-2 border-2 border-blue-300 focus:border-blue-500"
                                            rows={4}
                                          />
                                        </div>
                                        <div className="flex gap-3">
                                          <Button
                                            onClick={() => handlePrerequisiteEdit(chapter.chapter_id, index, newPrerequisiteTitle, newPrerequisiteExplanation)}
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 px-3 py-1"
                                          >
                                            <Save className="w-4 h-4 mr-1" />
                                            Save
                                          </Button>
                                          <Button
                                            onClick={() => {
                                              setEditingPrerequisite(null);
                                              setNewPrerequisiteTitle('');
                                              setNewPrerequisiteExplanation('');
                                            }}
                                            size="sm"
                                            variant="outline"
                                            className="px-3 py-1"
                                          >
                                            <X className="w-4 h-4 mr-1" />
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-gray-700 leading-relaxed pt-2">
                                        {prerequisite.explanation}
                                      </div>
                                    )}
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          )}

                          {chapter.prerequisites.length === 0 && !addingPrerequisite && (
                            <div className="text-center py-8 text-gray-500">
                              <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                              <p className="text-base">No prerequisites added yet</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Syllabus;
