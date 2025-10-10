import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Clock, X, BookOpen, Lightbulb, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import { SpinnerOverlay } from '../pages/SpinnerOverlay';
import { getLessonPlanByChapter } from '../services/syllabusProgress';
import { useParams, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

interface Topic {
  title: string;
  summary: string;
  time_minutes: number;
}

interface DayPlan {
  day: number;
  learning_outcomes: string;
  real_world_applications: string;
  taxonomy_alignment: string;
  status: string;
  completed_date?: string;
  topics: Topic[];
}

interface LessonPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chapterName: string;
  chapterId: string;
}

// Sample lesson plan data
const sampleDayPlans: DayPlan[] = [
  {
    day: 1,
    learning_outcomes: "- Understand and apply Euclid's Division Lemma.\n- Use Euclid's Algorithm to find the HCF of two positive integers.\n- Apply the Division Algorithm to prove properties of even and odd integers.",
    real_world_applications: "Used in cryptography for secure communication, in computer algorithms for efficient calculations, and in scheduling tasks that repeat in cycles.",
    taxonomy_alignment: "- **Understanding**: Euclid's Division Lemma, properties of integers.\n- **Applying**: Euclid's Algorithm for HCF, classifying numbers.\n- **Analyzing**: Identifying patterns in integer forms.",
    status: "completed",
    completed_date: "2025-10-11T00:17:31.826+05:30",
    topics: [
      {
        title: "Introduction to Real Numbers and Division Algorithm",
        summary: "Real numbers encompass all rational and irrational numbers, forming a continuous line without gaps. The Division Algorithm states that for any two positive integers, a (dividend) and b (divisor), there exist unique whole numbers q (quotient) and r (remainder) such that a = bq + r, where 0 ≤ r < b.",
        time_minutes: 10
      },
      {
        title: "Euclid's Division Algorithm for HCF",
        summary: "Euclid's Division Algorithm is a systematic procedure to compute the Highest Common Factor (HCF) of two positive integers. It involves repeatedly applying the Division Lemma until the remainder becomes zero, with the last non-zero divisor being the HCF.\nExample: Find the HCF of 60 and 100 using Euclid's Algorithm.\n100 = 60 × 1 + 40\n60 = 40 × 1 + 20\n40 = 20 × 2 + 0\nHCF(60, 100) = 20",
        time_minutes: 20
      },
      {
        title: "Applications of Division Algorithm (Even/Odd Integers)",
        summary: "The Division Algorithm can be used to prove properties of integers, such as classifying them as even or odd. Any positive even integer can be expressed in the form 2q, and any positive odd integer in the form 2q + 1, for some integer q.\nExample: Show that every positive odd integer is of the form 4q + 1 or 4q + 3.\nLet a be a positive odd integer and b = 4. By division algorithm, a = 4q + r, where 0 ≤ r < 4. Possible remainders are 0, 1, 2, 3. Since a is odd, it cannot be 4q or 4q + 2. Thus, a is of the form 4q + 1 or 4q + 3.",
        time_minutes: 15
      }
    ]
  },
  {
    day: 2,
    learning_outcomes: "- Understand the Fundamental Theorem of Arithmetic.\n- Apply prime factorization to find HCF and LCM of integers.\n- Classify rational numbers based on their terminating or non-terminating decimal expansions.",
    real_world_applications: "Essential for secure online transactions (cryptography), in computer science for data compression, and in engineering for designing efficient systems.",
    taxonomy_alignment: "- **Understanding**: Fundamental Theorem of Arithmetic, decimal expansions.\n- **Applying**: Prime factorization for HCF/LCM, predicting decimal type.\n- **Analyzing**: Relating prime factors of denominator to decimal behavior.",
    status: "completed",
    completed_date: "2025-10-11T00:17:37.316+05:30",
    topics: [
      {
        title: "Fundamental Theorem of Arithmetic (Prime Factorization)",
        summary: "Every composite number can be uniquely expressed as a product of prime numbers, regardless of the order of the prime factors. This theorem is fundamental to number theory and ensures a unique prime factorization for every integer greater than one.\nExample: Express 27300 as a product of its prime factors.\n27300 = 2 × 2 × 3 × 5 × 5 × 7 × 13 = 2² × 3 × 5² × 7 × 13",
        time_minutes: 15
      },
      {
        title: "HCF and LCM using Prime Factorization",
        summary: "The HCF of two numbers is the product of the smallest power of each common prime factor. The LCM is the product of the greatest power of each prime factor involved in the numbers' factorizations.\nExample: Find the HCF and LCM of 12 and 18.\n12 = 2² × 3\n18 = 2 × 3²\nHCF(12, 18) = 2¹ × 3¹ = 6\nLCM(12, 18) = 2² × 3² = 36",
        time_minutes: 10
      },
      {
        title: "Rational Numbers and Decimal Expansions",
        summary: "A rational number has a terminating decimal expansion if its denominator, when expressed in simplest form, has only 2 or 5 as prime factors (form 2ⁿ5ᵐ). Otherwise, it has a non-terminating, repeating decimal expansion.\nExample: Without actual division, state if 16/125 has a terminating or non-terminating decimal expansion.\n125 = 5³, which is of the form 2ⁿ5ᵐ (where n=0). So, it has a terminating decimal expansion.\nExample: Write 35/50 in decimal form without actual division.\n35/50 = 7/10 = 0.7",
        time_minutes: 20
      }
    ]
  }
];

