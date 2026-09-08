import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bell,
  Clock,
  MapPin,
  User,
  Leaf,
  ShieldCheck,
  ArrowRight,
  Bus,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

const features = [
  {
    title: "Live Map Shuttle Telemetry",
    description: "Continuous real-time geolocation tracking across campus without marker teleportation.",
    icon: MapPin,
  },
  {
    title: "Dynamic ETA & Crowd Prediction",
    description: "AI-computed arrival estimates and time-series crowd occupancy predictions.",
    icon: Clock,
  },
  {
    title: "Student Emergency SOS & Alerts",
    description: "Instant medical/safety emergency reporting and broadcast service warnings.",
    icon: Bell,
  },
  {
    title: "Digital QR Passes & Carbon Offset",
    description: "Generate verified digital boarding passes and track your CO₂ environmental savings.",
    icon: Leaf,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-indigo-700 dark:text-indigo-400">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white text-xs font-black shadow">
              RP
            </span>
            <span>RidePulse</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <span>Log in</span>
            </Link>
            <Link
              to="/register?role=STUDENT"
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-indigo-700 dark:bg-indigo-500"
            >
              <span>Sign up</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300 mb-6"
          >
            <Bus className="h-4 w-4" />
            <span>Real-Time Campus Transportation & Safety Intelligence</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl dark:text-white"
          >
            Your Campus. Your Shuttle. <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-300">
              In Real Time.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300 font-medium"
          >
            Track campus shuttles live on interactive maps, predict crowd density, report safety emergencies in real time, generate digital QR boarding passes, and measure your carbon offset.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-indigo-700 transition"
                >
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/register?role=STUDENT"
                  className="inline-flex min-w-44 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  <User className="h-4 w-4" />
                  <span>Register as Student</span>
                </Link>
                <Link
                  to="/register?role=DRIVER"
                  className="inline-flex min-w-44 items-center justify-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-6 py-3.5 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-950"
                >
                  <Bus className="h-4 w-4" />
                  <span>Register as Driver</span>
                </Link>
            </>
          </motion.div>
        </section>

        <section id="features" className="border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                RidePulse Core Capabilities
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                End-to-end features connecting students, shuttle drivers, and campus transit operators.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition hover:border-indigo-400 dark:hover:border-indigo-800"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    <feature.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
        RidePulse · Campus Shuttle Intelligence & Safety Platform
      </footer>
    </div>
  );
}
