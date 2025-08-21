
import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { BookOpen, Calculator, Sparkles, Edit, Save, ArrowLeft, Clock, Target, Globe, BookMarked } from 'lucide-react';
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import { generateLessonData, saveLessonData } from '../services/grades';
import { SpinnerOverlay } from '../pages/SpinnerOverlay';
import path from 'path';

interface Topic {
  title: string;
  summary: string;
  time_minutes: number;
}

interface LessonDay {
  day: number;
  topics: Topic[];
  learning_outcomes: string;
  real_world_applications: string;
  taxonomy_alignment: string;
}

interface GeneratedLessonPlan {
  chapter_number: string;
  chapter_title: string;
  total_days: number;
  lesson_plan: LessonDay[];
}

const CreateLessonPlan: React.FC = () => {
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const { showSnackbar } = useSnackbar();
  const { chapterId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const subject = searchParams.get('subject') || '';
  const className = searchParams.get('class') || '';
  const section = searchParams.get('section') || '';
  const classId = Number(searchParams.get('classId')) || '';
  const chapterName = decodeURIComponent(searchParams.get('chapterName') || '');
  const schoolId = Number(searchParams.get('school_id')) || userData.school_id || '';
  const subjectId = Number(searchParams.get('subjectId')) || '';
  const boardId = Number(searchParams.get('school_board_id')) || '';

  const pathData = `${subjectId}?class=${className}&class_id=${classId}&section=${section}&subject=${subject}&subject_id=${subjectId}&school_board_id=${boardId}&school_id=${schoolId}`
  let payload = {
    school_id: schoolId,
    board_id: boardId,
    class_id: classId,
    subject_id: subjectId,
    chapter_id: chapterId,
    num_days: null,
    time_period: null,
  }

  const [formData, setFormData] = useState({
    numberOfDays: '',
    classesPerDay: '',
    minutesPerClass: ''
  });

  const [showPreview, setShowPreview] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedLessonPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [loader, setLoader] = useState(false);

  const breadcrumbItems = [
    { label: 'Grades', path: '/grades' },
    { label: `${subject} - ${className} ${section}`, path: `/grades/syllabus/${pathData}` },
    { label: 'Create Lesson Plan' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateLesson = async () => {
    try {
      setLoader(true);
      payload = { ...payload, num_days: parseInt(formData.numberOfDays), time_period: parseInt(formData.minutesPerClass) * parseInt(formData.classesPerDay) };
      const response = await generateLessonData(payload);
      if (response && response.data) {
        //console.log('Generated Lesson Plan:', response.data);
        setGeneratedPlan(response.data);
        setShowPreview(true);
      }
    } catch (error) {
      //console.error('Error generating lesson plan:', error);
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    } finally {
      setIsGenerating(false);
      setLoader(false);
    }
  }

  const saveLessonPlan = async () => {
    if (!generatedPlan) return;

    try {
      setLoader(true);
      const response = await saveLessonData({
        lesson_plan_data: generatedPlan,
        school_id: schoolId,
        board_id: boardId,
        class_section_id: classId,
        subject_id: subjectId,
        chapter_id: Number(chapterId)
      });
      if (response && response.message) {
        showSnackbar({
          title: "Success",
          description: `${response.message} ✅ `,
          status: "success"
        });
        navigate(`/grades/syllabus/${pathData}`);
      }
    } catch (error) {
      //console.error('Error saving lesson plan:', error);
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    } finally {
      setLoader(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!formData.numberOfDays || !formData.classesPerDay || !formData.minutesPerClass) {
      alert('Please fill in all fields');
      return;
    }

    setIsGenerating(true);
    generateLesson();

    // Using the new sample data structure
    // setTimeout(() => {
    //   const samplePlan: GeneratedLessonPlan = {
    //     "chapter_number": "2",
    //     "chapter_title": "Sets",
    //     "total_days": 4,
    //     "lesson_plan": [
    //       {
    //         "day": 1,
    //         "topics": [
    //           {
    //             "title": "Introduction to Sets",
    //             "summary": "Discuss the concept of classification and grouping in daily life, leading to the mathematical idea of a 'set'. Use examples like classifying human teeth, organizing library books, or different number systems (Natural, Whole, Integers, Rational, Real). Emphasize the need for well-defined collections.",
    //             "time_minutes": 20
    //           },
    //           {
    //             "title": "Definition of a Set and Elements",
    //             "summary": "Formal definition of a set as a 'well-defined collection of distinct objects.' Introduce the term 'elements' for objects within a set. Explain the notation using curly brackets {} and the symbols for belongingness (∈) and not belonging (∉). Provide simple examples.",
    //             "time_minutes": 25
    //           },
    //           {
    //             "title": "Roster Form (Listing Method)",
    //             "summary": "Explain how to represent a set by listing all its elements within curly brackets, separated by commas. Discuss that the order of elements does not matter and elements are not repeated. Provide examples like set of vowels, set of digits in a number.",
    //             "time_minutes": 30
    //           },
    //           {
    //             "title": "Set Builder Form (Rule Method)",
    //             "summary": "Introduce the set builder form as a way to describe a set by stating a common property shared by all its elements. Explain the syntax `{x : x is a property}` and how to read it. Provide examples for sets that are difficult to list (e.g., rational numbers) and convert sets from roster to set builder form.",
    //             "time_minutes": 25
    //           }
    //         ],
    //         "learning_outcomes": "Students will be able to define a set, identify its elements, and represent sets using both roster and set-builder forms. They will understand the concept of well-defined collections.",
    //         "real_world_applications": "Classifying objects (e.g., types of animals, categories of food), organizing data (e.g., student groups, inventory management), defining criteria for inclusion in a group.",
    //         "taxonomy_alignment": "Remembering (define set, recall notations), Understanding (explain well-defined, differentiate forms), Applying (represent sets in different forms)."
    //       },
    //       {
    //         "day": 2,
    //         "topics": [
    //           {
    //             "title": "Empty Set (Null Set)",
    //             "summary": "Define an empty set as a set containing no elements. Introduce the symbols φ or {}. Provide examples of empty sets (e.g., natural numbers less than 1, odd numbers divisible by 2). Emphasize the distinction between φ and {0}.",
    //             "time_minutes": 25
    //           },
    //           {
    //             "title": "Universal Set and Subsets",
    //             "summary": "Introduce the concept of a universal set (U or μ) as the overarching set containing all elements relevant to a particular context. Define a subset (A ⊆ B) as a set where all elements of A are also in B. Explain proper subsets (A ⊂ B) and the properties that the null set is a subset of every set, and every set is a subset of itself. Use number systems (N, W, Z, Q, R) as examples of subsets.",
    //             "time_minutes": 40
    //           },
    //           {
    //             "title": "Venn Diagrams",
    //             "summary": "Explain Venn diagrams as a visual representation of sets and their relationships. Universal set is represented by a rectangle, and subsets by circles within it. Illustrate how to draw Venn diagrams for a universal set and its subsets, including cases where one set is a subset of another.",
    //             "time_minutes": 35
    //           }
    //         ],
    //         "learning_outcomes": "Students will be able to identify and define empty sets, understand the concept of universal sets, determine subset relationships, and visually represent sets using Venn diagrams.",
    //         "real_world_applications": "Categorizing items in a store (universal set: all items; subsets: fruits, vegetables), organizing biological classifications (universal set: all living things; subsets: animals, plants), database management (defining data types and relationships).",
    //         "taxonomy_alignment": "Understanding (explain types of sets, interpret Venn diagrams), Applying (draw Venn diagrams, identify subsets), Analyzing (distinguish between empty set and set containing zero)."
    //       },
    //       {
    //         "day": 3,
    //         "topics": [
    //           {
    //             "title": "Union of Sets (A ∪ B)",
    //             "summary": "Define the union of two sets A and B as the set containing all elements that are in A, or in B, or in both. Introduce the symbol ∪. Explain the notation A ∪ B = {x : x∈A or x∈B}. Provide examples and illustrate with Venn diagrams, showing the combined region.",
    //             "time_minutes": 35
    //           },
    //           {
    //             "title": "Intersection of Sets (A ∩ B)",
    //             "summary": "Define the intersection of two sets A and B as the set containing only the elements that are common to both A and B. Introduce the symbol ∩. Explain the notation A ∩ B = {x : x∈A and x∈B}. Provide examples, including disjoint sets (where intersection is the empty set), and illustrate with Venn diagrams, showing the overlapping region.",
    //             "time_minutes": 35
    //           },
    //           {
    //             "title": "Difference of Sets (A - B)",
    //             "summary": "Define the difference of two sets A and B (A - B) as the set containing elements that are in A but not in B. Explain the notation A - B = {x : x∈A and x∉B}. Emphasize that A - B is generally not equal to B - A. Provide examples and illustrate with Venn diagrams, showing the unique elements of one set.",
    //             "time_minutes": 30
    //           }
    //         ],
    //         "learning_outcomes": "Students will be able to perform union, intersection, and difference operations on sets, and represent these operations using Venn diagrams. They will understand the concept of disjoint sets.",
    //         "real_world_applications": "Combining customer lists (union), finding common interests in a group (intersection), identifying unique members in a team (difference), data filtering in spreadsheets.",
    //         "taxonomy_alignment": "Understanding (interpret set operations), Applying (perform set operations, draw Venn diagrams for operations), Analyzing (distinguish between A-B and B-A)."
    //       },
    //       {
    //         "day": 4,
    //         "topics": [
    //           {
    //             "title": "Equal Sets",
    //             "summary": "Define equal sets as two sets A and B where every element in A belongs to B, and every element in B belongs to A (i.e., A ⊆ B and B ⊆ A). Introduce the symbol =. Provide examples to differentiate between equal sets and sets that are merely similar in appearance but not equal.",
    //             "time_minutes": 25
    //           },
    //           {
    //             "title": "Finite and Infinite Sets",
    //             "summary": "Define finite sets as sets whose elements can be counted and the counting process comes to an end (e.g., set of days in a week). Define infinite sets as sets whose elements cannot be counted or the counting process never ends (e.g., set of natural numbers). Provide clear examples for both types.",
    //             "time_minutes": 30
    //           },
    //           {
    //             "title": "Cardinality of a Finite Set",
    //             "summary": "Define the cardinality (or cardinal number) of a finite set A as the number of distinct elements in the set, denoted as n(A). Explain how to count elements, especially when there are repetitions (only distinct elements are counted). State that the cardinality of an empty set is 0.",
    //             "time_minutes": 25
    //           },
    //           {
    //             "title": "Chapter Review and Problem Solving",
    //             "summary": "A quick recap of all concepts covered in the chapter. Engage students in solving mixed problems that require applying multiple concepts learned throughout the chapter, including identifying set types, performing operations, and determining cardinality.",
    //             "time_minutes": 20
    //           }
    //         ],
    //         "learning_outcomes": "Students will be able to determine if two sets are equal, classify sets as finite or infinite, and calculate the cardinality of finite sets. They will consolidate their understanding of all chapter concepts through problem-solving.",
    //         "real_world_applications": "Inventory management (counting distinct items), population studies (finite vs. infinite populations), resource allocation (determining the number of available resources), data analysis (counting unique entries).",
    //         "taxonomy_alignment": "Understanding (differentiate finite/infinite, explain equal sets), Applying (calculate cardinality, solve mixed problems), Evaluating (determine if sets are equal based on criteria)."
    //       }
    //     ]
    //   };

    //   setGeneratedPlan(samplePlan);
    //   setShowPreview(true);
    //   setIsGenerating(false);
    // }, 2000);
  };

  const handleSaveLessonPlan = () => {
    console.log('Saving lesson plan:', generatedPlan);
    saveLessonPlan();
  };

  const handleBackToForm = () => {
    setShowPreview(false);
    setGeneratedPlan(null);
  };

  const updateDayContent = (dayIndex: number, field: keyof LessonDay, value: string) => {
    if (!generatedPlan) return;

    const updatedPlan = { ...generatedPlan };
    if (field !== 'topics' && field !== 'day') {
      updatedPlan.lesson_plan[dayIndex][field] = value;
    }
    setGeneratedPlan(updatedPlan);
  };

  if (showPreview && generatedPlan) {
    return (
      <MainLayout pageTitle="AI Generated Lesson Plan Breakdown">
        <div className="space-y-8">
          <Breadcrumb items={breadcrumbItems} />

          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
              <div>
                {/* <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Generated Lesson Plan Breakdown</h1> */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-md md:text-lg font-medium text-gray-700">Class: {subject} - {className}</p>
                  <p className="text-base text-gray-600">Subject: {subject}</p>
                  <p className="text-base text-gray-600">Chapter: Chapter {generatedPlan.chapter_number}: {generatedPlan.chapter_title}</p>
                  <p className="text-base text-gray-600">Total Days: {generatedPlan.total_days}</p>
                </div>
              </div>
              <div className="flex m-4 md:m-0 gap-3">
                <Button
                  onClick={handleBackToForm}
                  variant="outline"
                  className="flex items-center gap-1 md:gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Form
                </Button>
                <Button
                  onClick={handleSaveLessonPlan}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 md:gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Lesson Plan
                </Button>
              </div>
            </div>

            <div className="space-y-8">
              {generatedPlan.lesson_plan.map((day, index) => (
                <Card key={day.day} className="shadow-lg border-0">
                  <CardHeader className="bg-blue-50 border-b border-blue-200">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl text-blue-800 flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {day.day}
                        </div>
                        Day {day.day}
                      </CardTitle>
                      {/* <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingDay(editingDay === index ? null : index)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                      >
                        <Edit className="w-4 h-4" />
                      </Button> */}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Topics Section */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        Topics & Activities
                      </h4>
                      <div className="space-y-4">
                        {day.topics.map((topic, topicIndex) => (
                          <div key={topicIndex} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-semibold text-gray-800 flex-1">{topic.title}</h5>
                              <div className="flex items-center gap-1 text-sm text-gray-600 bg-white px-2 py-1 rounded-full border">
                                <Clock className="w-3 h-3" />
                                {topic.time_minutes} min
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{topic.summary}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Learning Outcomes, Applications, and Taxonomy */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          Learning Outcomes
                        </h4>
                        {editingDay === index ? (
                          <Textarea
                            value={day.learning_outcomes}
                            onChange={(e) => updateDayContent(index, 'learning_outcomes', e.target.value)}
                            className="min-h-[100px] border-2 border-green-300 focus:border-green-500 text-sm"
                          />
                        ) : (
                          <p className="text-green-700 text-sm leading-relaxed">{day.learning_outcomes}</p>
                        )}
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
                          <Globe className="w-5 h-5" />
                          Real World Applications
                        </h4>
                        {editingDay === index ? (
                          <Textarea
                            value={day.real_world_applications}
                            onChange={(e) => updateDayContent(index, 'real_world_applications', e.target.value)}
                            className="min-h-[100px] border-2 border-purple-300 focus:border-purple-500 text-sm"
                          />
                        ) : (
                          <p className="text-purple-700 text-sm leading-relaxed">{day.real_world_applications}</p>
                        )}
                      </div>

                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <h4 className="text-lg font-semibold text-orange-800 mb-3 flex items-center gap-2">
                          <BookMarked className="w-5 h-5" />
                          Taxonomy Alignment
                        </h4>
                        {editingDay === index ? (
                          <Textarea
                            value={day.taxonomy_alignment}
                            onChange={(e) => updateDayContent(index, 'taxonomy_alignment', e.target.value)}
                            className="min-h-[100px] border-2 border-orange-300 focus:border-orange-500 text-sm"
                          />
                        ) : (
                          <p className="text-orange-700 text-sm leading-relaxed">{day.taxonomy_alignment}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <MainLayout pageTitle="Create Lesson Plan">
        <div className="space-y-8">
          <Breadcrumb items={breadcrumbItems} />

          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Lesson Plan</h1>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <p className="text-lg font-medium text-gray-700">Class: {subject} - {className}</p>
                <p className="text-base text-gray-600">Subject: {subject}</p>
                <p className="text-base text-gray-600">Chapter: Chapter {chapterId}: {chapterName}</p>
              </div>
            </div>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  Lesson Plan Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Number of Days:
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter number of days (e.g., 5)"
                      value={formData.numberOfDays}
                      onChange={(e) => handleInputChange('numberOfDays', e.target.value)}
                      className="text-base py-3 border-2 border-gray-200 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Classes per Day:
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 1"
                      value={formData.classesPerDay}
                      onChange={(e) => handleInputChange('classesPerDay', e.target.value)}
                      className="text-base py-3 border-2 border-gray-200 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Minutes per Class:
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 45"
                      value={formData.minutesPerClass}
                      onChange={(e) => handleInputChange('minutesPerClass', e.target.value)}
                      className="text-base py-3 border-2 border-gray-200 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleGenerateWithAI}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 text-lg font-medium flex items-center justify-center gap-3 rounded-xl shadow-lg disabled:opacity-50"
                  >
                    <Sparkles className="w-5 h-5" />
                    {isGenerating ? 'Generating...' : 'Generate with AI'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
      {
        loader && (
          <SpinnerOverlay />
        )
      }
    </>
  );
};

export default CreateLessonPlan;
