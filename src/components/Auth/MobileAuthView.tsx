import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthHeader } from './MobileAuth/AuthHeader';
import { VerifyView } from './MobileAuth/VerifyView';
import { ProfileView } from './MobileAuth/ProfileView';
import { LoginForm } from './MobileAuth/LoginForm';
import { SignupForm } from './MobileAuth/SignupForm';
import { ForgotForm } from './MobileAuth/ForgotForm';
import { TrustIndicators } from './MobileAuth/TrustIndicators';

interface MobileAuthViewProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'forgot';
}

type AuthMode = 'login' | 'signup' | 'forgot' | 'verify' | 'profile';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
}

export const MobileAuthView: React.FC<MobileAuthViewProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [rememberMe, setRememberMe] = useState(false);

  const { user, signIn, signUp, logout } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    dateOfBirth: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (mode === 'signup' && step === 1) {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (mode === 'signup' && step === 2 && !formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(formData.email, formData.password);
        onClose();
      } else if (mode === 'signup') {
        if (step === 1) {
          setStep(2);
        } else {
          await signUp(formData.email, formData.password, {
            fullName: formData.fullName,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
          });
          setMode('verify');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setErrors({ general: 'Authentication failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const headerTitle = {
    login: 'Welcome to Aligarh Attar House',
    signup: step === 1 ? 'Create Account' : 'Complete Profile',
    forgot: 'Reset Password',
    verify: 'Verify Email',
    profile: 'My Account'
  }[mode];

  const handleBack = () => {
    if (mode === 'signup' && step === 2) {
      setStep(1);
    } else {
      setMode('login');
    }
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden overflow-hidden">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity" 
        onClick={onClose} 
      />

      {/* Mobile auth panel */}
      <div className="absolute inset-0 bg-white flex flex-col shadow-2xl animate-slide-in">
        <AuthHeader
          mode={mode}
          step={step}
          onBack={handleBack}
          onClose={onClose}
          showBack={mode !== 'login' && mode !== 'profile'}
          title={headerTitle}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {mode === 'verify' ? (
            <VerifyView email={formData.email} onBackToLogin={() => setMode('login')} />
          ) : mode === 'profile' && user ? (
            <ProfileView user={user} logout={logout} />
          ) : (
            <>
              {mode === 'login' && (
                <LoginForm
                  formData={formData}
                  errors={errors}
                  loading={loading}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  rememberMe={rememberMe}
                  setRememberMe={setRememberMe}
                  onInputChange={handleInputChange}
                  onModeSwitch={(newMode) => setMode(newMode as any)}
                  onSubmit={handleSubmit}
                />
              )}
              {mode === 'signup' && (
                <SignupForm
                  formData={formData}
                  errors={errors}
                  loading={loading}
                  step={step}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  showConfirmPassword={showConfirmPassword}
                  setShowConfirmPassword={setShowConfirmPassword}
                  onInputChange={handleInputChange}
                  onModeSwitch={(newMode) => setMode(newMode as any)}
                  onSubmit={handleSubmit}
                />
              )}
              {mode === 'forgot' && (
                <ForgotForm
                  formData={formData}
                  errors={errors}
                  loading={loading}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  onInputChange={handleInputChange}
                  onModeSwitch={(newMode) => setMode(newMode as any)}
                  onSubmit={handleSubmit}
                />
              )}
              {(mode === 'login' || (mode === 'signup' && step === 1)) && <TrustIndicators />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};