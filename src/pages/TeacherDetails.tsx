import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import { Edit, Mail, Phone, Calendar, GraduationCap, BookOpen, Plus, X,User,Home } from 'lucide-react';
import { getTeachersById, editTeacher } from '../services/teacher';
import ClassSectionSubjectInput, { ClassSectionSubjectData } from '../components/ui/class-section-subject-input';
import { getSubjectsBySchoolId } from '../services/subject';
import { getClassesBySchoolId,getClassesWithoutClassTeacher } from '@/services/class';
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const TeacherDetails: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const userData = JSON.parse(localStorage.getItem("vigniq_current_user"));
  const schoolId = localStorage.getItem('current_school_id');
  const [classes, setClasses] = useState([]);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    teacher_first_name: '',
    teacher_last_name: '',
    email: '',
    phone_number: '',
    subject: '',
    experience: '',
    qualification: '',
    joining_date: '',
    current_address: '',      // <-- added
    permanent_address: '',    // <-- added
    emergencyContact: '',
    subject_assignments: [],
    school_id: null,
    class: '',
    class_assignment : {
      class_number: '',
      section: ''
    },
  });
  const [errors, setErrors] = useState({
    teacher_first_name: '',
    teacher_last_name: '',
    email: '',
    phone_number: '',
    qualification: '',
    joining_date: ''
    // No errors for address fields since they're optional
  });
  const [breadcrumbItems, setBreadCrumbItems] = useState([
    { label: 'My School', path: '/admin-school' },
    { label: `Teacher Details` }
  ]);
  const [teachingAssignments, setTeachingAssignments] = useState<ClassSectionSubjectData[]>([{
    class: '', subject: '',
    assignment: undefined
  }]);
  const [teacherAssignments, seTeacherAssignments] = useState([]);

  const setBreadCrumb = () => {
    const teacherName = (formData.teacher_first_name + ' ' + formData.teacher_last_name).toString();
    if (userData.role == 'superadmin') {
      setBreadCrumbItems([
        { label: 'Schools', path: '/schools' },
        { label: 'My School', path: `/school-details/${schoolId}` },
        { label: `Teacher Details - ${teacherName}` }
      ])
    } else {
      setBreadCrumbItems([
        { label: 'My School', path: '/admin-school' },
        { label: `Teacher Details - ${teacherName}` }
      ]);
    }
  }

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

  // --- Validation logic ---
  const validateField = (name: string, value: any) => {
    let error = '';
    switch (name) {
      case 'teacher_first_name':
        if (!value) error = 'First Name is required';
        break;
      case 'teacher_last_name':
        if (!value) error = 'Last Name is required';
        break;
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(value)) error = 'Email is invalid';
        break;
      case 'phone_number':
        if (!value) error = 'Phone is required';
        else if (!/^\d{10,15}$/.test(value)) error = 'Phone must be 10-15 digits';
        break;
      case 'qualification':
        if (!value) error = 'Qualification is required';
        break;
      case 'joining_date':
        if (!value) error = 'Joining Date is required';
        break;
      // No address validation
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const editTeacherData = async () => {
    // Validate all fields before API call
    const fieldsToValidate = [
      'teacher_first_name', 'teacher_last_name', 'email', 'phone_number', 'qualification', 'joining_date'
    ];
    fieldsToValidate.forEach(field => {
      validateField(field, (formData as any)[field]);
    });

    // Check for errors or missing fields
    const hasError =
      fieldsToValidate.some(field => !(formData as any)[field]) ||
      fieldsToValidate.some(field => errors[field as keyof typeof errors]);

    if (hasError) {
      showSnackbar({
        title: "⛔ Error",
        description: "Please fill all  the details in the form.",
        status: "error"
      });
      return;
    }

    try {
      let validAssignments = teachingAssignments.filter(assignment =>
        assignment.class && assignment.subject
      );
      validAssignments = [...validAssignments, ...teacherAssignments];
      formData.subject_assignments = validAssignments;
      formData.school_id = Number(userData.role == 'superadmin' ? schoolId : userData.schoo_id);
      const response = await editTeacher(formData);
      if (response && response.message) {
        showSnackbar({
          title: "Success",
          description: response.message,
          status: "success"
        });
        setIsEditing(false);
        getTeacher();
      }
    } catch (error: any) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  };

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

  //classes list api
  const getTeacherClasses = async () => {
    const classesData = await getClassesWithoutClassTeacher(userData.role == 'superadmin' ? schoolId : userData.school_id);
    if (classesData && classesData.classes) {
      setTeacherClasses(classesData.classes);
    }
  }


  useEffect(() => {
    getTeacher();
    getTeacherClasses();
  }, [])

  useEffect(() => {
    if (!isEditing) {
      setBreadCrumb();
    }
  }, [formData])

  useEffect(() => {
    if (!isEditing) {
      getTeacher();
    }
  }, [isEditing])

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



  const handleClassChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      class: value,
      class_section_id: getClassId(value)
    }));
    setErrors(prev => ({ ...prev, class: '' }));
  };

  const handleSave = () => {
    // Simulate API call
    editTeacherData();
    // console.log('Saving teacher data:', formData);
    setIsEditing(false);
    // Add success toast here
  };

  return (
    <MainLayout pageTitle={`Teacher Details`}>
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
                {/* <p className="text-sm text-gray-500">Employee ID: T{id?.padStart(4, '0')}</p> */}
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
                  <>
                    <input
                      type="text"
                      name="teacher_first_name"
                      value={formData.teacher_first_name}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.teacher_first_name && <p className="text-red-500 text-xs mt-1">{errors.teacher_first_name}</p>}
                  </>
                ) : (
                   <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{formData.teacher_first_name}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      name="teacher_last_name"
                      value={formData.teacher_last_name}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.teacher_last_name && <p className="text-red-500 text-xs mt-1">{errors.teacher_last_name}</p>}
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{formData.teacher_last_name}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                {isEditing ? (
                  <>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </>
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
                  <>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{formData.phone_number}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Address </label>
                {isEditing ? (
                  <textarea
                    name="current_address"
                    value={formData.current_address}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{formData.current_address}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permanent Address </label>
                {isEditing ? (
                  <textarea
                    name="permanent_address"
                    value={formData.permanent_address}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{formData.permanent_address}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Professional Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Teacher
                </label>
                {isEditing ? (
                  <Select value={formData.class} onValueChange={handleClassChange} disabled={teacherClasses.length === 0}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`${teacherClasses.length>0 ? 'Select a Class' : 'All Classes got assigned with teachers'}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {teacherClasses.map((classItem, index) => (
                        <SelectItem key={index} value={'Class ' + classItem.class_number + ' - ' + classItem.section}>
                          {'Class ' + classItem.class_number + ' - ' + classItem.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{'Class '+formData?.class_assignment?.class_number + ' '+ formData?.class_assignment?.section}</p>
                  </div>
                )
                }
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.qualification && <p className="text-red-500 text-xs mt-1">{errors.qualification}</p>}
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{formData.qualification}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date</label>
                {isEditing ? (
                  <>
                    <input
                      type="date"
                      name="joining_date"
                      value={formData.joining_date}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.joining_date && <p className="text-red-500 text-xs mt-1">{errors.joining_date}</p>}
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{new Date(formData.joining_date).toLocaleDateString('en-GB')}</p>
                  </div>
                )}
              </div>

              {/* <div>
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
              </div> */}
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
                  <div key={index * 10} className="flex items-center justify-between gap-2 bg-gray-100 p-2 rounded my-1">
                    <span>Class :  {'Class ' + assignment.class_number + ' - ' + assignment.section}</span>
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
                onClick={editTeacherData}
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
          {/* Assigned Classes */}
          {
            !isEditing && (
              <div className='mt-10'>
                <h4 className="text-medium font-semibold text-gray-800 mb-4">Assigned Classes</h4>
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
            )
          }
        </div>


      </div>
    </MainLayout>
  );
};

export default TeacherDetails;