import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser, clearAuthError } from '../authSlice';
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, AlertCircle, Check, X } from 'lucide-react';
import AuthLayout from '../components/ui/AuthLayout';

const signupSchema = z.object({
  firstName: z
    .string()
    .min(3, "First name must be at least 3 characters long")
    .trim(),
  emailId: z
    .string()
    .email("Please enter a valid email address")
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter (A-Z)")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter (a-z)")
    .regex(/[0-9]/, "Password must contain at least one number (0-9)")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special symbol (@, #, $, etc.)")
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onChange'
  });

  const passwordValue = watch('password') || '';

  // Real-time password requirement checks
  const passwordChecks = [
    { label: 'At least 8 characters', valid: passwordValue.length >= 8 },
    { label: 'One uppercase letter (A-Z)', valid: /[A-Z]/.test(passwordValue) },
    { label: 'One lowercase letter (a-z)', valid: /[a-z]/.test(passwordValue) },
    { label: 'One number (0-9)', valid: /[0-9]/.test(passwordValue) },
    { label: 'One symbol (@, #, $, !)', valid: /[^a-zA-Z0-9]/.test(passwordValue) },
  ];

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    setSubmitted(true);
    dispatch(registerUser(data));
  };

  const handleInputChange = () => {
    if (error) {
      dispatch(clearAuthError());
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join CodeForge to begin practicing problems and tracking submissions."
    >
      {/* Backend / Global Error Banner */}
      {submitted && error && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-error/30 bg-error/10 p-3.5 text-xs text-error animate-fade-in">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="font-medium leading-relaxed">
            {typeof error === 'string' ? error : 'Unable to create account. Please check your details.'}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text text-xs font-semibold text-base-content/80">First Name</span>
          </label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input
              type="text"
              placeholder="e.g. Alex"
              className={`input input-bordered w-full pl-10 text-sm bg-base-100 focus:border-primary transition-all ${
                errors.firstName ? 'input-error' : ''
              }`} 
              {...register('firstName', { onChange: handleInputChange })}
            />
          </div>
          {errors.firstName && (
            <span className="text-error text-xs mt-1 block">{errors.firstName.message}</span>
          )}
        </div>

        {/* Email Field */}
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text text-xs font-semibold text-base-content/80">Email address</span>
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input
              type="email"
              placeholder="name@example.com"
              className={`input input-bordered w-full pl-10 text-sm bg-base-100 focus:border-primary transition-all ${
                errors.emailId ? 'input-error' : ''
              }`}
              {...register('emailId', { onChange: handleInputChange })}
            />
          </div>
          {errors.emailId && (
            <span className="text-error text-xs mt-1 block">{errors.emailId.message}</span>
          )}
        </div>

        {/* Password Field */}
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text text-xs font-semibold text-base-content/80">Password</span>
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="e.g. CodeForge#2026"
              className={`input input-bordered w-full pl-10 pr-10 text-sm bg-base-100 focus:border-primary transition-all ${
                errors.password ? 'input-error' : ''
              }`}
              {...register('password', { onChange: handleInputChange })}
            />
            <button
              type="button"
              className="absolute top-1/2 right-3 -translate-y-1/2 text-base-content/40 hover:text-base-content transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {errors.password && (
            <span className="text-error text-xs mt-1 block">{errors.password.message}</span>
          )}

          {/* Interactive Live Password Requirements Checklist */}
          <div className="mt-2.5 rounded-xl border border-base-300/80 bg-base-200/50 p-2.5 text-[11px] space-y-1">
            <span className="font-semibold text-base-content/60 block mb-1">Password Requirements:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {passwordChecks.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 transition-colors ${
                    item.valid ? 'text-emerald-400 font-medium' : 'text-base-content/45'
                  }`}
                >
                  {item.valid ? (
                    <Check size={12} className="shrink-0 text-emerald-400" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-base-content/30 shrink-0 mx-0.5" />
                  )}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary w-full text-sm font-semibold shadow-lg shadow-primary/20 gap-2 mt-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-xs" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Get Started</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="text-center mt-6 pt-4 border-t border-base-300/70">
        <p className="text-xs text-base-content/65">
          Already have an account?{' '}
          <NavLink to="/login" className="text-primary font-semibold hover:underline">
            Log in instead
          </NavLink>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Signup;
