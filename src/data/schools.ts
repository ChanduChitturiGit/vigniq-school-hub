
export interface School {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  adminId: string;
  boards?: string[];
}

let schools: School[] = [
  {
    id: '1',
    name: 'Greenwood High School',
    address: '123 Education Street, Learning City, LC 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@greenwood.edu',
    adminId: '2',
    boards: ['CBSE', 'State Board']
  },
  {
    id: '2',
    name: 'Riverside Academy',
    address: '456 Knowledge Avenue, Study Town, ST 67890',
    phone: '+1 (555) 987-6543',
    email: 'contact@riverside.edu',
    adminId: '3',
    boards: ['ICSE', 'IB']
  }
];

export const getSchools = (): School[] => {
  const stored = localStorage.getItem('vigniq_schools');
  if (stored) {
    schools = JSON.parse(stored);
  } else {
    localStorage.setItem('vigniq_schools', JSON.stringify(schools));
  }
  return schools;
};

export const addSchool = (school: Omit<School, 'id'>): School => {
  const newSchool: School = {
    ...school,
    id: Date.now().toString()
  };
  schools.push(newSchool);
  localStorage.setItem('vigniq_schools', JSON.stringify(schools));
  return newSchool;
};

export const getSchoolById = (id: string): School | undefined => {
  return getSchools().find(school => school.id === id);
};