const LessonPlanDialog: React.FC<LessonPlanDialogProps> = ({ isOpen, onClose, chapterName, chapterId }) => {
  const { classId, subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const { showSnackbar } = useSnackbar();
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user") || '{}');
  const [loader, setLoader] = useState(true);
  const [lessonPlans, setLessonPlans] = useState<DayPlan[]>(sampleDayPlans);
  const [selectedDay, setSelectedDay] = useState(0);
  const className = searchParams.get('className') || '';
  const subjectName = searchParams.get('subjectName') || '';
  const teacherName = searchParams.get('teacherName') || '';
  const progress = searchParams.get('progress') || '0';
  
  const currentDayPlan = lessonPlans[selectedDay];
  const totalMinutes = currentDayPlan?.topics.reduce((sum, topic) => sum + topic.time_minutes, 0) || 0;


  const getLessonPlanByChapterData = async () => {
    try {
      const schoolId = userData.school_id;
      const payload = { school_id: schoolId, class_section_id: classId, subject_id: subjectId, chapter_id: chapterId };
      const response = await getLessonPlanByChapter(payload);
      if (response && response.data) {
        setLessonPlans(response.data);
        setLoader(false);
      }
      else {
        showSnackbar({
          title: "⛔ Error",
          description: "Something went wrong",
          status: "error"
        });
        setLoader(false);
      }
    } catch (error: any) {
      setLoader(false);
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }

  useEffect(() => {
    getLessonPlanByChapterData();
  }, []);

  const handlePrevDay = () => {
    if (selectedDay > 0) {
      setSelectedDay(selectedDay - 1);
    }
  };

  const handleNextDay = () => {
    if (selectedDay < lessonPlans.length - 1) {
      setSelectedDay(selectedDay + 1);
    }
  };

  if (!currentDayPlan) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b bg-card sticky top-0 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-foreground">Lesson Plan Activities</DialogTitle>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Clock className="w-4 h-4" />
                  <span>Total: {totalMinutes} minutes</span>
                </div>
                {lessonPlans.length > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handlePrevDay}
                      disabled={selectedDay === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium">Day {currentDayPlan.day}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleNextDay}
                      disabled={selectedDay === lessonPlans.length - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 hover:bg-muted"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Topics Section */}
            <div className="space-y-4">
              {currentDayPlan.topics.map((topic, index) => (
                <div key={index} className="flex gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-semibold text-foreground flex-1">{topic.title}</h3>
                      <div className="flex items-center gap-1 text-sm text-blue-600 bg-white px-3 py-1 rounded-full border flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        {topic.time_minutes} min
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{topic.summary}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Learning Outcomes, Real World Applications, and Taxonomy Alignment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-green-700" />
                  <h3 className="font-semibold text-green-800">Learning Outcomes</h3>
                </div>
                <div className="text-sm text-green-700 leading-relaxed prose prose-sm prose-green max-w-none">
                  <ReactMarkdown>{currentDayPlan.learning_outcomes}</ReactMarkdown>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-purple-700" />
                  <h3 className="font-semibold text-purple-800">Real World Applications</h3>
                </div>
                <div className="text-sm text-purple-700 leading-relaxed prose prose-sm prose-purple max-w-none">
                  <ReactMarkdown>{currentDayPlan.real_world_applications}</ReactMarkdown>
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-orange-700" />
                  <h3 className="font-semibold text-orange-800">Taxonomy Alignment</h3>
                </div>
                <div className="text-sm text-orange-700 leading-relaxed prose prose-sm prose-orange max-w-none">
                  <ReactMarkdown>{currentDayPlan.taxonomy_alignment}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LessonPlanDialog;
