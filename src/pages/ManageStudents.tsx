
import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { Edit, Trash2, Plus } from 'lucide-react';

interface Student {
  id: string;
  studentId: string;
  fullName: string;
  class: string;
  dateOfBirth: string;
  parentGuardian: string;
  contact: string;
}

const ManageStudents: React.FC = () => {
  const [students] = useState<Student[]>([
    {
      id: '1',
      studentId: 'S001',
      fullName: 'John Doe',
      class: 'Class 10A',
      dateOfBirth: '15/05/2008',
      parentGuardian: 'Jane Doe',
      contact: 'john.doe@example.com'
    },
    {
      id: '2',
      studentId: 'S002',
      fullName: 'Alice Smith',
      class: 'Class 9B',
      dateOfBirth: '22/11/2009',
      parentGuardian: 'Robert Smith',
      contact: 'alice.smith@example.com'
    },
    {
      id: '3',
      studentId: 'S003',
      fullName: 'Michael Brown',
      class: 'Class 11C',
      dateOfBirth: '03/09/2007',
      parentGuardian: 'Sarah Brown',
      contact: 'michael.brown@example.com'
    },
    {
      id: '4',
      studentId: 'S004',
      fullName: 'Emily Davis',
      class: 'Class 8A',
      dateOfBirth: '10/02/2010',
      parentGuardian: 'David Davis',
      contact: 'emily.davis@example.com'
    }
  ]);

  return (
    <MainLayout pageTitle="Manage Students">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Manage Students</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Student
          </button>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">STUDENT ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">FULL NAME</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">CLASS</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">DATE OF BIRTH</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">PARENT/GUARDIAN</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">CONTACT</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{student.studentId}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.class}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.dateOfBirth}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.parentGuardian}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.contact}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-blue-600 hover:text-blue-700">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ManageStudents;
