
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import { getClasses } from '../data/classes';
import { Users, Plus } from 'lucide-react';

const Classes: React.FC = () => {
  const { user } = useAuth();
  const classes = getClasses();

  return (
    <MainLayout pageTitle="Classes">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Classes</h1>
          {user?.role === 'Admin' && (
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Class
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <Link
              key={classItem.id}
              to={`/class-students/${classItem.id}`}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {classItem.name} - {classItem.section}
                  </h3>
                  <p className="text-sm text-gray-500">{classItem.academicYear}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Students:</span>
                  <span className="font-medium text-gray-800">25</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Teacher:</span>
                  <span className="font-medium text-gray-800">Jane Doe</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Classes;
