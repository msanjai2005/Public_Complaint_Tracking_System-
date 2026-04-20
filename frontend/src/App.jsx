import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import PrivateRoute from './components/common/PrivateRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import NewComplaint from './pages/NewComplaint';
import MyComplaints from './pages/MyComplaints';
import ComplaintDetails from './pages/ComplaintDetails';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import AdminComplaints from './pages/AdminComplaints';
import AdminUsers from './pages/AdminUsers';
import AdminCategories from './pages/AdminCategories';
import AdminReports from './pages/AdminReports';
import NotFound from './pages/NotFound';

function App() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner fullScreen text="Loading..." />;

  // Pages without navbar/sidebar
  const noLayoutPages = ['/', '/login', '/register'];
  const isNoLayout = noLayoutPages.includes(location.pathname);

  if (isNoLayout) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-dark-50">
      <Navbar />
      <div className="flex">
        {isAuthenticated && <Sidebar />}
        <main className="flex-1 min-h-[calc(100vh-64px)]">
          <Routes>
            {/* Public */}
            <Route path="/track/:trackingId" element={<LandingPage />} />

            {/* User routes */}
            <Route path="/dashboard" element={
              <PrivateRoute><UserDashboard /></PrivateRoute>
            } />
            <Route path="/complaints/new" element={
              <PrivateRoute><NewComplaint /></PrivateRoute>
            } />
            <Route path="/complaints/my" element={
              <PrivateRoute><MyComplaints /></PrivateRoute>
            } />
            <Route path="/complaints/:id" element={
              <PrivateRoute><ComplaintDetails /></PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute><Profile /></PrivateRoute>
            } />
            <Route path="/notifications" element={
              <PrivateRoute><Notifications /></PrivateRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={
              <PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>
            } />
            <Route path="/admin/complaints" element={
              <PrivateRoute adminOnly><AdminComplaints /></PrivateRoute>
            } />
            <Route path="/admin/complaints/:id" element={
              <PrivateRoute adminOnly><ComplaintDetails /></PrivateRoute>
            } />
            <Route path="/admin/users" element={
              <PrivateRoute adminOnly><AdminUsers /></PrivateRoute>
            } />
            <Route path="/admin/categories" element={
              <PrivateRoute adminOnly><AdminCategories /></PrivateRoute>
            } />
            <Route path="/admin/reports" element={
              <PrivateRoute adminOnly><AdminReports /></PrivateRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
