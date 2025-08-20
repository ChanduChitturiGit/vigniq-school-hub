
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  ArrowLeft,
  Send,
  Calculator,
  MessageSquare,
  Bot,
  User
} from 'lucide-react';
import { useSnackbar } from '../components/snackbar/SnackbarContext';
import { getLessonPlanDataByDay } from '../services/grades';

interface LessonActivity {
  serialNumber: number;
  title: string;
  description: string;
  summary?: string; // Optional summary field for shorter descriptions
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const AIChatLessonPlan: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const { chapterId, day } = useParams();
  const [searchParams] = useSearchParams();
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));

  const subject = searchParams.get('subject') || '';
  const className = searchParams.get('class') || '';
  const section = searchParams.get('section') || '';
  const classId = searchParams.get('classId') || '';
  const subjectId = searchParams.get('subjectId') || '';
  const schoolId = searchParams.get('schoolId') || '';
  const boardId = searchParams.get('boardId') || '';
  const chapterName = searchParams.get('chapterName') || '';
  const dayCount = searchParams.get('dayCount') || '';
  const pathData = `${subjectId}?class=${className}&class_id=${classId}&section=${section}&subject=${subject}&subject_id=${subjectId}&school_board_id=${boardId}&school_id=${schoolId}`


  const [activities, setActivities] = useState<LessonActivity[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const breadcrumbItems = [
    { label: 'Grades', path: '/grades' },
    { label: `${subject} - ${className} ${section}`, path: `/grades/syllabus/${pathData}` },
    { label: 'AI Chat Assistant' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getLessonData = async () => {
    try {
      const data = {
        chapter_id: chapterId,
        lesson_plan_day_id: day,
        subject: subject,
        class: className,
        section: section,
        school_id: schoolId ? schoolId : userData.school_id,
        board_id: boardId,
        subject_id: subjectId,
        class_id: classId
      };
      const response = await getLessonPlanDataByDay(data);
      if (response && response.data) {
        setActivities(response.data.topics);
      } else {
        showSnackbar({
          title: 'Error',
          description: response.message || 'Failed to fetch lesson plan data.',
          status: 'error'
        });
      }
    } catch (error) {
      showSnackbar({
        title: 'Error',
        description: 'An unexpected error occurred while fetching lesson plan data.',
        status: 'error'
      });
    }
  }

  useEffect(() => {
    getLessonData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Sample data for lesson activities
    // const sampleActivities: LessonActivity[] = [
    //   {
    //     serialNumber: 1,
    //     title: 'Introduction to Numbers',
    //     description: 'Brief overview of the chapter and importance of numbers in daily life. Icebreaker activity related to numbers.'
    //   },
    //   {
    //     serialNumber: 2,
    //     title: 'Comparing Numbers',
    //     description: 'Understanding place value, identifying greater and smaller numbers. Examples and practice exercises.'
    //   },
    //   {
    //     serialNumber: 3,
    //     title: 'Break',
    //     description: 'Short break for students.'
    //   },
    //   {
    //     serialNumber: 4,
    //     title: 'Large Numbers in Practice',
    //     description: 'Reading and writing large numbers. Use of commas. Real-world examples of large numbers.'
    //   },
    //   {
    //     serialNumber: 5,
    //     title: 'Recap and Q&A',
    //     description: 'Summarize the topics covered. Address student questions and doubts.'
    //   }
    // ];

    // setActivities(sampleActivities);

    // Sample initial messages
    const initialMessages: ChatMessage[] = [
      {
        id: '1',
        type: 'ai',
        content: `Hello! I'm your AI teaching assistant for Chapter ${chapterId}: ${chapterName}, Day ${day}. I can help you with lesson planning, teaching strategies, and answer questions about the curriculum. How can I assist you today?`,
        timestamp: new Date()
      }
    ];

    setMessages(initialMessages);
  }, [chapterId, chapterName, day]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Thank you for your question about "${inputMessage}". I can help you with teaching strategies, curriculum guidance, and lesson plan modifications. For this chapter on ${chapterName}, I recommend focusing on practical examples and interactive activities to keep students engaged.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    }, 1000);

    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <MainLayout pageTitle={`AI Chat - Chapter ${chapterId}: ${chapterName} - Day ${dayCount}`}>
      <div className="space-y-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to={`/grades/syllabus/${pathData}`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </Link>
          </div>
        </div>

        {/* <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200">
            <Calculator className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">AI Teaching Assistant</h1>
            <p className="text-xl text-blue-600 font-medium">Chapter {chapterId}: {chapterName} - Day {dayCount}</p>
            <p className="text-lg text-gray-500">{className} {section}</p>
          </div>
        </div>  */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 h-[600px] flex flex-col">
              <CardHeader className="flex-shrink-0 border-b">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                  Chat with AI Assistant
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                {/* Messages Area */}
                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-6 space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex items-start gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                        >
                          {message.type === 'ai' && (
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                              <Bot className="w-4 h-4 text-purple-600" />
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] p-4 rounded-lg ${message.type === 'user'
                              ? 'bg-blue-600 text-white rounded-br-sm'
                              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                              }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <span className="text-xs opacity-70 mt-2 block">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          {message.type === 'user' && (
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </div>

                {/* Input Area */}
                <div className="flex-shrink-0 border-t p-6">
                  <div className="flex gap-3">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me about teaching strategies, lesson modifications, or curriculum guidance..."
                      className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[60px] max-h-[120px]"
                      rows={2}
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="bg-blue-600 hover:bg-blue-700 px-6 self-end"
                      disabled={!inputMessage.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fixed Lesson Plan Panel */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 h-[600px] flex flex-col">
              <CardHeader className="flex-shrink-0 bg-gray-50 border-b">
                <CardTitle className="text-xl text-gray-900">Today's Lesson Plan</CardTitle>
              </CardHeader>

              <CardContent className="flex-1 p-0 min-h-0">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-4">
                    {activities.map((activity, index) => (
                      <div key={activity.serialNumber} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">
                              {activity.title}
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {activity.summary || activity.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AIChatLessonPlan;
