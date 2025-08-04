import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { resetPassword as resetPasswordApi } from '../services/passwordHandler'
import { useSnackbar } from "../components/snackbar/SnackbarContext";

const ResetPassword: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromProfile = searchParams.get('fromProfile') === 'true';

  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    new_password: '',
    confirm_password: '',
    old_password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    otp: '',
    new_password: '',
    confirm_password: '',
    old_password: ''
  });
  const [step, setStep] = useState<'email' | 'otp' | 'password'>(fromProfile ? 'password' : 'email');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (fromProfile) {
      const storedEmail = localStorage.getItem('reset_password_email');
      if (storedEmail) {
        setFormData(prev => ({ ...prev, email: storedEmail }));
      }
    }
  }, [fromProfile]);

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(value)) error = 'Email is invalid';
        break;
      case 'otp':
        if (!value) error = 'Verification code is required';
        else if (value.length !== 6) error = 'Code must be 6 digits';
        break;
      case 'new_password':
        if (!value) error = 'New password is required';
        else if (value.length < 8) error = 'Password must be at least 8 characters';
        break;
      case 'confirm_password':
        if (!value) error = 'Confirm password is required';
        else if (value !== formData.new_password) error = 'Passwords do not match';
        break;
      case 'old_password':
        if (fromProfile && !value) error = 'Old password is required';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    validateField('email', formData.email);

    if (!formData.email || errors.email) {
      showSnackbar({
        title: "⛔ Error",
        description: "Please fill all the details in the form.",
        status: "error"
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      showSnackbar({
        title: "OTP Sent",
        description: "A verification code has been sent to your email. ✅",
        status: "success"
      });
      setStep('otp');
      setIsLoading(false);
    }, 1000);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    validateField('otp', formData.otp);

    if (!formData.otp || errors.otp) {
      showSnackbar({
        title: "⛔ Error",
        description: "Please fill all the details in the form.",
        status: "error"
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      if (formData.otp === '123456') {
        showSnackbar({
          title: "OTP Verified",
          description: "Please enter your new password. ✅",
          status: "success"
        });
        setStep('password');
      } else {
        toast({
          title: "Invalid OTP",
          description: "Please enter the correct verification code.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const setPassword = async (data: any) => {
    try {
      const response = await resetPasswordApi(data);
      if (response && response.message) {
        setTimeout(() => {
          localStorage.removeItem('reset_password_email');
          showSnackbar({
            title: "Password Updated",
            description: "Password updated successfully. Please login again. ✅",
            status: "success"
          });
          navigate('/login');
          setIsLoading(false);
        }, 1000);
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
    setIsLoading(false);
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    if (fromProfile) {
      validateField('old_password', formData.old_password);
    }
    validateField('new_password', formData.new_password);
    validateField('confirm_password', formData.confirm_password);

    const hasError =
      (fromProfile && (!formData.old_password || errors.old_password)) ||
      !formData.new_password || errors.new_password ||
      !formData.confirm_password || errors.confirm_password;

    if (hasError) {
      showSnackbar({
        title: "⛔ Error",
        description: "Please fill all the details in the form.",
        status: "error"
      });
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      showSnackbar({
        title: "⛔ Password Mismatch",
        description: "New password and confirm password do not match. ✅",
        status: "error"
      });
      return;
    }

    if (formData.new_password.length < 8) {
      showSnackbar({
        title: "⛔ Password Too Short",
        description: "Password must be at least 8 characters long. ✅",
        status: "error"
      });
      return;
    }
    setIsLoading(true);
    setPassword(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
            <KeyRound className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {fromProfile
              ? "Enter your new password below"
              : step === 'email'
                ? "Enter your email address to receive a verification code"
                : step === 'otp'
                  ? "Enter the verification code sent to your email"
                  : "Enter your new password"
            }
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {!fromProfile && step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </form>
          )}

          {!fromProfile && step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  value={formData.otp}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
                {errors.otp && <p className="mt-2 text-sm text-red-600">{errors.otp}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-500"
              >
                Back to email
              </button>
            </form>
          )}

          {(fromProfile || step === 'password') && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* old password */}
              <div>
                <label htmlFor="old_password" className="block text-sm font-medium text-gray-700">
                  Old Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="old_password"
                    name="old_password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.old_password}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.old_password && <p className="mt-2 text-sm text-red-600">{errors.old_password}</p>}
              </div>

              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="new_password"
                    name="new_password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.new_password}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.new_password && <p className="mt-2 text-sm text-red-600">{errors.new_password}</p>}
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirm_password && <p className="mt-2 text-sm text-red-600">{errors.confirm_password}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>

              {!fromProfile && (
                <button
                  type="button"
                  onClick={() => setStep('otp')}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-500"
                >
                  Back to verification
                </button>
              )}
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
