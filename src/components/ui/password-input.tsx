
import React, { useState } from 'react';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import { generateStrongPassword } from '../../utils/passwordGenerator';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  showGenerator?: boolean;
  className?: string;
  name?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder = "Enter password",
  required = false,
  showGenerator = true,
  className = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
  name
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleGeneratePassword = () => {
    const newPassword = generateStrongPassword(8);
    onChange(newPassword);
    setShowPassword(true); // Show password when generated
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          name={name}
          className={`${className} pr-12`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {showGenerator && (
        <button
          type="button"
          onClick={handleGeneratePassword}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Generate Strong Password
        </button>
      )}
    </div>
  );
};

export default PasswordInput;
