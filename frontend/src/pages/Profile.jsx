import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineLockClosed } from 'react-icons/hi';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    pincode: user?.address?.pincode || '',
    landmark: user?.address?.landmark || '',
  });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/auth/me', {
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          pincode: formData.pincode,
          landmark: formData.landmark,
        },
      });
      if (data.success) {
        updateUser(data.data);
        toast.success('Profile updated');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return toast.error('Passwords do not match');
    if (passwords.new.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      toast.success('Password changed');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'password', label: 'Security' },
  ];

  return (
    <div className="page-container max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header card */}
        <div className="card mb-6 bg-gradient-to-r from-primary-500 to-accent-500 text-white border-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold">{user?.name}</h1>
              <p className="text-white/70 text-sm">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase bg-white/20 rounded-full">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-dark-100 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all
                ${activeTab === tab.id
                  ? 'bg-white text-dark-800 shadow-sm'
                  : 'text-dark-500 hover:text-dark-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile form */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className="card space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Full Name</label>
                <div className="relative">
                  <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field !pl-11" required />
                </div>
              </div>
              <div>
                <label className="label-field">Email (read-only)</label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input type="email" value={user?.email} className="input-field !pl-11 bg-dark-50 cursor-not-allowed" disabled />
                </div>
              </div>
              <div>
                <label className="label-field">Phone</label>
                <div className="relative">
                  <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input-field !pl-11" />
                </div>
              </div>
            </div>

            <div className="border-t border-dark-100 pt-4">
              <h3 className="text-sm font-bold text-dark-700 mb-3 flex items-center gap-2">
                <HiOutlineLocationMarker className="w-4 h-4" /> Address
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <input type="text" placeholder="Street" value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} className="input-field" />
                <input type="text" placeholder="City" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="input-field" />
                <input type="text" placeholder="Pincode" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} className="input-field" />
                <input type="text" placeholder="Landmark" value={formData.landmark} onChange={(e) => setFormData({...formData, landmark: e.target.value})} className="input-field" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {/* Password form */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordChange} className="card space-y-4">
            {['current', 'new', 'confirm'].map((field) => (
              <div key={field}>
                <label className="label-field">
                  {field === 'current' ? 'Current Password' : field === 'new' ? 'New Password' : 'Confirm New Password'}
                </label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    type="password"
                    value={passwords[field]}
                    onChange={(e) => setPasswords({...passwords, [field]: e.target.value})}
                    className="input-field !pl-11"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;
