import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import NotFoundPage from "../pages/NotFoundPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import AuthLayout from "../layouts/AuthLayout";

import ProtectedRoute from "../components/ProtectedRoute";
import RoleRoute from "../components/RoleRoute";

import StudentLayout from "../layouts/StudentLayout";
import StudentDashboardPage from "../pages/student/StudentDashboardPage";
import QRBoardingPassPage from "../pages/student/QRBoardingPassPage";
import RideHistoryPage from "../pages/student/RideHistoryPage";
import SustainabilityPage from "../pages/student/SustainabilityPage";
import ProfilePage from "../pages/student/ProfilePage";
import FeedbackPage from "../pages/student/FeedbackPage";

import DriverLayout from "../layouts/DriverLayout";
import DriverDashboardPage from "../pages/driver/DriverDashboardPage";
import DriverScannerPage from "../pages/driver/DriverScannerPage";

import AdminLayout from "../layouts/AdminLayout";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import LiveMapPage from "../pages/admin/LiveMapPage";
import StopsPage from "../pages/admin/StopsPage";
import RoutesPage from "../pages/admin/RoutesPage";
import ShuttlesPage from "../pages/admin/ShuttlesPage";
import DriversPage from "../pages/admin/DriversPage";
import StudentsPage from "../pages/admin/StudentsPage";
import AlertsPage from "../pages/admin/AlertsPage";
import EmergenciesPage from "../pages/admin/EmergenciesPage";
import BreakdownsPage from "../pages/admin/BreakdownsPage";
import AnalyticsPage from "../pages/admin/AnalyticsPage";
import PredictionsPage from "../pages/admin/PredictionsPage";
import SettingsPage from "../pages/admin/SettingsPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={["STUDENT"]} />}>
            <Route element={<StudentLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboardPage />} />
              <Route path="/student/pass" element={<QRBoardingPassPage />} />
              <Route path="/student/ride-history" element={<RideHistoryPage />} />
              <Route path="/student/sustainability" element={<SustainabilityPage />} />
              <Route path="/student/profile" element={<ProfilePage />} />
              <Route path="/student/feedback" element={<FeedbackPage />} />
              <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
            </Route>
          </Route>
        </Route>

        {/* Protected Driver Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={["DRIVER"]} />}>
            <Route element={<DriverLayout />}>
              <Route path="/driver/dashboard" element={<DriverDashboardPage />} />
              <Route path="/driver/scanner" element={<DriverScannerPage />} />
              <Route path="/driver" element={<Navigate to="/driver/dashboard" replace />} />
            </Route>
          </Route>
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/live-map" element={<LiveMapPage />} />
              <Route path="/admin/stops" element={<StopsPage />} />
              <Route path="/admin/routes" element={<RoutesPage />} />
              <Route path="/admin/shuttles" element={<ShuttlesPage />} />
              <Route path="/admin/drivers" element={<DriversPage />} />
              <Route path="/admin/students" element={<StudentsPage />} />
              <Route path="/admin/alerts" element={<AlertsPage />} />
              <Route path="/admin/emergencies" element={<EmergenciesPage />} />
              <Route path="/admin/breakdowns" element={<BreakdownsPage />} />
              <Route path="/admin/analytics" element={<AnalyticsPage />} />
              <Route path="/admin/predictions" element={<PredictionsPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Route>
        </Route>

        {/* 404 Catch All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
