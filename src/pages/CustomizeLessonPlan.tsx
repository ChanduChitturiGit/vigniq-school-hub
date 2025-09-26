import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp,
  Plus,
  Clock,
  Target,
  Trash2,
  Save
} from 'lucide-react';

interface Activity {
  id: number;
  title: string;
  description: string;
  duration: number;
}

interface LearningOutcome {
  id: number;
  text: string;
}

interface DayPlan {
  day: number;
  duration: number;
  activities: Activity[];
  learningOutcomes: LearningOutcome[];
  isExpanded: boolean;
}

const CustomizeLessonPlan: React.FC = () => {
  const { chapterId } = useParams();
  const [searchParams] = useSearchParams();
  
  const subject = searchParams.get('subject') || '';
  const className = searchParams.get('class') || '';
  const section = searchParams.get('section') || '';
  const chapterName = decodeURIComponent(searchParams.get('chapterName') || '');

  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  const [totalTime, setTotalTime] = useState(135);
  const [totalActivities, setTotalActivities] = useState(10);

  const breadcrumbItems = [
    { label: 'Grades', path: '/grades' },
    { label: `${subject} - ${className} ${section}`, path: `/grades/syllabus/math_6a?class=${className}&section=${section}&subject=${subject}` },
    { label: 'Customize Lesson Plan' }
  ];

  useEffect(() => {
    // Sample data for lesson plan customization
    const sampleDayPlans: DayPlan[] = [
      {
        day: 1,
        duration: 45,
        isExpanded: true,
        activities: [
          {
            id: 1,
            title: "Introduction to Real Numbers",
            description: "A brief recap of real numbers, including rational and irrational numbers, as explored in Class IX. This sets the stage for deeper exploration in the current chapter.",
            duration: 10
          },
          {
            id: 2,
            title: "Euclid's Division Algorithm (Brief Overview)",
            description: "An introduction to Euclid's Division Algorithm, highlighting its connection to the divisibility of integers and its use in computing HCF, as mentioned in the chapter's introduction.",
            duration: 5
          },
          {
            id: 3,
            title: "Fundamental Theorem of Arithmetic (FTA) - Concept",
            description: "Formal introduction to the Fundamental Theorem of Arithmetic, stating that every composite number can be expressed as a unique product of primes, irrespective of the order.",
            duration: 20
          },
          {
            id: 4,
            title: "Factor Trees and Prime Factorization",
            description: "Practical demonstration of prime factorization using factor trees for large numbers, reinforcing the concept of breaking down numbers into their prime components.",
            duration: 10
          }
        ],
        learningOutcomes: [
          { id: 1, text: "Students will recall the definition of real numbers and their subsets." },
          { id: 2, text: "Students will understand the basic premise of Euclid's Division Algorithm." },
          { id: 3, text: "Students will be able to state the Fundamental Theorem of Arithmetic." },
          { id: 4, text: "Students will use factor trees to find the prime factorization of numbers." }
        ]
      },
      {
        day: 2,
        duration: 45,
        isExpanded: false,
        activities: [
          {
            id: 5,
            title: "Review of Day 1",
            description: "Quick review of previous day's concepts",
            duration: 10
          },
          {
            id: 6,
            title: "Advanced Applications",
            description: "More complex examples and applications",
            duration: 20
          },
          {
            id: 7,
            title: "Practice Problems",
            description: "Hands-on practice with guided examples",
            duration: 15
          }
        ],
        learningOutcomes: [
          { id: 5, text: "Students will apply previous concepts to new problems." },
          { id: 6, text: "Students will solve complex real-world applications." }
        ]
      },
      {
        day: 3,
        duration: 45,
        isExpanded: false,
        activities: [
          {
            id: 8,
            title: "Assessment and Review",
            description: "Final assessment and comprehensive review",
            duration: 30
          },
          {
            id: 9,
            title: "Q&A Session",
            description: "Open questions and clarifications",
            duration: 15
          }
        ],
        learningOutcomes: [
          { id: 7, text: "Students will demonstrate mastery of all concepts." }
        ]
      }
    ];
    setDayPlans(sampleDayPlans);
  }, []);

  const toggleDay = (dayIndex: number) => {
    setDayPlans(prev => prev.map((day, index) => 
      index === dayIndex ? { ...day, isExpanded: !day.isExpanded } : day
    ));
  };

  const addActivity = (dayIndex: number) => {
    setDayPlans(prev => prev.map((day, index) => 
      index === dayIndex ? {
        ...day,
        activities: [...day.activities, {
          id: Date.now(),
          title: "New Activity",
          description: "Activity description",
          duration: 10
        }]
      } : day
    ));
  };

  const removeActivity = (dayIndex: number, activityId: number) => {
    setDayPlans(prev => prev.map((day, index) => 
      index === dayIndex ? {
        ...day,
        activities: day.activities.filter(activity => activity.id !== activityId)
      } : day
    ));
  };

  const updateActivity = (dayIndex: number, activityId: number, field: string, value: string | number) => {
    setDayPlans(prev => prev.map((day, index) => 
      index === dayIndex ? {
        ...day,
        activities: day.activities.map(activity => 
          activity.id === activityId ? { ...activity, [field]: value } : activity
        )
      } : day
    ));
  };

  const addLearningOutcome = (dayIndex: number) => {
    setDayPlans(prev => prev.map((day, index) => 
      index === dayIndex ? {
        ...day,
        learningOutcomes: [...day.learningOutcomes, {
          id: Date.now(),
          text: "New learning outcome"
        }]
      } : day
    ));
  };

  const removeLearningOutcome = (dayIndex: number, outcomeId: number) => {
    setDayPlans(prev => prev.map((day, index) => 
      index === dayIndex ? {
        ...day,
        learningOutcomes: day.learningOutcomes.filter(outcome => outcome.id !== outcomeId)
      } : day
    ));
  };

  const updateLearningOutcome = (dayIndex: number, outcomeId: number, text: string) => {
    setDayPlans(prev => prev.map((day, index) => 
      index === dayIndex ? {
        ...day,
        learningOutcomes: day.learningOutcomes.map(outcome => 
          outcome.id === outcomeId ? { ...outcome, text } : outcome
        )
      } : day
    ));
  };

  return (
    <MainLayout pageTitle="Customize Lesson Plan">
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to={`/grades/syllabus/lesson-plan/view/${chapterId}/1?subject=${subject}&class=${className}&section=${section}&chapterName=${encodeURIComponent(chapterName)}`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </Link>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="text-gray-600 hover:text-gray-700">
              Reset
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Title and Stats */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Customize Lesson Plan</h1>
          <p className="text-gray-600 mb-4">{className} • {subject} • Chapter {chapterId}: {chapterName}</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{totalTime} min total</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>{totalActivities} activities</span>
            </div>
          </div>
        </div>

        {/* Day Plans */}
        <div className="space-y-4">
          {dayPlans.map((dayPlan, dayIndex) => (
            <Card key={dayPlan.day} className="border border-gray-200">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleDay(dayIndex)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                    {dayPlan.day}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Day {dayPlan.day}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {dayPlan.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {dayPlan.activities.length} activities
                      </span>
                    </div>
                  </div>
                </div>
                {dayPlan.isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>

              {dayPlan.isExpanded && (
                <CardContent className="pt-0">
                  {/* Activities Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="flex items-center gap-2 font-semibold text-gray-900">
                        <Target className="w-4 h-4" />
                        Activities
                      </h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => addActivity(dayIndex)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Activity
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {dayPlan.activities.map((activity, activityIndex) => (
                        <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-medium text-xs flex-shrink-0 mt-1">
                              {activityIndex + 1}
                            </div>
                            <div className="flex-1 space-y-3">
                              <Input
                                value={activity.title}
                                onChange={(e) => updateActivity(dayIndex, activity.id, 'title', e.target.value)}
                                className="font-medium"
                                placeholder="Activity title"
                              />
                              <Textarea
                                value={activity.description}
                                onChange={(e) => updateActivity(dayIndex, activity.id, 'description', e.target.value)}
                                className="min-h-[80px]"
                                placeholder="Activity description"
                              />
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    value={activity.duration}
                                    onChange={(e) => updateActivity(dayIndex, activity.id, 'duration', parseInt(e.target.value))}
                                    className="w-20"
                                    min="1"
                                  />
                                  <span className="text-sm text-gray-500">min</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeActivity(dayIndex, activity.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Learning Outcomes Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="flex items-center gap-2 font-semibold text-green-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Learning Outcomes
                      </h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => addLearningOutcome(dayIndex)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Outcome
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {dayPlan.learningOutcomes.map((outcome, outcomeIndex) => (
                        <div key={outcome.id} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-medium text-xs flex-shrink-0 mt-1">
                            {outcomeIndex + 1}
                          </div>
                          <div className="flex-1 flex items-center gap-2">
                            <Input
                              value={outcome.text}
                              onChange={(e) => updateLearningOutcome(dayIndex, outcome.id, e.target.value)}
                              placeholder="Learning outcome"
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLearningOutcome(dayIndex, outcome.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default CustomizeLessonPlan;