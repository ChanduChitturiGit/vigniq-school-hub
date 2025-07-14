import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { toast } from '../components/ui/sonner';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotUsername, setForgotUsername] = useState('');
  const [validationCode, setValidationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validateUsername = (username: string): boolean => {
    if (username.length < 3) {
      setError('Username must be at least 3 characters long.');
      return false;
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      setError('Username must contain only letters and numbers.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateUsername(username)) {
      setLoading(false);
      return;
    }

    try {
      const success = await login(username, password);
      if (!success) {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (forgotStep === 1) {
      // Validate username first
      if (!validateUsername(forgotUsername)) {
        return;
      }
      
      // Verify username exists and get email
      const users = JSON.parse(localStorage.getItem('vigniq_users') || '[]');
      const userExists = users.find((u: any) => u.username === forgotUsername);
      
      if (userExists) {
        setForgotStep(2);
        setError('');
        // Show toast notification with user's email
        toast(`📬 A verification code has been sent to ${userExists.email}. Please check.`, {
          duration: 4000,
          position: "bottom-right"
        });
      } else {
        setError('Username not found in our system.');
      }
    } else if (forgotStep === 2) {
      // Validate code
      if (validationCode === '123') {
        setForgotStep(3);
        setError('');
      } else {
        setError('Invalid validation code. Please enter 123.');
      }
    } else {
      // Update password
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      
      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      
      const users = JSON.parse(localStorage.getItem('vigniq_users') || '[]');
      const userIndex = users.findIndex((u: any) => u.username === forgotUsername);
      
      if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('vigniq_users', JSON.stringify(users));
        
        setShowForgotPassword(false);
        setForgotStep(1);
        setForgotUsername('');
        setValidationCode('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        toast("✅ Password updated successfully! You can now log in with your new password.", {
          duration: 4000,
          position: "bottom-right"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Side - Hero Section */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-amber-100 to-amber-200 items-center justify-center p-12">
          <div className="text-center">
            <div className="w-32 h-32 bg-white/20 rounded-lg flex items-center justify-center mb-8 mx-auto">
              <div className="w-16 h-16 bg-white rounded flex items-center justify-center">
                <span className="text-2xl font-bold text-amber-600">V</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Unlock Your Potential</h2>
            <p className="text-gray-600 text-lg">With AI-Powered Learning</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-8 lg:p-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold">V</span>
                </div>
                <span className="text-2xl font-bold text-gray-800">VIGNIQ</span>
              </div>
              <h1 className="text-2xl font-bold text-blue-600 mb-2">
                {showForgotPassword ? 'Reset Password' : ''}
              </h1>
              <p className="text-gray-600">
                {showForgotPassword 
                  ? 'Enter your details to reset your password.' 
                  : 'Login to continue your AI learning journey.'
                }
              </p>
            </div>

            {!showForgotPassword ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      pattern="[a-zA-Z0-9]+"
                      title="Username must contain only letters and numbers"
                      minLength={3}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 3 characters, letters and numbers only</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Forgot your password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {forgotStep === 1 ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={forgotUsername}
                        onChange={(e) => setForgotUsername(e.target.value)}
                        placeholder="Enter your username"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        pattern="[a-zA-Z0-9]+"
                        title="Username must contain only letters and numbers"
                        minLength={3}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimum 3 characters, letters and numbers only</p>
                  </div>
                ) : forgotStep === 2 ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={forgotUsername}
                          disabled
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Validation Code
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={validationCode}
                          onChange={(e) => setValidationCode(e.target.value)}
                          placeholder="Enter validation code"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Enter 123 to proceed</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    {forgotStep === 1 ? 'Verify Username' : forgotStep === 2 ? 'Verify Code' : 'Reset Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotStep(1);
                      setForgotUsername('');
                      setValidationCode('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setError('');
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Demo Credentials */}
            {!showForgotPassword && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <div><strong>Super Admin:</strong> superadmin / superadmin</div>
                  <div><strong>Admin:</strong> admin1 / admin123</div>
                  <div><strong>Teacher:</strong> teacher1 / teacher123</div>
                  <div><strong>Student:</strong> student1 / student123</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
