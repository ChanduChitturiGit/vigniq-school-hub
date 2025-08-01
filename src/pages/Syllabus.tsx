
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { Progress } from '../components/ui/progress';
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Edit, 
  Save, 
  X,
  BookOpen,
  FileText,
  Eye,
  Lightbulb
} from 'lucide-react';

interface Chapter {
  id: string;
  name: string;
  progress: number;
  topics: string[];
  lessonPlans: LessonPlan[];
  prerequisites: string[];
}

interface LessonPlan {
  id: string;
  title: string;
  description: string;
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

  // Sample data for chapters
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
      lessonPlans: [
        {
          id: '1',
          title: 'My Custom Lesson Plan for Chapter 1',
          description: 'Comprehensive lesson plan covering number systems and basic operations'
        }
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
      lessonPlans: [],
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
      lessonPlans: [
        {
          id: '2',
          title: 'Interactive Number Games',
          description: 'Engaging activities to teach factors and multiples'
        }
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
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{subject} - {className} {section}</h1>
            <p className="text-gray-600">Manage syllabus content and track progress</p>
          </div>
          <Link
            to={`/grades/progress/${subjectId}?class=${className}&section=${section}&subject=${subject}`}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            View Progress
          </Link>
        </div>

        {/* Chapters */}
        <div className="space-y-4">
          {chapters.map((chapter) => (
            <div key={chapter.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <Collapsible
                open={openChapters[chapter.id]}
                onOpenChange={() => toggleChapter(chapter.id)}
              >
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-gray-800">
                        Chapter {chapter.id}: {chapter.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={chapter.progress} className="w-20 h-2" />
                        <span className="text-sm text-gray-600">{chapter.progress}%</span>
                      </div>
                    </div>
                  </div>
                  {openChapters[chapter.id] ? 
                    <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  }
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t border-gray-200 p-4">
                    <Tabs defaultValue="topics" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="topics">Topics</TabsTrigger>
                        <TabsTrigger value="lessonplan">Lesson Plan</TabsTrigger>
                        <TabsTrigger value="prerequisites">Prerequisites</TabsTrigger>
                      </TabsList>

                      <TabsContent value="topics" className="mt-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-800">Chapter Topics</h3>
                            <button
                              onClick={() => setAddingTopic(chapter.id)}
                              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                            >
                              <Plus className="w-4 h-4" />
                              Add Topic
                            </button>
                          </div>
                          
                          {chapter.topics.map((topic, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-600">
                                  {index + 1}.
                                </span>
                                {editingTopic?.chapterId === chapter.id && editingTopic?.topicIndex === index ? (
                                  <input
                                    type="text"
                                    value={newTopicText}
                                    onChange={(e) => setNewTopicText(e.target.value)}
                                    className="flex-1 text-sm text-gray-800 bg-white border border-gray-300 rounded px-2 py-1"
                                    onBlur={() => handleTopicEdit(chapter.id, index, newTopicText)}
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
                                ) : (
                                  <span className="text-sm text-gray-800">{topic}</span>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  setEditingTopic({ chapterId: chapter.id, topicIndex: index });
                                  setNewTopicText(topic);
                                }}
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          ))}

                          {addingTopic === chapter.id && (
                            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-600">
                                {chapter.topics.length + 1}.
                              </span>
                              <input
                                type="text"
                                value={newTopicText}
                                onChange={(e) => setNewTopicText(e.target.value)}
                                placeholder="Enter new topic..."
                                className="flex-1 text-sm bg-white border border-blue-300 rounded px-2 py-1"
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
                              <button
                                onClick={() => addTopic(chapter.id, newTopicText)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setAddingTopic(null);
                                  setNewTopicText('');
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="lessonplan" className="mt-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-800">Saved Lesson Plan</h3>
                            <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm">
                              <Plus className="w-4 h-4" />
                              Create New Lesson Plan
                            </button>
                          </div>
                          
                          {chapter.lessonPlans.length > 0 ? (
                            chapter.lessonPlans.map((lessonPlan) => (
                              <div key={lessonPlan.id} className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-gray-800">{lessonPlan.title}</h4>
                                  <div className="flex items-center gap-2">
                                    <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm">
                                      <Edit className="w-4 h-4" />
                                      Edit
                                    </button>
                                    <button className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm">
                                      <Eye className="w-4 h-4" />
                                      View
                                    </button>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600">{lessonPlan.description}</p>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p className="text-sm">No lesson plans created yet</p>
                              <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 mx-auto">
                                <Plus className="w-4 h-4" />
                                Create your first lesson plan
                              </button>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="prerequisites" className="mt-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-800">Saved Prerequisites</h3>
                            <button
                              onClick={() => setAddingPrerequisite(chapter.id)}
                              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                            >
                              <Plus className="w-4 h-4" />
                              Add Prerequisite
                            </button>
                          </div>
                          
                          {chapter.prerequisites.map((prerequisite, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Lightbulb className="w-4 h-4 text-yellow-500" />
                                {editingPrerequisite?.chapterId === chapter.id && editingPrerequisite?.prereqIndex === index ? (
                                  <input
                                    type="text"
                                    value={newPrerequisiteText}
                                    onChange={(e) => setNewPrerequisiteText(e.target.value)}
                                    className="flex-1 text-sm text-gray-800 bg-white border border-gray-300 rounded px-2 py-1"
                                    onBlur={() => handlePrerequisiteEdit(chapter.id, index, newPrerequisiteText)}
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
                                ) : (
                                  <span className="text-sm text-gray-800">{prerequisite}</span>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  setEditingPrerequisite({ chapterId: chapter.id, prereqIndex: index });
                                  setNewPrerequisiteText(prerequisite);
                                }}
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          ))}

                          {addingPrerequisite === chapter.id && (
                            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                              <Lightbulb className="w-4 h-4 text-yellow-500" />
                              <input
                                type="text"
                                value={newPrerequisiteText}
                                onChange={(e) => setNewPrerequisiteText(e.target.value)}
                                placeholder="Enter new prerequisite..."
                                className="flex-1 text-sm bg-white border border-blue-300 rounded px-2 py-1"
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
                              <button
                                onClick={() => addPrerequisite(chapter.id, newPrerequisiteText)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setAddingPrerequisite(null);
                                  setNewPrerequisiteText('');
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
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
