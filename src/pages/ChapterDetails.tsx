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
  RefreshCw
} from 'lucide-react';

interface Topic {
  id: number;
  title: string;
  completed?: boolean;
}

interface Prerequisite {
  id: number;
  topic: string;
  explanation: string;
}

interface LessonPlanDay {
  day: number;
  status: string;
  date?: string;
}

interface LessonPlan {
  id: number;
  days: LessonPlanDay[];
  totalDays: number;
}

const ChapterDetails: React.FC = () => {
  const { chapterId } = useParams();
  const [searchParams] = useSearchParams();
  const className = searchParams.get('class') || '';
  const section = searchParams.get('section') || '';
  const subject = searchParams.get('subject') || '';
  const chapterName = searchParams.get('chapter_name') || '';
  const chapterNumber = searchParams.get('chapter_number') || '';
  const progress = parseInt(searchParams.get('progress') || '0');

  const [topics, setTopics] = useState<Topic[]>([]);
  const [prerequisites, setPrerequisites] = useState<Prerequisite[]>([]);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
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

  const sampleTopics: Topic[] = [
    { id: 1, title: 'Introduction to Real Numbers', completed: true },
    { id: 2, title: 'Rational and Irrational Numbers', completed: true },
    { id: 3, title: 'Decimal Representation', completed: false },
    { id: 4, title: 'Operations on Real Numbers', completed: false },
    { id: 5, title: 'Laws of Exponents', completed: false }
  ];

  const samplePrerequisites: Prerequisite[] = [
    {
      id: 1,
      topic: 'Basic Algebra and Squaring',
      explanation: 'Understanding basic algebraic manipulation and the concept of squaring a number is crucial for following the proofs in this chapter. **Basic Algebra:** This involves working with variables (like \'a\' or \'b\'), performing operations (addition, subtraction, multiplication, division) with them, and solving simple equations. **Squaring:** Multiplying a number by itself. For example, \'a squared\' (a²) means a × a. Example: - If a = 5, then a² = 5 × 5 = 25. - If you have an equation like b² = 2c², you should understand that if 2 divides b², it implies something about b.'
    },
    {
      id: 2,
      topic: 'Coprime Numbers (Relatively Prime)',
      explanation: 'Two numbers are coprime if their greatest common divisor (GCD) is 1. This concept is fundamental in proofs involving rational numbers.'
    },
    {
      id: 3,
      topic: 'Highest Common Factor (HCF) and Least Common Multiple (LCM)',
      explanation: 'Understanding HCF and LCM is essential for simplifying fractions and understanding rational number properties.'
    }
  ];

  const sampleLessonPlan: LessonPlan = {
    id: 1,
    totalDays: 8,
    days: [
      { day: 1, status: 'Pending', date: 'Oct 26, 2023' },
      { day: 2, status: 'Pending', date: 'Oct 27, 2023' },
      { day: 3, status: 'Pending', date: 'Oct 28, 2023' },
      { day: 4, status: 'Pending', date: 'Oct 29, 2023' },
      { day: 5, status: 'Pending', date: 'Oct 30, 2023' },
      { day: 6, status: 'Pending', date: 'Oct 31, 2023' },
      { day: 7, status: 'Pending', date: 'Nov 1, 2023' },
      { day: 8, status: 'Pending', date: 'Nov 2, 2023' }
    ]
  };

  useEffect(() => {
    setTopics(sampleTopics);
    setPrerequisites(samplePrerequisites);
    setLessonPlan(sampleLessonPlan);
  }, []);

  const handleAddTopic = () => {
    if (newTopicTitle.trim()) {
      const newTopic: Topic = {
        id: Math.max(...topics.map(t => t.id)) + 1,
        title: newTopicTitle.trim(),
        completed: false
      };
      setTopics([...topics, newTopic]);
      setNewTopicTitle('');
      setShowAddTopic(false);
    }
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setNewTopicTitle(topic.title);
  };

  const handleSaveTopicEdit = () => {
    if (editingTopic && newTopicTitle.trim()) {
      setTopics(topics.map(t => 
        t.id === editingTopic.id ? { ...t, title: newTopicTitle.trim() } : t
      ));
      setEditingTopic(null);
      setNewTopicTitle('');
    }
  };

  const handleAddPrerequisite = () => {
    if (newPrerequisiteTitle.trim() && newPrerequisiteExplanation.trim()) {
      const newPrerequisite: Prerequisite = {
        id: Math.max(...prerequisites.map(p => p.id)) + 1,
        topic: newPrerequisiteTitle.trim(),
        explanation: newPrerequisiteExplanation.trim()
      };
      setPrerequisites([...prerequisites, newPrerequisite]);
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
      setPrerequisites(prerequisites.map(p => 
        p.id === editingPrerequisite.id 
          ? { ...p, topic: newPrerequisiteTitle.trim(), explanation: newPrerequisiteExplanation.trim() }
          : p
      ));
      setEditingPrerequisite(null);
      setNewPrerequisiteTitle('');
      setNewPrerequisiteExplanation('');
    }
  };

  const completedTopics = topics.filter(topic => topic.completed).length;
  const totalTopics = topics.length;

  return (
    <MainLayout pageTitle={`Chapter ${chapterNumber}: ${chapterName}`}>
      <div className="space-y-8">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            to={`/grades/syllabus?class=${className}&section=${section}&subject=${subject}`}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Syllabus</span>
          </Link>
          <div className="text-right">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="text-2xl font-bold text-gray-900">{progress}% Complete</div>
          </div>
        </div>

        {/* Chapter Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">{chapterNumber}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chapter {chapterNumber}: {chapterName}</h1>
              <p className="text-lg text-gray-600">{subject} - {className} - Section {section}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="topics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="topics" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Topics
            </TabsTrigger>
            <TabsTrigger value="lesson-plan" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Lesson Plan
            </TabsTrigger>
            <TabsTrigger value="prerequisites" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Prerequisites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topics" className="space-y-6">
            <div className="flex items-center justify-between">
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

            <div className="space-y-4">
              {topics.map((topic, index) => (
                <Card key={topic.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                          <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{topic.title}</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {topic.completed && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                        <Dialog open={editingTopic?.id === topic.id} onOpenChange={(open) => {
                          if (!open) {
                            setEditingTopic(null);
                            setNewTopicTitle('');
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-600 hover:text-blue-700"
                              onClick={() => handleEditTopic(topic)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Topic</DialogTitle>
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
                                    setEditingTopic(null);
                                    setNewTopicTitle('');
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button onClick={handleSaveTopicEdit} className="bg-blue-600 hover:bg-blue-700">
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="lesson-plan" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Lesson Plan</h2>
                <p className="text-gray-600">Create and manage lesson plans for this chapter</p>
              </div>
              {lessonPlan ? (
                <Link to={`/grades/lesson-plan/create/${chapterId}?subject=${subject}&class=${className}&section=${section}&chapterName=${encodeURIComponent(chapterName)}`}>
                  <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                    <RefreshCw className="w-4 h-4" />
                    Re-generate Lesson Plan
                  </Button>
                </Link>
              ) : (
                <Link to={`/grades/lesson-plan/create/${chapterId}?subject=${subject}&class=${className}&section=${section}&chapterName=${encodeURIComponent(chapterName)}`}>
                  <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                    Generate Lesson Plan
                  </Button>
                </Link>
              )}
            </div>

            {lessonPlan ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lessonPlan.days.map((day) => (
                  <Card key={day.day} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Day {day.day}</h3>
                          <p className="text-sm text-gray-500">{day.status}</p>
                          {day.date && <p className="text-xs text-gray-400">{day.date}</p>}
                        </div>
                        
                        <div className="space-y-2">
                          <Link 
                            to={`/grades/lesson-plan/view/${chapterId}/${lessonPlan.id}?subject=${subject}&class=${className}&section=${section}&chapterName=${encodeURIComponent(chapterName)}&day=${day.day}`}
                            className="w-full"
                          >
                            <Button variant="outline" className="w-full flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                              <Eye className="w-4 h-4" />
                              View
                            </Button>
                          </Link>
                          
                          <Link 
                            to={`/grades/lesson-plan/ai-chat/${chapterId}/${day.day}?subject=${subject}&class=${className}&section=${section}&chapterName=${encodeURIComponent(chapterName)}`}
                            className="w-full"
                          >
                            <Button className="w-full flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                              <MessageSquare className="w-4 h-4" />
                              Chat with AI Assistant
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Lesson Plan Available</h3>
                  <p className="text-gray-500 mb-4">
                    Generate a lesson plan for this chapter to get started with structured teaching.
                  </p>
                  <Link to={`/grades/lesson-plan/create/${chapterId}?subject=${subject}&class=${className}&section=${section}&chapterName=${encodeURIComponent(chapterName)}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Create Lesson Plan
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="prerequisites" className="space-y-6">
            <div className="flex items-center justify-between">
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
                  <AccordionItem key={prerequisite.id} value={`prerequisite-${prerequisite.id}`} className="border rounded-lg">
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
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {prerequisite.explanation}
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
