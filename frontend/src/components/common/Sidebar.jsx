import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
  HiOutlineHome, HiOutlinePlusCircle, HiOutlineClipboardList,
  HiOutlineChartBar, HiOutlineUserGroup, HiOutlineCollection,
  HiOutlineDocumentReport, HiOutlineBell, HiOutlineUser,
  HiOutlineStar, HiOutlineChevronLeft, HiOutlineChevronRight,
} from 'react-icons/hi';
import { useState } from 'react';

const Sidebar = () => {
  const { isAdminOrStaff, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const userLinks = [
    { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/complaints/new', icon: HiOutlinePlusCircle, label: 'New Complaint' },
    { to: '/complaints/my', icon: HiOutlineClipboardList, label: 'My Complaints' },
    { to: '/notifications', icon: HiOutlineBell, label: 'Notifications' },
    { to: '/profile', icon: HiOutlineUser, label: 'Profile' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: HiOutlineChartBar, label: 'Dashboard' },
    { to: '/admin/complaints', icon: HiOutlineClipboardList, label: 'All Complaints' },
    { to: '/admin/users', icon: HiOutlineUserGroup, label: 'Users' },
    { to: '/admin/categories', icon: HiOutlineCollection, label: 'Categories' },
    { to: '/admin/reports', icon: HiOutlineDocumentReport, label: 'Reports' },
    { to: '/notifications', icon: HiOutlineBell, label: 'Notifications' },
    { to: '/profile', icon: HiOutlineUser, label: 'Profile' },
  ];

  const links = isAdminOrStaff ? adminLinks : userLinks;

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hidden lg:flex flex-col bg-white border-r border-dark-100 min-h-[calc(100vh-64px)] sticky top-16"
    >
      <div className="flex-1 py-4 px-3">
        <div className="space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-gradient-to-r from-primary-50 to-primary-100/50 text-primary-600 font-semibold shadow-sm' 
                    : 'text-dark-500 hover:bg-dark-50 hover:text-dark-700'
                  }`}
                title={collapsed ? link.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <link.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-500' : ''}`} />
                {!collapsed && (
                  <span className="text-sm whitespace-nowrap">{link.label}</span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-dark-100">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-dark-400 hover:bg-dark-50 hover:text-dark-600 transition-colors text-sm"
        >
          {collapsed ? <HiOutlineChevronRight className="w-4 h-4" /> : <HiOutlineChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
