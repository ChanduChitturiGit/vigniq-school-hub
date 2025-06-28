
export interface Class {
  id: string;
  name: string;
  section: string;
  teacherId: string;
  academicYear: string;
  schoolId: string;
}

export const defaultClasses: Class[] = [
  {
    id: '1',
    name: 'Class 10',
    section: 'A',
    teacherId: '3',
    academicYear: '2023-2024',
    schoolId: '1'
  },
  {
    id: '2',
    name: 'Class 9',
    section: 'B',
    teacherId: '3',
    academicYear: '2023-2024',
    schoolId: '1'
  }
];

export const getClasses = (): Class[] => {
  const classes = localStorage.getItem('vigniq_classes');
  if (!classes) {
    localStorage.setItem('vigniq_classes', JSON.stringify(defaultClasses));
    return defaultClasses;
  }
  return JSON.parse(classes);
};

export const addClass = (classData: Omit<Class, 'id'>): Class => {
  const classes = getClasses();
  const newClass = {
    ...classData,
    id: Date.now().toString()
  };
  classes.push(newClass);
  localStorage.setItem('vigniq_classes', JSON.stringify(classes));
  return newClass;
};
