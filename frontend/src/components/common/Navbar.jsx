import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineHome, HiOutlinePlusCircle, HiOutlineClipboardList, 
  HiOutlineUser, HiOutlineBell, HiOutlineLogout, HiOutlineMenu, 
  HiOutlineX, HiOutlineCog, HiOutlineChartBar, HiOutlineSearch 
} from 'react-icons/hi';

const Navbar = () => {
  const { user, isAuthenticated, isAdminOrStaff, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location]);

  const handleTrack = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/track/${searchQuery.trim()}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-dark-100/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? (isAdminOrStaff ? '/admin/dashboard' : '/dashboard') : '/'} 
                className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow duration-300">
              <span className="text-white text-lg">🧹</span>
            </div>
            <span className="text-xl font-bold font-display text-dark-900 hidden sm:block">
              Swach<span className="text-gradient">Track</span>
            </span>
          </Link>

          {/* Search bar - Desktop */}
          <form onSubmit={handleTrack} className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Track complaint (e.g., SWC-20260001)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-dark-50 border border-dark-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
              />
            </div>
          </form>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-dark-600 hover:text-primary-600 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm !py-2 !px-5">
                  Register
                </Link>
              </>
            ) : (
              <>
                {!isAdminOrStaff && (
                  <Link to="/complaints/new" className="btn-primary text-sm !py-2 !px-4 flex items-center gap-1.5">
                    <HiOutlinePlusCircle className="w-4 h-4" />
                    New Complaint
                  </Link>
                )}

                {/* Notification bell */}
                <Link to="/notifications" className="relative p-2 rounded-xl hover:bg-dark-50 transition-colors">
                  <HiOutlineBell className="w-5 h-5 text-dark-500" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
                </Link>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-dark-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-accent-400 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{getInitials(user?.name)}</span>
                    </div>
                    <span className="text-sm font-medium text-dark-700 hidden lg:block">{user?.name?.split(' ')[0]}</span>
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-dark-100 py-2 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-dark-100">
                          <p className="text-sm font-semibold text-dark-800">{user?.name}</p>
                          <p className="text-xs text-dark-400">{user?.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase bg-primary-50 text-primary-600 rounded-full">
                            {user?.role}
                          </span>
                        </div>
                        <div className="py-1">
                          <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-dark-600 hover:bg-dark-50 transition-colors">
                            <HiOutlineUser className="w-4 h-4" /> My Profile
                          </Link>
                          {isAdminOrStaff && (
                            <Link to="/admin/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-dark-600 hover:bg-dark-50 transition-colors">
                              <HiOutlineChartBar className="w-4 h-4" /> Admin Dashboard
                            </Link>
                          )}
                          {!isAdminOrStaff && (
                            <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-dark-600 hover:bg-dark-50 transition-colors">
                              <HiOutlineHome className="w-4 h-4" /> Dashboard
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-dark-100 py-1">
                          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger-500 hover:bg-danger-50 transition-colors">
                            <HiOutlineLogout className="w-4 h-4" /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl hover:bg-dark-50">
            {mobileOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-dark-100 bg-white overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              <form onSubmit={handleTrack} className="mb-3">
                <div className="relative">
                  <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    type="text"
                    placeholder="Track complaint ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-50 border border-dark-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>
              </form>

              {!isAuthenticated ? (
                <>
                  <Link to="/login" className="block px-4 py-3 text-center rounded-xl border border-dark-200 text-sm font-semibold">Login</Link>
                  <Link to="/register" className="block px-4 py-3 text-center rounded-xl bg-primary-500 text-white text-sm font-semibold">Register</Link>
                </>
              ) : (
                <>
                  <div className="px-4 py-3 bg-dark-50 rounded-xl mb-2">
                    <p className="font-semibold text-dark-800">{user?.name}</p>
                    <p className="text-xs text-dark-400">{user?.email}</p>
                  </div>
                  {!isAdminOrStaff ? (
                    <>
                      <Link to="/dashboard" className="nav-link"><HiOutlineHome className="w-5 h-5" /> Dashboard</Link>
                      <Link to="/complaints/new" className="nav-link"><HiOutlinePlusCircle className="w-5 h-5" /> New Complaint</Link>
                      <Link to="/complaints/my" className="nav-link"><HiOutlineClipboardList className="w-5 h-5" /> My Complaints</Link>
                    </>
                  ) : (
                    <>
                      <Link to="/admin/dashboard" className="nav-link"><HiOutlineChartBar className="w-5 h-5" /> Admin Dashboard</Link>
                      <Link to="/admin/complaints" className="nav-link"><HiOutlineClipboardList className="w-5 h-5" /> All Complaints</Link>
                      <Link to="/admin/users" className="nav-link"><HiOutlineUser className="w-5 h-5" /> Users</Link>
                    </>
                  )}
                  <Link to="/profile" className="nav-link"><HiOutlineUser className="w-5 h-5" /> Profile</Link>
                  <Link to="/notifications" className="nav-link"><HiOutlineBell className="w-5 h-5" /> Notifications</Link>
                  <button onClick={handleLogout} className="w-full nav-link text-danger-500 hover:bg-danger-50 hover:text-danger-600">
                    <HiOutlineLogout className="w-5 h-5" /> Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
