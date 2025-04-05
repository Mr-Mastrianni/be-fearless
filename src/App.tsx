import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import SimpleNavbar from "./components/SimpleNavbar";
import AuthProvider from "./providers/AuthProvider";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserPreferencesProvider } from "./contexts/UserPreferencesContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import GlobalDonationPopup from "./components/GlobalDonationPopup";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import CustomDashboard from "./pages/CustomDashboard";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import ActivityExplorer from "./pages/ActivityExplorer";
import AuthCallback from "./pages/AuthCallback";
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import UserDetailView from "./pages/admin/UserDetailView";
import DataManagement from "./pages/admin/DataManagement";
import ActivityList from "./pages/admin/activity/ActivityList";
import ActivityEditor from "./pages/admin/activity/ActivityEditor";
import ActivityStats from "./pages/admin/activity/ActivityStats";
import SystemStats from "./pages/admin/SystemStats";
import SystemSettings from "./pages/admin/system/SystemSettings";
import Donate from "./pages/Donate";
import Videos from "./pages/Videos";
import VideosSimple from "./pages/VideosSimple";
import { useEffect } from "react";
import { applyMigrations } from "./lib/migrations";

const queryClient = new QueryClient();

const App = () => {
  // Apply database migrations when the app starts
  // This is a simple way to ensure the database schema is up to date
  // without requiring manual migrations
  useEffect(() => {
    applyMigrations().catch(console.error);
  }, []);

  return (
    <ErrorBoundary fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
        <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700">
          <div className="text-growth-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-6">We're having trouble displaying this page. Please refresh or return to the home page.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-growth-600 text-white rounded-md hover:bg-growth-700 transition-colors"
            >
              Refresh Page
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    }>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <BrowserRouter basename="/" future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
              <ThemeProvider>
                <UserPreferencesProvider>
                  <TooltipProvider>
                    <SimpleNavbar />
                    <Toaster />
                    <Sonner />
                    <GlobalDonationPopup />
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/donate" element={<Donate />} />
                      <Route path="/videos" element={<Videos />} />
                      <Route path="/videos-simple" element={<VideosSimple />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />

                      {/* Auth callback route for email confirmations */}
                      <Route path="/auth/callback" element={<AuthCallback />} />

                      {/* Protected routes */}
                      <Route element={<ProtectedRoute />}>
                        {/* Use CustomDashboard as the default dashboard */}
                        <Route path="/dashboard" element={<CustomDashboard />} />
                        <Route path="/dashboard/classic" element={<Dashboard />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/activities" element={<ActivityExplorer />} />
                      </Route>

                      {/* Admin routes */}
                      <Route element={<AdminRoute />}>
                        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/users" element={<UserManagement />} />
                        <Route path="/admin/users/:userId" element={<UserDetailView />} />
                        <Route path="/admin/data" element={<DataManagement />} />
                        <Route path="/admin/activities" element={<ActivityList onEditActivity={(id) => console.log('Edit activity', id)} onCreateActivity={() => console.log('Create activity')} />} />
                        <Route path="/admin/activities/new" element={<ActivityEditor activityId={null} onSaved={() => console.log('Activity saved')} />} />
                        <Route path="/admin/activities/edit/:id" element={<ActivityEditor activityId="some-id" onSaved={() => console.log('Activity saved')} />} />
                        <Route path="/admin/activities/stats" element={<ActivityStats />} />
                        <Route path="/admin/stats" element={<SystemStats />} />
                        <Route path="/admin/settings/*" element={<SystemSettings />} />
                      </Route>

                      {/* Onboarding route should be accessible without full auth protection */}
                      <Route path="/onboarding" element={<Onboarding />} />

                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </TooltipProvider>
                </UserPreferencesProvider>
              </ThemeProvider>
            </AuthProvider>
          </BrowserRouter>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
