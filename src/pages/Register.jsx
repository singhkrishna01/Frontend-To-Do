import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/api';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Loader2 } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.register(formData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] px-4 py-12 overflow-hidden">
      {/* Gradient blobs */}
      <div className="absolute -top-10 -left-10 h-72 w-72 rounded-full bg-purple-500 opacity-30 blur-3xl animate-ping" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500 opacity-30 blur-3xl animate-ping" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-10 backdrop-blur-xl shadow-2xl"
      >
        <h2 className="text-center text-4xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-center text-white/70 mb-8">
          Sign up to access your <span className="text-accent font-semibold">Todo App</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 h-5 w-5" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="w-full rounded-xl bg-white/20 py-3 pl-11 pr-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Email */}
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 h-5 w-5" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full rounded-xl bg-white/20 py-3 pl-11 pr-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 h-5 w-5" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full rounded-xl bg-white/20 py-3 pl-11 pr-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 py-3 font-semibold text-white transition-all duration-200 hover:from-purple-600 hover:to-indigo-700 active:scale-95 disabled:opacity-70"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/70">
          Already have an account?{" "}
          <Link to="/login" className="text-accent font-medium hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
