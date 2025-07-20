
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import PasswordInput from '../components/ui/password-input';
import { getClassesBySchoolId } from '../services/class';
import { addStudent } from '../services/student';

const AddStudent: React.FC = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const [password, setPassword] = useState('');
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    user_name: '',
    email: '',
    phone_number: '',
    class: '',
    class_id: 1,
    school_id: userData.school_id,
    // section: '',
    roll_number: '',
    date_of_birth: '',
    gender: '',
    address: '',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    admission_date: ''
  });

  const breadcrumbItems = [
    // { label: 'User Management', path: '/user-management' },
    // { label: 'Schools', path: '/schools' },
    // { label: 'Greenwood High School', path: '/school-details/1' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Add Student' }
  ];

  const getClassId = (className: string) => {
    const classdata = classes.find((val: any) => val.class_name == className);
    const classId = classdata.class_id ? classdata.class_id : 1;
    return classId;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name == 'class') {
      const classId = getClassId(value);
      setFormData(prev => ({
        ...prev,
        'class_id': classId
      }));
    }
  };

  //classes list api
  const getClasses = async () => {
    //classes list api
    const classesData = await getClassesBySchoolId(userData.school_id);
    if (classesData && classesData.classes) {
      setClasses(classesData.classes);
    }
  }

  useEffect(() => {
    getClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.first_name || !formData.last_name || !formData.user_name ||
      !formData.class || !formData.roll_number ||
      !formData.date_of_birth || !formData.gender || !formData.parent_name ||
      !formData.parent_phone || !formData.admission_date || !password) {
      alert('Please fill in all required fields including password');
      return;
    }

    const studentData = {
      ...formData,
      password: password
    };

    console.log('Adding student:', studentData);

    const response = await addStudent(studentData);

    if (response && response.message) {
      alert('Student added successfully!');
      navigate('/school-details/1');
    }
    // Simulate API call with success
    // setTimeout(() => {
    //   alert('Student added successfully!');
    //   navigate('/school-details/1');
    // }, 500);
  };

  return (
    <MainLayout pageTitle="Add Student">
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Student</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Name *</label>
                <input
                  type="text"
                  name="user_name"
                  value={formData.user_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  placeholder="Enter password"
                  required
                  showGenerator
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Class</option>
                  {classes.map((classItem) => (
                    <option key={classItem.class_name + ' - ' + classItem.section} value={classItem.class_name + ' - ' + classItem.section}>
                      {classItem.class_name + ' - ' + classItem.section}
                    </option>
                  ))}
                </select>
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section *</label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Section</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number *</label>
                <input
                  type="text"
                  name="roll_number"
                  value={formData.roll_number}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admission Date *</label>
                <input
                  type="date"
                  name="admission_date"
                  value={formData.admission_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent/Guardian Name *</label>
                <input
                  type="text"
                  name="parent_name"
                  value={formData.parent_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone *</label>
                <input
                  type="tel"
                  name="parent_phone"
                  value={formData.parent_phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Email</label>
                <input
                  type="email"
                  name="parent_email"
                  value={formData.parent_email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Add Student
              </button>
              <button
                type="button"
                // onClick={() => navigate('/school-details/1')}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default AddStudent;
