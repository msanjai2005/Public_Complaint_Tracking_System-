import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin' || user.role === 'staff') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark-900 via-primary-900 to-dark-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-accent-400 rounded-2xl flex items-center justify-center shadow-glow">
              <span className="text-2xl">🧹</span>
            </div>
            <span className="text-3xl font-bold font-display text-white">SwachTrack</span>
          </div>
          <h2 className="text-4xl font-bold text-white font-display leading-tight mb-4">
            Welcome back to{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-300 to-accent-300">
              transparent governance
            </span>
          </h2>
          <p className="text-dark-400 text-lg leading-relaxed">
            Track your complaints, provide feedback, and help build a cleaner community.
          </p>

          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 text-dark-300">
              <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <span className="text-primary-300 text-sm">✓</span>
              </div>
              <span>Real-time complaint tracking</span>
            </div>
            <div className="flex items-center gap-3 text-dark-300">
              <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <span className="text-primary-300 text-sm">✓</span>
              </div>
              <span>Instant status notifications</span>
            </div>
            <div className="flex items-center gap-3 text-dark-300">
              <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <span className="text-primary-300 text-sm">✓</span>
              </div>
              <span>Department accountability</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-dark-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">🧹</span>
            </div>
            <span className="text-xl font-bold font-display">SwachTrack</span>
          </div>

          <h1 className="text-3xl font-bold font-display text-dark-900 mb-2">Sign In</h1>
          <p className="text-dark-500 mb-8">Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-field">Email Address</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field !pl-11"
                  required
                  id="login-email"
                />
              </div>
            </div>

            <div>
              <label className="label-field">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field !pl-11 !pr-11"
                  required
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                >
                  {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-dark-300 text-primary-500 focus:ring-primary-500" />
                <span className="text-sm text-dark-500">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3.5 text-base"
              id="login-submit"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-dark-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-500 hover:text-primary-600 font-semibold">
                Create Account
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-primary-50 rounded-xl border border-primary-100">
            <p className="text-xs font-bold text-primary-600 mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-primary-700">
              <p><span className="font-semibold">Admin:</span> admin@complaint.com / admin123</p>
              <p><span className="font-semibold">User:</span> rahul@test.com / user123</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
