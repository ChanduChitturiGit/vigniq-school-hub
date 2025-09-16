
import React from 'react';
import { X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface ClassSectionSubjectData {
  assignment: ClassSectionSubjectData;
  class: string;
  subject: string;
}

interface ClassSectionSubjectInputProps {
  data: any;
  onChange: (data: ClassSectionSubjectData) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const ClassSectionSubjectInput: React.FC<ClassSectionSubjectInputProps> = ({
  data,
  onChange,
  onRemove,
  canRemove
}) => {
  const handleInputChange = (field: keyof ClassSectionSubjectData, value: string) => {
    onChange({
      ...data.assignment,
      [field]: value
    });
  };

  const sampleClasses = [
    'Class 1 - A', 'Class 2 - B'
  ];

  const classes =  data.classes;

  const sections = ['A', 'B', 'C', 'D', 'E', 'F'];

  const sampleSubjects =[
    'Mathematics', 'English', 'Science', 'Physics', 'Chemistry',
    'Biology', 'History', 'Geography', 'Hindi', 'Sanskrit',
    'Computer Science', 'Physical Education', 'Art', 'Music'
  ]
  const subjects = data.subjects;

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">Teaching Assignment</h4>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 transition-colors"
            title="Remove this assignment"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <Select value={data.class} onValueChange={(value) => handleInputChange('class', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent >
              {classes && classes.map((cls) => (
                <SelectItem key={cls} value={'Class '+ cls.class_number+' - '+cls.section + ' ('+cls.school_board_name+')'}>
                  {'Class '+ cls.class_number+' - '+cls.section + ' ('+cls.school_board_name+')'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <Select value={data.subject} onValueChange={(value) => handleInputChange('subject', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent className='h-64'>
              {subjects && subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.name}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ClassSectionSubjectInput;
export type { ClassSectionSubjectData };