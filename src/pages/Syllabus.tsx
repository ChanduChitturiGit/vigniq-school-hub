import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  Users, 
  GraduationCap,
  Eye,
  MessageSquare,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';

interface Chapter {
  id: number;
  name: string;
  number: number;
  totalLessons: number;
  completedLessons: number;
  estimatedDays: number;
  hasLessonPlan?: boolean;
}

interface Prerequisite {
  id: number;
  title: string;
  description: string;
}

const Syllabus: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const subject = searchParams.get('subject') || 'Math';
  const className = searchParams.get('class') || '6';
  const section = searchParams.get('section') || 'A';

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [prerequisites, setPrerequisites] = useState<Prerequisite[]>([]);
  const [isAddingPrereq, setIsAddingPrereq] = useState(false);
  const [editingPrereq, setEditingPrereq] = useState<Prerequisite | null>(null);
  const [newPrereq, setNewPrereq] = useState({ title: '', description: '' });

  const breadcrumbItems = [
    { label: 'Grades', path: '/grades' },
    { label: `${subject} - ${className} ${section}` }
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-blue-600';
    if (progress >= 40) return 'bg-blue-500';
    return 'bg-blue-400';
  };

  useEffect(() => {
    const sampleChapters: Chapter[] = [
      {
        id: 1,
        name: 'Knowing Our Numbers',
        number: 1,
        totalLessons: 8,
        completedLessons: 6,
        estimatedDays: 5,
        hasLessonPlan: true
      },
      {
        id: 2,
        name: 'Whole Numbers',
        number: 2,
        totalLessons: 10,
        completedLessons: 4,
        estimatedDays: 6
      },
      {
        id: 3,
        name: 'Playing with Numbers',
        number: 3,
        totalLessons: 12,
        completedLessons: 2,
        estimatedDays: 8
      },
      {
        id: 4,
        name: 'Basic Geometrical Ideas',
        number: 4,
        totalLessons: 15,
        completedLessons: 0,
        estimatedDays: 10
      }
    ];
    setChapters(sampleChapters);

    // Sample prerequisites data
    const samplePrerequisites: Prerequisite[] = [
      {
        id: 1,
        title: 'Basic Number Recognition',
        description: 'Students should be able to recognize and write numbers from 1 to 100. They should understand the concept of counting and basic number sequences.'
      },
      {
        id: 2,
        title: 'Simple Addition and Subtraction',
        description: 'Understanding of basic addition and subtraction operations with single-digit numbers. Students should be comfortable with simple mental math calculations.'
      },
      {
        id: 3,
        title: 'Place Value Understanding',
        description: 'Basic knowledge of place value system including units, tens, and hundreds. Students should understand the positional value of digits in a number.'
      }
    ];
    setPrerequisites(samplePrerequisites);
  }, []);

  const handleAddPrerequisite = () => {
    if (newPrereq.title.trim() && newPrereq.description.trim()) {
      const newId = Math.max(...prerequisites.map(p => p.id), 0) + 1;
      setPrerequisites([...prerequisites, {
        id: newId,
        title: newPrereq.title.trim(),
        description: newPrereq.description.trim()
      }]);
      setNewPrereq({ title: '', description: '' });
      setIsAddingPrereq(false);
    }
  };

  const handleEditPrerequisite = (prereq: Prerequisite) => {
    setEditingPrereq(prereq);
    setNewPrereq({ title: prereq.title, description: prereq.description });
  };

  const handleUpdatePrerequisite = () => {
    if (editingPrereq && newPrereq.title.trim() && newPrereq.description.trim()) {
      setPrerequisites(prerequisites.map(p => 
        p.id === editingPrereq.id 
          ? { ...p, title: newPrereq.title.trim(), description: newPrereq.description.trim() }
          : p
      ));
      setEditingPrereq(null);
      setNewPrereq({ title: '', description: '' });
    }
  };

  const handleDeletePrerequisite = (id: number) => {
    setPrerequisites(prerequisites.filter(p => p.id !== id));
  };

  const calculateProgress = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  const handleCreateLessonPlan = (chapterId: number, chapterName: string) => {
    navigate(`/grades/lesson-plan/create/${chapterId}?subject=${subject}&class=${className}&section=${section}&chapterName=${encodeURIComponent(chapterName)}`);
  };

  const handleViewLessonPlan = (chapterId: number, chapterName: string) => {
    navigate(`/grades/lesson-plan/view/${chapterId}/1?subject=${subject}&class=${className}&section=${section}&chapterName=${encodeURIComponent(chapterName)}`);
  };

  return (
    <MainLayout pageTitle={`${subject} Syllabus - ${className} ${section}`}>
      <div className="space-y-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Class Syllabus</h1>
            <p className="text-lg text-gray-600 mt-2">
              {subject} - Class {className} Section {section}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">30 Students</span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">2024-25</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              <span className="text-purple-800 font-medium">CBSE</span>
            </div>
          </div>
        </div>

        {/* Prerequisites Section */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl">
                <BookOpen className="w-6 h-6 text-blue-600" />
                Prerequisites
              </CardTitle>
              <Dialog open={isAddingPrereq} onOpenChange={setIsAddingPrereq}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Prerequisite
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Prerequisite</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Title
                      </label>
                      <Input
                        placeholder="Enter prerequisite title"
                        value={newPrereq.title}
                        onChange={(e) => setNewPrereq({...newPrereq, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Description
                      </label>
                      <Textarea
                        placeholder="Enter detailed description"
                        value={newPrereq.description}
                        onChange={(e) => setNewPrereq({...newPrereq, description: e.target.value})}
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingPrereq(false);
                          setNewPrereq({ title: '', description: '' });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddPrerequisite}
                        disabled={!newPrereq.title.trim() || !newPrereq.description.trim()}
                      >
                        Add Prerequisite
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-2">
              {prerequisites.map((prereq) => (
                <AccordionItem key={prereq.id} value={`prereq-${prereq.id}`} className="border border-gray-200 rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 rounded-t-lg">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-left">{prereq.title}</span>
                      <div className="flex items-center gap-2 mr-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPrerequisite(prereq);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePrerequisite(prereq.id);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <p className="text-gray-600 leading-relaxed">{prereq.description}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Edit Prerequisite Dialog */}
        <Dialog open={!!editingPrereq} onOpenChange={(open) => !open && setEditingPrereq(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Prerequisite</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Title
                </label>
                <Input
                  placeholder="Enter prerequisite title"
                  value={newPrereq.title}
                  onChange={(e) => setNewPrereq({...newPrereq, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Description
                </label>
                <Textarea
                  placeholder="Enter detailed description"
                  value={newPrereq.description}
                  onChange={(e) => setNewPrereq({...newPrereq, description: e.target.value})}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingPrereq(null);
                    setNewPrereq({ title: '', description: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdatePrerequisite}
                  disabled={!newPrereq.title.trim() || !newPrereq.description.trim()}
                >
                  Update Prerequisite
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Chapters Section */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Chapters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chapters.map((chapter) => {
                const progress = calculateProgress(chapter.completedLessons, chapter.totalLessons);
                return (
                  <Card key={chapter.id} className="shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            Chapter {chapter.number}
                          </h3>
                          <h4 className="text-base font-medium text-blue-600 mb-3">
                            {chapter.name}
                          </h4>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium text-gray-900">{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getProgressColor(progress)} transition-all duration-500`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{chapter.completedLessons}/{chapter.totalLessons} lessons</span>
                          <span>{chapter.estimatedDays} days</span>
                        </div>
                      </div>

                      {chapter.hasLessonPlan ? (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleViewLessonPlan(chapter.id, chapter.name)}
                            className="flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none flex-1 justify-center text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View Plan
                          </Button>
                          <Link
                            to={`/grades/lesson-plan/ai-chat/${chapter.id}/1?subject=${subject}&class=${className}&section=${section}&chapterName=${encodeURIComponent(chapter.name)}`}
                            className="flex items-center gap-2 bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-2 rounded-lg transition-colors text-sm font-medium flex-1 justify-center"
                          >
                            <MessageSquare className="w-4 h-4" />
                            AI Chat
                          </Link>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleCreateLessonPlan(chapter.id, chapter.name)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Lesson Plan
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Syllabus;
