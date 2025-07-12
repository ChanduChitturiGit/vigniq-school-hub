
import React from 'react';
import { X } from 'lucide-react';

interface ClassSectionSubjectData {
  class: string;
  section: string;
  subject: string;
}

interface ClassSectionSubjectInputProps {
  data: ClassSectionSubjectData;
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
      ...data,
      [field]: value
    });
  };

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
          <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
          <input
            type="text"
            value={data.class}
            onChange={(e) => handleInputChange('class', e.target.value)}
            placeholder="e.g., Class 6"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
          <input
            type="text"
            value={data.section}
            onChange={(e) => handleInputChange('section', e.target.value)}
            placeholder="e.g., A, B, C"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
          <input
            type="text"
            value={data.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            placeholder="e.g., Math, Science"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default ClassSectionSubjectInput;
export type { ClassSectionSubjectData };
