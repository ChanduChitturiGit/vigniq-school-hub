import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Clock, X } from 'lucide-react';
import { Button } from './ui/button';
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import { SpinnerOverlay } from '../pages/SpinnerOverlay';
import { getLessonPlanByChapter } from '../services/syllabusProgress';
import { useParams, useSearchParams } from 'react-router-dom';

interface Topic {
  id: string;
  title: string;
  description: string;
  duration: number;
}

interface LessonPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chapterName: string;
  chapterId: string;
}

// Sample lesson plan data
const sampleTopics: Topic[] = [
  {
    id: '1',
    title: 'Introduction to Real Numbers',
    description: 'Real numbers encompass all rational and irrational numbers, forming a continuous line. This chapter will delve into important properties of positive integers within this number system.',
    duration: 5
  },
  {
    id: '2',
    title: 'The Fundamental Theorem of Arithmetic (FTA)',
    description: 'Every composite number can be uniquely expressed as a product of prime numbers, regardless of the order of the factors. This theorem highlights that each composite number has a distinct prime factorization.',
    duration: 15
  },
  {
    id: '3',
    title: 'Prime Factorization Method',
    description: 'Prime factorization is the process of breaking down a composite number into prime number components. A factor tree is a visual tool that helps systematically find these prime factors.',
    duration: 15
  },
  {
    id: '4',
    title: 'Application of FTA (Ending with Zero)',
    description: 'For a number to end with the digit zero, its prime factorization must include both 2 and 5. The Fundamental Theorem of Arithmetic ensures that every composite number has a unique prime factorization.',
    duration: 10
  },
];

const LessonPlanDialog: React.FC<LessonPlanDialogProps> = ({ isOpen, onClose, chapterName, chapterId }) => {
  const { classId, subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const { showSnackbar } = useSnackbar();
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user") || '{}');
  const [loader, setLoader] = useState(true);
  const className = searchParams.get('className') || '';
  const subjectName = searchParams.get('subjectName') || '';
  const teacherName = searchParams.get('teacherName') || '';
  const progress = searchParams.get('progress') || '0';
  const totalMinutes = sampleTopics.reduce((sum, topic) => sum + topic.duration, 0);


  const getLessonPlanByChapterData = async () => {
    try {
      const schoolId = userData.school_id;
      const payload = { school_id: schoolId, class_section_id: classId, subject_id: subjectId, chapter_id: chapterId };
      const response = await getLessonPlanByChapter(payload);
      if (response && response.data) {
        setLoader(false);
        //setChaptersData(response.data.chapters);
      }
      else {
        showSnackbar({
          title: "⛔ Error",
          description: "Something went wrong",
          status: "error"
        });
        setLoader(false);
      }
    } catch (error) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b bg-card sticky top-0 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-foreground">Lesson Plan Activities</DialogTitle>
              <div className="flex items-center gap-2 text-sm text-blue-600 mt-2">
                <Clock className="w-4 h-4" />
                <span>Total: {totalMinutes} minutes</span>
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
          <div className="space-y-4">
            {sampleTopics.map((topic, index) => (
              <div key={topic.id} className="flex gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-semibold text-foreground flex-1">{topic.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground bg-background px-3 py-1 rounded-full border flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {topic.duration} min
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{topic.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LessonPlanDialog;
