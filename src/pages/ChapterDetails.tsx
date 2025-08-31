
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Lightbulb,
  Plus,
  Edit3,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface Topic {
  id: number;
  title: string;
  completed?: boolean;
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

  useEffect(() => {
    setTopics(sampleTopics);
  }, []);

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
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Add Topic
              </Button>
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
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Lesson Plan</h2>
                <p className="text-gray-600">Create and manage lesson plans for this chapter</p>
              </div>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Generate Lesson Plan
              </Button>
            </div>

            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Lesson Plan Available</h3>
                <p className="text-gray-500 mb-4">
                  Generate a lesson plan for this chapter to get started with structured teaching.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Create Lesson Plan
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prerequisites" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Prerequisites</h2>
                <p className="text-gray-600">Define prerequisites for this chapter</p>
              </div>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Add Prerequisite
              </Button>
            </div>

            <Card>
              <CardContent className="p-8 text-center">
                <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Prerequisites Defined</h3>
                <p className="text-gray-500 mb-4">
                  Add prerequisites to help students understand what they need to know before starting this chapter.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Add Prerequisites
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ChapterDetails;
