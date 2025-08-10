import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
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

interface DayPlan {
  day: number;
  date: string;
}

interface Chapter {
  id: string;
  name: string;
  progress: number;
  topics: string[];
  dayPlans: DayPlan[];
  prerequisites: string[];
}

const Syllabus: React.FC = () => {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const className = searchParams.get('class') || '';
  const section = searchParams.get('section') || '';
  const subject = searchParams.get('subject') || '';

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [openChapters, setOpenChapters] = useState<{ [key: string]: boolean }>({});
  const [editingTopic, setEditingTopic] = useState<{ chapterId: string; topicIndex: number } | null>(null);
  const [editingPrerequisite, setEditingPrerequisite] = useState<{ chapterId: string; prereqIndex: number } | null>(null);
  const [newTopicText, setNewTopicText] = useState('');
  const [newPrerequisiteText, setNewPrerequisiteText] = useState('');
  const [addingTopic, setAddingTopic] = useState<string | null>(null);
  const [addingPrerequisite, setAddingPrerequisite] = useState<string | null>(null);

  const breadcrumbItems = [
    { label: 'Grades', path: '/grades' },
    { label: `${subject} - ${className} ${section}` }
  ];

  const sampleChapters: Chapter[] = [
    {
      id: '1',
      name: 'Knowing Our Numbers',
      progress: 75,
      topics: [
        'Introduction to Numbers',
        'Comparing Numbers',
        'Large Numbers in Practice',
        'Estimation',
        'Roman Numerals'
      ],
      dayPlans: [
        { day: 1, date: 'October 26, 2023' },
        { day: 2, date: 'October 27, 2023' },
        { day: 3, date: 'October 28, 2023' },
        { day: 4, date: 'October 29, 2023' },
        { day: 5, date: 'October 30, 2023' }
      ],
      prerequisites: [
        'Understanding Basic Arithmetic Operations',
        'Concept of Place Value',
        'Introduction to Number Systems'
      ]
    },
    {
      id: '2',
      name: 'Whole Numbers',
      progress: 45,
      topics: [
        'Introduction to Whole Numbers',
        'Properties of Whole Numbers',
        'Operations on Whole Numbers',
        'Patterns in Whole Numbers'
      ],
      dayPlans: [],
      prerequisites: [
        'Understanding Natural Numbers',
        'Basic Addition and Subtraction',
        'Number Line Concepts'
      ]
    },
    {
      id: '3',
      name: 'Playing with Numbers',
      progress: 90,
      topics: [
        'Factors and Multiples',
        'Prime and Composite Numbers',
        'Tests for Divisibility',
        'Common Factors and Multiples',
        'Prime Factorization'
      ],
      dayPlans: [
        { day: 1, date: 'November 15, 2023' },
        { day: 2, date: 'November 16, 2023' },
        { day: 3, date: 'November 17, 2023' }
      ],
      prerequisites: [
        'Multiplication Tables',
        'Division Concepts',
        'Understanding of Factors'
      ]
    }
  ];

  useEffect(() => {
    setChapters(sampleChapters);
  }, []);

  const toggleChapter = (chapterId: string) => {
    setOpenChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-blue-600';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-blue-400';
  };

  const handleTopicEdit = (chapterId: string, topicIndex: number, newValue: string) => {
    setChapters(prev => prev.map(chapter => {
      if (chapter.id === chapterId) {
        const newTopics = [...chapter.topics];
        newTopics[topicIndex] = newValue;
        return { ...chapter, topics: newTopics };
      }
      return chapter;
    }));
    setEditingTopic(null);
    setNewTopicText('');
  };

  const handlePrerequisiteEdit = (chapterId: string, prereqIndex: number, newValue: string) => {
    setChapters(prev => prev.map(chapter => {
      if (chapter.id === chapterId) {
        const newPrerequisites = [...chapter.prerequisites];
        newPrerequisites[prereqIndex] = newValue;
        return { ...chapter, prerequisites: newPrerequisites };
      }
      return chapter;
    }));
    setEditingPrerequisite(null);
    setNewPrerequisiteText('');
  };

  const addTopic = (chapterId: string, newTopic: string) => {
    if (newTopic.trim()) {
      setChapters(prev => prev.map(chapter => {
        if (chapter.id === chapterId) {
          return { ...chapter, topics: [...chapter.topics, newTopic.trim()] };
        }
        return chapter;
      }));
    }
    setAddingTopic(null);
    setNewTopicText('');
  };

  const addPrerequisite = (chapterId: string, newPrerequisite: string) => {
    if (newPrerequisite.trim()) {
      setChapters(prev => prev.map(chapter => {
        if (chapter.id === chapterId) {
          return { ...chapter, prerequisites: [...chapter.prerequisites, newPrerequisite.trim()] };
        }
        return chapter;
      }));
    }
    setAddingPrerequisite(null);
    setNewPrerequisiteText('');
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
            <div key={chapter.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <Collapsible
                open={openChapters[chapter.id]}
                onOpenChange={() => toggleChapter(chapter.id)}
              >
                <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-medium text-gray-900">
                        Chapter {chapter.id}: {chapter.name}
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
                  {openChapters[chapter.id] ? 
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
                              onClick={() => setAddingTopic(chapter.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                            >
                              <PlusCircle className="w-4 h-4" />
                              Add Topic
                            </Button>
                          </div>
                          
                          {chapter.topics.map((topic, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                              <div className="flex items-center gap-4 flex-1">
                                <span className="text-sm font-medium text-blue-600 bg-blue-200 rounded-full w-7 h-7 flex items-center justify-center">
                                  {index + 1}
                                </span>
                                {editingTopic?.chapterId === chapter.id && editingTopic?.topicIndex === index ? (
                                  <div className="flex items-center gap-3 flex-1">
                                    <Input
                                      value={newTopicText}
                                      onChange={(e) => setNewTopicText(e.target.value)}
                                      className="flex-1 text-base py-2 border-2 border-blue-300 focus:border-blue-500"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleTopicEdit(chapter.id, index, newTopicText);
                                        }
                                        if (e.key === 'Escape') {
                                          setEditingTopic(null);
                                          setNewTopicText('');
                                        }
                                      }}
                                      autoFocus
                                    />
                                    <Button
                                      onClick={() => handleTopicEdit(chapter.id, index, newTopicText)}
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
                                  <span className="text-base text-gray-700">{topic}</span>
                                )}
                              </div>
                              {!editingTopic && (
                                <Button
                                  onClick={() => {
                                    setEditingTopic({ chapterId: chapter.id, topicIndex: index });
                                    setNewTopicText(topic);
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

                          {addingTopic === chapter.id && (
                            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                              <span className="text-sm font-medium text-blue-600 bg-blue-200 rounded-full w-7 h-7 flex items-center justify-center">
                                {chapter.topics.length + 1}
                              </span>
                              <Input
                                value={newTopicText}
                                onChange={(e) => setNewTopicText(e.target.value)}
                                placeholder="Enter new topic..."
                                className="flex-1 text-base py-2 border-2 border-blue-300 focus:border-blue-500"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    addTopic(chapter.id, newTopicText);
                                  }
                                  if (e.key === 'Escape') {
                                    setAddingTopic(null);
                                    setNewTopicText('');
                                  }
                                }}
                                autoFocus
                              />
                              <Button
                                onClick={() => addTopic(chapter.id, newTopicText)}
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
                              to={`/grades/lesson-plan/create/${chapter.id}?subject=${subject}&class=${className}&section=${section}&chapterName=${encodeURIComponent(chapter.name)}`}
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
                                          to={`/grades/lesson-plan/day/${chapter.id}/${dayPlan.day}?subject=${subject}&class=${className}&section=${section}&chapterName=${encodeURIComponent(chapter.name)}`}
                                          className="flex items-center justify-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                                        >
                                          <Eye className="w-4 h-4" />
                                          View
                                        </Link>
                                        <Link
                                          to={`/grades/lesson-plan/ai-chat/${chapter.id}/${dayPlan.day}?subject=${subject}&class=${className}&section=${section}&chapterName=${encodeURIComponent(chapter.name)}`}
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
                                to={`/grades/lesson-plan/create/${chapter.id}?subject=${subject}&class=${className}&section=${section}&chapterName=${encodeURIComponent(chapter.name)}`}
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
                              onClick={() => setAddingPrerequisite(chapter.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                            >
                              <PlusCircle className="w-4 h-4" />
                              Add Prerequisite
                            </Button>
                          </div>
                          
                          {chapter.prerequisites.map((prerequisite, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                              <div className="flex items-center gap-4 flex-1">
                                <Lightbulb className="w-5 h-5 text-blue-600" />
                                {editingPrerequisite?.chapterId === chapter.id && editingPrerequisite?.prereqIndex === index ? (
                                  <div className="flex items-center gap-3 flex-1">
                                    <Input
                                      value={newPrerequisiteText}
                                      onChange={(e) => setNewPrerequisiteText(e.target.value)}
                                      className="flex-1 text-base py-2 border-2 border-blue-300 focus:border-blue-500"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handlePrerequisiteEdit(chapter.id, index, newPrerequisiteText);
                                        }
                                        if (e.key === 'Escape') {
                                          setEditingPrerequisite(null);
                                          setNewPrerequisiteText('');
                                        }
                                      }}
                                      autoFocus
                                    />
                                    <Button
                                      onClick={() => handlePrerequisiteEdit(chapter.id, index, newPrerequisiteText)}
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 px-3 py-1"
                                    >
                                      <Save className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        setEditingPrerequisite(null);
                                        setNewPrerequisiteText('');
                                      }}
                                      size="sm"
                                      variant="outline"
                                      className="px-3 py-1"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-base text-gray-700">{prerequisite}</span>
                                )}
                              </div>
                              {!editingPrerequisite && (
                                <Button
                                  onClick={() => {
                                    setEditingPrerequisite({ chapterId: chapter.id, prereqIndex: index });
                                    setNewPrerequisiteText(prerequisite);
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

                          {addingPrerequisite === chapter.id && (
                            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                              <Lightbulb className="w-5 h-5 text-blue-600" />
                              <Input
                                value={newPrerequisiteText}
                                onChange={(e) => setNewPrerequisiteText(e.target.value)}
                                placeholder="Enter new prerequisite..."
                                className="flex-1 text-base py-2 border-2 border-blue-300 focus:border-blue-500"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    addPrerequisite(chapter.id, newPrerequisiteText);
                                  }
                                  if (e.key === 'Escape') {
                                    setAddingPrerequisite(null);
                                    setNewPrerequisiteText('');
                                  }
                                }}
                                autoFocus
                              />
                              <Button
                                onClick={() => addPrerequisite(chapter.id, newPrerequisiteText)}
                                className="bg-green-600 hover:bg-green-700 px-3 py-2"
                              >
                                <Save className="w-4 h-4 mr-1" />
                                Save
                              </Button>
                              <Button
                                onClick={() => {
                                  setAddingPrerequisite(null);
                                  setNewPrerequisiteText('');
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
