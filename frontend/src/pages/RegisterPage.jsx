import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, UserCheck, Building, Phone, Loader2, ArrowRight, Shield, Bus } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "DRIVER" ? "DRIVER" : "STUDENT";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: initialRole,
    studentId: "",
    department: "",
    phone: "",
  });

  const [validationError, setValidationError] = useState("");
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const roleOptions = [
    { id: "STUDENT", label: "Student", icon: Shield, desc: "Campus commuter" },
    { id: "DRIVER", label: "Driver", icon: Bus, desc: "Shuttle operator" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");
    clearError();

    if (!formData.name.trim()) {
      setValidationError("Full name is required.");
      return;
    }
    if (!formData.email.trim()) {
      setValidationError("Email address is required.");
      return;
    }
    if (!formData.password) {
      setValidationError("Password is required.");
      return;
    }
    if (formData.password.length < 6) {
      setValidationError("Password must be at least 6 characters.");
      return;
    }

    const res = await register(formData);
    if (res.success && res.user) {
      if (res.user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (res.user.role === "DRIVER") {
        navigate("/driver/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create Your Account
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Choose your RidePulse account type</p>
        </div>

        <div className="mt-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Register as</label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {roleOptions.map((option) => {
              const Icon = option.icon;
              const selected = formData.role === option.id;
              return (
                <button key={option.id} type="button" onClick={() => setFormData({ ...formData, role: option.id })} className={`flex flex-col items-center rounded-xl border p-3 text-center ${selected ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950 dark:text-indigo-300" : "border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400"}`}>
                  <Icon className="mb-1 h-5 w-5" />
                  <span className="text-xs font-bold">{option.label}</span>
                  <span className="text-[10px] text-slate-400">{option.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {(validationError || error) && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 dark:bg-red-950/80 dark:text-red-300">
            {validationError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Full Name *
            </label>
            <div className="relative mt-1.5">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Alex Johnson"
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Email Address *
            </label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="alex@campus.edu"
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Password *
            </label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {formData.role === "STUDENT" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Student ID
                </label>
                <div className="relative mt-1.5">
                  <UserCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="STU-2026-88"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-400"
                  />
                </div>
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Department
              </label>
              <div className="relative mt-1.5">
                <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder={formData.role === "DRIVER" ? "Campus Transit" : "Computer Science"}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Phone Number
            </label>
            <div className="relative mt-1.5">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1-555-0199"
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Register as {formData.role === "DRIVER" ? "Driver" : "Student"}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
