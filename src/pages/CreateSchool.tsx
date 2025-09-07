import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Breadcrumb from '../components/Layout/Breadcrumb';
import PasswordInput from '../components/ui/password-input';
import { Select as UISelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { addSchool } from '../data/schools';
import { Check } from 'lucide-react';
import { createSchool as createSchoolApi, getBoardsList } from '../services/school'
import { SpinnerOverlay } from '../pages/SpinnerOverlay';
import Select, { ActionMeta, MultiValue } from 'react-select';
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import { getPackages } from "../services/payment";

type OptionType = {
  label: string;
  value: number;
};

const CreateSchool: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);
  const [boards, setBoards] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    schoolName: '',
    address: '',
    phone: '',
    email: '',
    adminFirstName: '',
    adminLastName: '',
    adminUserName: '',
    adminEmail: '',
    adminPassword: '',
    adminPhone: '',
    board_id: null,
    selectedBoards: [] as OptionType[],
    board_ids: [] as number[],
    academic_start_year: new Date().getFullYear().toString(),
    academic_end_year: (new Date().getFullYear() + 1).toString(),
    accountType: '',
    selectPackage: '',
    amount: '',
    paymentType: '',
    transactionId: '',
    freetrialPeriod : '',
    package_id : null
  });
  const [boardInput, setBoardInput] = useState('');
  const [showBoardSuggestions, setShowBoardSuggestions] = useState(false);
  const [packages, setPackages] = useState([]);
  const [errors, setErrors] = useState({
    schoolName: '',
    address: '',
    phone: '',
    email: '',
    adminFirstName: '',
    adminLastName: '',
    adminUserName: '',
    adminEmail: '',
    adminPassword: '',
    adminPhone: '',
    selectedBoards: '',
    academic_start_year: '',
    academic_end_year: '',
    accountType: '',
    selectPackage: '',
    amount: '',
    paymentType: '',
    transactionId: '',
    freetrialPeriod : ''
  });



  const boardSuggestions = [
    { boardId: 1, boardName: 'SSC' },
    { boardId: 2, boardName: 'CBSE' },
    { boardId: 3, boardName: 'ICSE' },
    { boardId: 4, boardName: 'IGCSE' },
    { boardId: 5, boardName: 'IB' }
  ];
  const breadcrumbItems = [
    { label: 'Home', path: '/dashboard' },
    { label: 'Create School' }
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - 3 + i).toString());
  const [endYears, setEndYears] = useState(Array.from({ length: 6 }, (_, i) => (Number(formData.academic_start_year) + i).toString()));


  const boardsList = async () => {
    const response = await getBoardsList();
    if (response && response.boards) {
      setBoards(
        response.boards.map((board) => ({
          label: board.name,
          value: board.id,
        }))
      );
    }
  }

  //getPackages
  const getPlanPackages = async () => {
    const response = await getPackages();
    if (response && response.data) {
      setPackages(response.data);
    }
  }


  useEffect(() => {
    boardsList();
    getPlanPackages();
  }, []);

  // Validation function for all fields
  const validateField = (name: string, value: any) => {
    let error = '';
    switch (name) {
      case 'schoolName':
        if (!value) error = 'School Name is required';
        break;
      case 'address':
        if (!value) error = 'Address is required';
        break;
      case 'phone':
        if (!value) error = 'Phone is required';
        else if (!/^\d{10,15}$/.test(value)) error = 'Phone must be 10-15 digits';
        break;
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(value)) error = 'Email is invalid';
        break;
      case 'adminFirstName':
        if (!value) error = 'Admin First Name is required';
        break;
      case 'adminLastName':
        if (!value) error = 'Admin Last Name is required';
        break;
      case 'adminUserName':
        if (!value) error = 'Admin User Name is required';
        break;
      case 'adminEmail':
        if (!value) error = 'Admin Email is required';
        else if (!/\S+@\S+\.\S+/.test(value)) error = 'Admin Email is invalid';
        break;
      case 'adminPassword':
        if (!value) error = 'Admin Password is required';
        else if (value.length < 6) error = 'Password must be at least 6 characters';
        break;
      case 'adminPhone':
        if (!value) error = 'Admin Phone is required';
        else if (!/^\d{10,15}$/.test(value)) error = 'Admin Phone must be 10-15 digits';
        break;
      case 'selectedBoards':
        if (!formData.selectedBoards || formData.selectedBoards.length === 0) error = 'At least one board is required';
        break;
      case 'academic_start_year':
        if (!value) error = 'Academic Start Year is required';
        break;
      case 'academic_end_year':
        if (!value) error = 'Academic End Year is required';
        break;
      case 'accountType':
        if (!value) error = 'Account Type is required';
        break;
      case 'selectPackage':
        if (!value) error = 'Package selection is required';
        break;
      case 'amount':
        if (formData.accountType == 'paid' && !value) error = 'Amount is required';
        break;
      case 'paymentType':
        if (formData.accountType == 'paid' && !value) error = 'Payment Type is required';
        break;
      case 'transactionId':
        if (formData.accountType == 'paid' && formData.paymentType == 'online' && !value) error = 'Transaction ID is required';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Handle blur (unfocus)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  // For PasswordInput
  const handlePasswordChange = (value: string) => {
    setFormData(prev => ({ ...prev, adminPassword: value }));
    setErrors(prev => ({ ...prev, adminPassword: '' }));
  };

  // For Board Select
  const handleBoardChange = (
    selectedOptions: MultiValue<OptionType>,
    _actionMeta: ActionMeta<OptionType>
  ) => {
    setFormData((prev) => ({
      ...prev,
      selectedBoards: selectedOptions as OptionType[],
      board_ids: selectedOptions.map((option) => option.value),
    }));
    validateField('selectedBoards', selectedOptions);
    setErrors(prev => ({ ...prev, selectedBoards: '' }));
  };

  // For Start/End Year
  const handleStartYearChange = (value: any) => {
    setFormData((prev) => ({
      ...prev,
      academic_start_year: value,
    }));
    setErrors(prev => ({ ...prev, academic_start_year: '' }));
    const selectedYear = parseInt(value);
    setEndYears(Array.from({ length: 6 }, (_, i) => (selectedYear + i).toString()));
  };
  const handleEndYearChange = (value: any) => {
    setFormData((prev) => ({
      ...prev,
      academic_end_year: value,
    }));
    setErrors(prev => ({ ...prev, academic_end_year: '' }));
  };

  const steps = [
    { number: 1, title: 'School Information', completed: currentStep > 1 },
    { number: 2, title: 'Admin Information', completed: currentStep > 2 },
    { number: 3, title: 'Account Type', completed: false },
  ];

  const handleNext = () => {
    // Validate current step
    let fieldsToValidate: string[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ['schoolName', 'selectedBoards', 'academic_start_year', 'academic_end_year', 'address', 'phone', 'email'];
    } else if (currentStep === 2) {
      fieldsToValidate = [
        'adminFirstName',
        'adminLastName',
        'adminUserName',
        'adminEmail',
        'adminPassword',
        'adminPhone'
      ];
    }

    let valid = true;
    fieldsToValidate.forEach(field => {
      const value = field === 'selectedBoards' ? formData.selectedBoards : (formData as any)[field];
      validateField(field, value);
      if (
        (field === 'selectedBoards' && (!formData.selectedBoards || formData.selectedBoards.length === 0)) ||
        !value
      ) {
        valid = false;
      }
    });

    setTimeout(() => {
      const hasErrors = fieldsToValidate.some(field => errors[field as keyof typeof errors]);
      if (!hasErrors && valid) {
        setCurrentStep(currentStep + 1);
      }
    }, 0);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };



  const handleAccountTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, accountType: value }));
    setErrors(prev => ({ ...prev, accountType: '' }));
    if (value === 'trial') {
      setFormData(prev => ({ ...prev, selectPackage: 'Premium', amount: '', paymentType: '', transactionId: '', freetrialPeriod : '12 Months' }));
      setErrors(prev => ({ ...prev, selectPackage: '', amount: '', paymentType: '', transactionId: '', freetrialPeriod : '' }));
      handleSelectPackageChange('Premium');
    }
  };

  const getPackageId = (name: string) => {
    const data = packages.find((val: any) => (val.package_name) == name);
    const id = data?.package_id ? data.package_id : 0;
    return id;
  }

  const handleSelectPackageChange = (value: string) => {
    setFormData(prev => ({ ...prev,
       selectPackage: value 
      }));
    setErrors(prev => ({ ...prev, selectPackage: '',package_id : getPackageId(value) }));
  };

  //handleFreetrialPeriod
  const handleFreetrialPeriod = (value: string) => {
    setFormData(prev => ({ ...prev, freetrialPeriod: value }));
    setErrors(prev => ({ ...prev, freetrialPeriod: '' }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, amount: value }));
    setErrors(prev => ({ ...prev, amount: '' }));
  };

  const handleTransactionIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, transaction_id: value, transactionId: value }));
    setErrors(prev => ({ ...prev, transactionId: '' }));
  };

  const handlePaymentTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, paymentType: value }));
    setErrors(prev => ({ ...prev, paymentType: '' }));
  };

  // On submit, validate all fields
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoader(true);

    // Validate all fields
    const fieldsToValidate = [
      'schoolName', 'address', 'phone', 'email',
      'adminFirstName', 'adminLastName', 'adminUserName', 'adminEmail', 'adminPassword', 'adminPhone',
      'selectedBoards', 'academic_start_year', 'academic_end_year', 'accountType', 'selectPackage', 'amount', 'paymentType', 'transactionId'
    ];
    let valid = true;
    fieldsToValidate.forEach(field => {
      const value = field === 'selectedBoards' ? formData.selectedBoards : (formData as any)[field];
      validateField(field, value);
      if (
        (field === 'selectedBoards' && (!formData.selectedBoards || formData.selectedBoards.length === 0)) ||
        errors[field]
      ) {
        valid = false;
        showSnackbar({
          title: "⛔ Error",
          description: "Please fill all the required fields correctly",
          status: "error"
        });
        return;
      }
    });

    // Wait for errors state to update
    setTimeout(async () => {
      if (!valid) {
        setLoader(false);
        showSnackbar({
          title: "⛔ Error",
          description: "Something went wrong",
          status: "error"
        });
        return;
      }

      const schoolPayload = {
        school_name: formData.schoolName,
        address: formData.address,
        contact_number: formData.phone,
        email: formData.email,
        boards: formData.board_ids,
        admin_first_name: formData.adminFirstName,
        admin_last_name: formData.adminLastName,
        admin_email: formData.adminEmail,
        admin_phone_number: formData.adminPhone,
        admin_username: formData.adminUserName,
        password: formData.adminPassword,
        academic_start_year: Number(formData.academic_start_year),
        academic_end_year: Number(formData.academic_end_year),
        subscription_type: formData.accountType,
        select_package: formData.selectPackage,
        package_id : formData.package_id ?? getPackageId(formData.selectPackage),
        subscription_amount: formData.amount,
        payment_method: formData.paymentType,
        transaction_ref : formData.transactionId || '',
      };

      try {
        const school = await createSchoolApi(schoolPayload);
        if (school && school.message) {
          navigate('/schools');
          showSnackbar({
            title: "Success",
            description: "School Created successfully ✅",
            status: "success"
          });
        } else {
          showSnackbar({
            title: "⛔ Error",
            description: "Something went wrong",
            status: "error"
          });
        }
      } catch (error) {
        setLoader(false);
        showSnackbar({
          title: "⛔ Error",
          description: error?.response?.data?.error || "Something went wrong",
          status: "error"
        });
      }
      setLoader(false);
    }, 10);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">School Information</h2>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">School Name *</label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              />
              {errors.schoolName && <p className="text-destructive text-sm mt-1">{errors.schoolName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Board *</label>
              <Select<OptionType, true>
                isMulti
                options={boards}
                onChange={handleBoardChange}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Select Board"
                value={formData.selectedBoards}
              />
              {errors.selectedBoards && <p className="text-destructive text-sm mt-1">{errors.selectedBoards}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Academic Start Year *</label>
                <UISelect value={formData.academic_start_year} onValueChange={handleStartYearChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((val, index) => (
                      <SelectItem key={index} value={val}>
                        {val}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </UISelect>
                {errors.academic_start_year && <p className="text-destructive text-sm mt-1">{errors.academic_start_year}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Academic End Year *</label>
                <UISelect value={formData.academic_end_year} onValueChange={handleEndYearChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {endYears.map((val, index) => (
                      <SelectItem key={index} value={val}>
                        {val}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </UISelect>
                {errors.academic_end_year && <p className="text-destructive text-sm mt-1">{errors.academic_end_year}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              />
              {errors.address && <p className="text-destructive text-sm mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                />
                {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                />
                {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Admin Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Admin First Name *</label>
                <input
                  type="text"
                  name="adminFirstName"
                  value={formData.adminFirstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                />
                {errors.adminFirstName && <p className="text-destructive text-sm mt-1">{errors.adminFirstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Admin Last Name *</label>
                <input
                  type="text"
                  name="adminLastName"
                  value={formData.adminLastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                />
                {errors.adminLastName && <p className="text-destructive text-sm mt-1">{errors.adminLastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Admin Email *</label>
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                />
                {errors.adminEmail && <p className="text-destructive text-sm mt-1">{errors.adminEmail}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Admin Phone *</label>
                <input
                  type="tel"
                  name="adminPhone"
                  value={formData.adminPhone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                />
                {errors.adminPhone && <p className="text-destructive text-sm mt-1">{errors.adminPhone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Admin Username *</label>
                <input
                  type="text"
                  name="adminUserName"
                  value={formData.adminUserName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                />
                {errors.adminUserName && <p className="text-destructive text-sm mt-1">{errors.adminUserName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Admin Password *</label>
                <PasswordInput
                  value={formData.adminPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter admin password"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                />
                {errors.adminPassword && <p className="text-destructive text-sm mt-1">{errors.adminPassword}</p>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Type of Account *</label>
              <UISelect value={formData.accountType} onValueChange={handleAccountTypeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Account Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="trial">trial</SelectItem>
                </SelectContent>
              </UISelect>
              {errors.accountType && <p className="text-destructive text-sm mt-1">{errors.accountType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Package *</label>
              <UISelect value={formData.selectPackage} onValueChange={handleSelectPackageChange}
                disabled={formData.accountType == 'trial'}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select the package" />
                </SelectTrigger>
                <SelectContent>
                  {packages.map((val, index) => (
                    <SelectItem key={index} value={val.package_name}>
                      {val.package_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </UISelect>
              {errors.selectPackage && <p className="text-destructive text-sm mt-1">{errors.selectPackage}</p>}
            </div>

            {
              (formData.accountType == 'trial') && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Free trial Period </label>
                  <UISelect value={formData.freetrialPeriod} onValueChange={handleFreetrialPeriod}
                    disabled={true}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select the Free trial period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3 Months">3 Months</SelectItem>
                      <SelectItem value="12 Months">12 Months</SelectItem>
                    </SelectContent>
                  </UISelect>
                  {/* {errors.selectPackage && <p className="text-destructive text-sm mt-1">{errors.selectPackage}</p>} */}
                </div>
              )
            }

            {
              formData.accountType == 'paid' && (
                <div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Amount *</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleAmountChange}
                      placeholder="Enter amount"
                      className="w-full mb-2 px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    />
                    {errors.amount && <p className="text-destructive text-sm mt-1">{errors.amount}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground my-2">Payment Type *</label>
                    <UISelect value={formData.paymentType} onValueChange={handlePaymentTypeChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Payment Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                      </SelectContent>
                    </UISelect>
                    {errors.paymentType && <p className="text-destructive text-sm mt-1">{errors.paymentType}</p>}
                  </div>
                </div>
              )
            }

            {
              (formData.accountType == 'paid' && formData.paymentType == 'online') && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Transaction ID *</label>
                  <input
                    type="text"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleTransactionIdChange}
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                  />
                  {errors.transactionId && <p className="text-destructive text-sm mt-1">{errors.transactionId}</p>}
                </div>
              )
            }

          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <MainLayout pageTitle="Create School">
        <div className="max-w-4xl mx-auto">
          {/* <Breadcrumb items={breadcrumbItems} /> */}

          <div className="bg-card p-8 rounded-lg shadow-sm border border-border">
            {/* <h1 className="text-2xl font-bold text-foreground mb-8">Create School</h1> */}
            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-12 w-full">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-200 ${step.completed
                        ? 'bg-blue-600 text-white border-blue-600'
                        : step.number === currentStep
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-background text-muted-foreground border-muted'
                        }`}
                    >
                      {step.completed ? <Check size={18} /> : step.number}
                    </div>
                    <span className={`text-sm mt-3 text-center font-medium  max-w-24 ${step.number === currentStep
                      ? 'text-blue-600'
                      : step.completed
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                      }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex items-center flex-1 mx-2 md:mx-6 mt-[1.5rem]">
                      <div className="w-full h-0.5 bg-muted rounded-full" style={{
                        backgroundColor: steps[index].completed ? '#2563eb' : '#e5e7eb',
                        minWidth: '40px'
                      }} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className={`px-6 py-2 rounded-lg transition-colors ${currentStep === 1
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                >
                  Previous
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create School
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </MainLayout>
      {loader && <SpinnerOverlay />}
    </>
  );
};

export default CreateSchool;
