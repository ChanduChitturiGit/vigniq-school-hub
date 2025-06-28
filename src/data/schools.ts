
export interface School {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  adminId: string;
}

export const defaultSchools: School[] = [
  {
    id: '1',
    name: 'Greenwood High International School',
    address: '123 Education Lane, Bengaluru, Karnataka 560001',
    phone: '+91 80 1234 5678',
    email: 'info@greenwoodhigh.edu',
    adminId: '2'
  }
];

export const getSchools = (): School[] => {
  const schools = localStorage.getItem('vigniq_schools');
  if (!schools) {
    localStorage.setItem('vigniq_schools', JSON.stringify(defaultSchools));
    return defaultSchools;
  }
  return JSON.parse(schools);
};

export const addSchool = (school: Omit<School, 'id'>): School => {
  const schools = getSchools();
  const newSchool = {
    ...school,
    id: Date.now().toString()
  };
  schools.push(newSchool);
  localStorage.setItem('vigniq_schools', JSON.stringify(schools));
  return newSchool;
};
