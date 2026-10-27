import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router'; 
import { loginUser, clearAuthError } from "../authSlice";
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import AuthLayout from '../components/ui/AuthLayout';

const loginSchema = z.object({
  emailId: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters") 
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = () => {
    if (error) {
      dispatch(clearAuthError());
    }
  };

  const onSubmit = (data) => {
    setSubmitted(true);
    dispatch(loginUser(data));
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to resume solving problems and tracking your progress."
    >
      {submitted && error && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-error/30 bg-error/10 p-3 text-xs text-error animate-fade-in">
          <AlertCircle size={16} className="shrink-0" />
          <span>{typeof error === 'string' ? error : 'Unable to sign in. Please verify your credentials.'}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <span className="text-error text-xs mt-1">{errors.emailId.message}</span>
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
              placeholder="••••••••"
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
            <span className="text-error text-xs mt-1">{errors.password.message}</span>
          )}
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
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Switch to Signup */}
      <div className="text-center mt-6 pt-4 border-t border-base-300/70">
        <p className="text-xs text-base-content/65">
          Don't have an account yet?{' '}
          <NavLink to="/signup" className="text-primary font-semibold hover:underline">
            Create account
          </NavLink>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Login;
