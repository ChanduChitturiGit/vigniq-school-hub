import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Input } from './input';
import { Button } from './button';
import { Trash2, Plus } from 'lucide-react';

export interface ClassSectionSubjectData {
  class: string;
  section: string;
  subject: string;
  assignment?: any;
}

interface ClassSectionSubjectInputProps {
  data: ClassSectionSubjectData[];
  onChange: (data: ClassSectionSubjectData[]) => void;
  availableClasses?: any[];
  availableSubjects?: any[];
}

export const ClassSectionSubjectInput: React.FC<ClassSectionSubjectInputProps> = ({
  data,
  onChange,
  availableClasses = [],
  availableSubjects = []
}) => {
  const [newEntry, setNewEntry] = useState<ClassSectionSubjectData>({
    class: '',
    section: '',
    subject: '',
    assignment: undefined
  });

  const addEntry = () => {
    if (newEntry.class && newEntry.section && newEntry.subject) {
      onChange([...data, { ...newEntry }]);
      setNewEntry({ class: '', section: '', subject: '', assignment: undefined });
    }
  };

  const removeEntry = (index: number) => {
    const updatedData = data.filter((_, i) => i !== index);
    onChange(updatedData);
  };

  const updateEntry = (index: number, field: keyof ClassSectionSubjectData, value: string) => {
    const updatedData = data.map((entry, i) => 
      i === index ? { ...entry, [field]: value } : entry
    );
    onChange(updatedData);
  };

  return (
    <div className="space-y-4">
      {/* Existing entries */}
      {data.map((entry, index) => (
        <div key={index} className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg">
          <Select
            value={entry.class}
            onValueChange={(value) => updateEntry(index, 'class', value)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {availableClasses.map((cls) => (
                <SelectItem key={cls.id} value={cls.name}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Section"
            value={entry.section}
            onChange={(e) => updateEntry(index, 'section', e.target.value)}
            className="flex-1"
          />

          <Select
            value={entry.subject}
            onValueChange={(value) => updateEntry(index, 'subject', value)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {availableSubjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.name}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => removeEntry(index)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}

      {/* Add new entry */}
      <div className="flex gap-2 items-center p-3 border-2 border-dashed border-gray-300 rounded-lg">
        <Select
          value={newEntry.class}
          onValueChange={(value) => setNewEntry({ ...newEntry, class: value })}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent>
            {availableClasses.map((cls) => (
              <SelectItem key={cls.id} value={cls.name}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Section"
          value={newEntry.section}
          onChange={(e) => setNewEntry({ ...newEntry, section: e.target.value })}
          className="flex-1"
        />

        <Select
          value={newEntry.subject}
          onValueChange={(value) => setNewEntry({ ...newEntry, subject: value })}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select Subject" />
          </SelectTrigger>
          <SelectContent>
            {availableSubjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.name}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          onClick={addEntry}
          size="icon"
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
