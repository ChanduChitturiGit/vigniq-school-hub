
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Edit, Mail, Phone, Calendar, GraduationCap, BookOpen, Plus, X } from 'lucide-react';
import { getTeachersById, editTeacher } from '../services/teacher';
import ClassSectionSubjectInput, { ClassSectionSubjectData } from '../components/ui/class-section-subject-input';
import { getSubjectsBySchoolId } from '../services/subject';
import { getClassesBySchoolId } from '@/services/class';
import { useSnackbar } from "../components/snackbar/SnackbarContext";

const TeacherDetails: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const schoolId = localStorage.getItem('current_school_id');
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    teacher_first_name: '',
    teacher_last_name: '',
    email: '',
    phone_number: '',
    subject: '',
    experience: '',
    qualification: '',
    joiningDate: '',
    address: '',
    emergencyContact: '',
    subject_assignments: [],
    school_id : null
  });
  const [breadcrumbItems, setBreadCrumbItems] = useState([
    { label: 'My School', path: '/admin-school' },
    { label: `Teacher Details - ${formData.teacher_first_name + ' ' + formData.teacher_last_name}` }
  ]);
  const [teachingAssignments, setTeachingAssignments] = useState<ClassSectionSubjectData[]>([{
    class: '', subject: '',
    assignment: undefined
  }]);
  const [teacherAssignments,seTeacherAssignments] = useState([]);




  const setBreadCrumb = () => {
    if (userData.role == 'superadmin') {
      setBreadCrumbItems([
        { label: 'Schools', path: '/schools' },
        { label: 'My School', path: `/school-details/${schoolId}` },
        { label: `Teacher Details - ${formData.teacher_first_name + ' ' + formData.teacher_last_name}` }
      ])
    } else {
      setBreadCrumbItems([
        { label: 'My School', path: '/admin-school' },
        { label: `Teacher Details - ${formData.teacher_first_name + ' ' + formData.teacher_last_name}` }
      ]);
    }
  }

  const sampleClasses = [
    { id: '1', name: 'Class 9', section: 'A', students: 25 },
    { id: '2', name: 'Class 10', section: 'B', students: 28 }
  ];

  const getTeacher = async () => {
    if (userData && userData.role && userData.role == 'superadmin') {
      userData.school_id = localStorage.getItem('current_school_id');
    }
    const response = await getTeachersById(Number(id), userData.school_id);
    if (response && response.data) {
      getClasses();
      subjectsList();
      setFormData(response.data);
      setBreadCrumb();
      seTeacherAssignments(response.data.subject_assignments);
    }
  }

  const editTeacherData = async () => {
    try {
      // setTeachingAssignments([...teachingAssignments,...teacherAssignments]);
      let validAssignments = teachingAssignments.filter(assignment =>
        assignment.class && assignment.subject
      );
      validAssignments = [...validAssignments,...teacherAssignments];
      // console.log("validAssignments",validAssignments);
      formData.subject_assignments = validAssignments;
      formData.school_id = Number(userData.role == 'superadmin' ? schoolId : userData.schoo_id);
      const response = await editTeacher(formData);
      if (response && response.message) {
        // console.log("editTeacherData", response);
        showSnackbar({
          title: "Sucess",
          description: response.message,
          status: "success"
        });
      }
    } catch (error: any) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }

  const subjectsList = async () => {
    const response = await getSubjectsBySchoolId(userData.role == 'superadmin' ? schoolId : userData.school_id);
    if (response && response) {
      setSubjects(response);
    }
  }

  //classes list api
  const getClasses = async () => {
    //classes list api
    const classesData = await getClassesBySchoolId(userData.role == 'superadmin' ? schoolId : userData.school_id);
    if (classesData && classesData.classes) {
      setClasses(classesData.classes);
    }
  }


  useEffect(() => {
    getTeacher();
    // setBreadCrumb();
  }, [])

  useEffect(() => {
    if (formData.teacher_first_name && formData.teacher_last_name) {
      setBreadCrumb();
    }
  }, [formData.teacher_first_name, formData.teacher_last_name]);

  const handleAssignmentChange = (index: number, data: ClassSectionSubjectData) => {
    const updatedAssignments = [...teachingAssignments];
    data[`class_id`] = (data.class != '' && !data['class_id']) ? getClassId(data.class) : data['class_id'] ? data['class_id'] : null;
    data[`subject_id`] = (data.subject != '' && !data['subject_id']) ? getSubjectId(data.subject) : null;
    updatedAssignments[index] = data;
    setTeachingAssignments(updatedAssignments);
  };

  const handleRemoveAssignment = (indexToRemove: number) => {
    seTeacherAssignments((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };


  const addNewAssignment = () => {
    setTeachingAssignments([...teachingAssignments, {
      class: '', subject: '',
      assignment: undefined
    }]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const removeAssignment = (index: number) => {
    if (teachingAssignments.length > 1) {
      const updatedAssignments = teachingAssignments.filter((_, i) => i !== index);
      setTeachingAssignments(updatedAssignments);
    }
  };

  const getClassId = (className: string) => {
    const classdata = classes.find((val: any) => ('Class ' + val.class_number + ' - ' + val.section) == className);
    const classId = classdata.class_id ? classdata.class_id : 0;
    return classId;
  }


  const getSubjectId = (subjectName: string) => {
    const subjectdata = subjects.find((val: any) => (val.name) == subjectName);
    const subjectId = subjectdata.id ? subjectdata.id : 0;
    return subjectId;
  }

  const handleSave = () => {
    // Simulate API call
    editTeacherData();
    // console.log('Saving teacher data:', formData);
    setIsEditing(false);
    // Add success toast here
  };

  return (
    <MainLayout pageTitle={`Teacher Details - ${formData.teacher_first_name + ' ' + formData.teacher_last_name}`}>
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Teacher Profile Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-semibold">{formData.teacher_first_name.charAt(0)}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{formData.teacher_first_name + ' ' + formData.teacher_last_name}</h1>
                <p className="text-gray-600">{formData.subject} Teacher</p>
                <p className="text-sm text-gray-500">Employee ID: T{id?.padStart(4, '0')}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="teacher_first_name"
                    value={formData.teacher_first_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.teacher_first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="teacher_last_name"
                    value={formData.teacher_last_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.teacher_last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{formData.email}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{formData.phone_number}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.address}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Professional Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{formData.subject}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{formData.qualification}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.experience}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{new Date(formData.joiningDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.emergencyContact}</p>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Teaching Assignments (Optional)</label>
                <button
                  type="button"
                  onClick={addNewAssignment}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Assignment
                </button>
              </div>

              <div className="space-y-4">
                {teacherAssignments.map((assignment, index) => (
                  <div key={index*10} className="flex items-center justify-between gap-2 bg-gray-100 p-2 rounded my-1">
                    <span>Class :  {'Class '+assignment.class_number+' - '+assignment.section}</span>
                    <span>Subject : {assignment.subject_name}</span>
                    <button
                      onClick={() => handleRemoveAssignment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                       <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {teachingAssignments.map((assignment, index) => (
                  <ClassSectionSubjectInput
                    key={index}
                    data={{ "assignment": assignment, "subject_assignments": formData.subject_assignments, "subjects": subjects, "classes": classes }}
                    onChange={(data) => handleAssignmentChange(index, data)}
                    onRemove={() => removeAssignment(index)}
                    canRemove={teachingAssignments.length > 1}
                  />
                ))}
              </div>
            </div>
          )}

          {isEditing && (
            <div className="flex gap-2 mt-6 pt-4 border-t">
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Assigned Classes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Assigned Classes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formData.subject_assignments.map((classItem) => (
              <Link
                key={classItem.class_id}
                to={`/class-details/${classItem.class_id}`}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-800">
                  {'Class ' + classItem.class_number + ' - ' + classItem.section}
                </h3>
                <p className="text-sm text-gray-600">Subject : {classItem.subject_name}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TeacherDetails;
