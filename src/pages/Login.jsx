import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../services/api";
import { Mail, Lock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.login(formData.email, formData.password);
      if (response.token) {
        toast.success("Login successful!");
        navigate("/todos");
      } else {
        toast.error("Login failed: No token received");
      }
    } catch (error) {
      console.error("Login error:", error.response || error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] px-4 py-12">
      {/* Glowing gradient blobs */}
      <div className="absolute -top-10 -left-10 h-72 w-72 rounded-full bg-purple-500 opacity-30 blur-3xl animate-ping" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500 opacity-30 blur-3xl animate-ping" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-10 backdrop-blur-xl shadow-2xl"
      >
        <h1 className="mb-2 text-center text-4xl font-bold text-white">Welcome Back</h1>
        <p className="mb-8 text-center text-white/70">
          Sign in to access your <span className="text-accent font-semibold">Todo App</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="relative group">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full rounded-xl bg-white/20 py-3 pl-11 pr-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-accent group-hover:ring-2"
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full rounded-xl bg-white/20 py-3 pl-11 pr-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-accent group-hover:ring-2"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 py-3 font-semibold text-white transition-all duration-200 hover:from-purple-600 hover:to-indigo-700 active:scale-95 disabled:opacity-70"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-white/70">
          Don’t have an account?{" "}
          <Link to="/register" className="text-accent font-medium hover:underline">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
