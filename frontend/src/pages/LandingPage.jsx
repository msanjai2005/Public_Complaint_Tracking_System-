import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineShieldCheck, HiOutlineLightningBolt, HiOutlineEye, HiOutlineChatAlt2, HiArrowRight, HiOutlineClipboardCheck } from 'react-icons/hi';
import complaintService from '../services/complaintService';
import StatusBadge from '../components/common/StatusBadge';
import ComplaintTimeline from '../components/complaints/ComplaintTimeline';
import toast from 'react-hot-toast';

const LandingPage = () => {
  const [trackingId, setTrackingId] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const navigate = useNavigate();

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return toast.error('Enter a tracking ID');
    setTrackLoading(true);
    try {
      const { data } = await complaintService.track(trackingId.trim());
      setTrackResult(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Complaint not found');
      setTrackResult(null);
    } finally {
      setTrackLoading(false);
    }
  };

  const features = [
    { icon: HiOutlineClipboardCheck, title: 'Easy Filing', desc: 'File complaints in minutes with photo uploads and category selection' },
    { icon: HiOutlineEye, title: 'Transparent Tracking', desc: 'Track real-time status with detailed timeline updates' },
    { icon: HiOutlineLightningBolt, title: 'Fast Resolution', desc: 'SLA-driven resolution with department accountability' },
    { icon: HiOutlineChatAlt2, title: 'Direct Communication', desc: 'Comment and follow up directly on your complaints' },
    { icon: HiOutlineShieldCheck, title: 'Secure & Private', desc: 'Your data is protected with enterprise-grade security' },
    { icon: HiOutlineSearch, title: 'Public Tracking', desc: 'Track any complaint status without login using tracking ID' },
  ];

  const categories = [
    { icon: '🗑️', name: 'Garbage', desc: 'Waste collection issues' },
    { icon: '🚿', name: 'Drainage', desc: 'Blocked drains & overflow' },
    { icon: '💡', name: 'Streetlight', desc: 'Damaged or non-functional' },
    { icon: '🛣️', name: 'Road Damage', desc: 'Potholes & broken roads' },
    { icon: '💧', name: 'Water Supply', desc: 'Supply & leakage issues' },
    { icon: '🚽', name: 'Sewage', desc: 'Sanitation problems' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 text-white">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-primary-200 mb-6">
                🧹 Public Complaint Tracking System
              </span>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold font-display leading-tight mb-6">
                Report Civic Issues.{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-300 via-accent-300 to-primary-300">
                  Track Resolution.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-dark-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                A transparent platform for citizens to report garbage, drainage, streetlight, 
                and other civic issues — and track their resolution in real-time.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Link
                  to="/register"
                  className="btn-primary !py-3.5 !px-8 text-base flex items-center gap-2 !from-primary-400 !to-accent-500"
                >
                  File a Complaint <HiArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3.5 text-base font-semibold border border-white/20 rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  Login to Dashboard
                </Link>
              </div>
            </motion.div>

            {/* Track complaint form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-xl mx-auto"
            >
              <form onSubmit={handleTrack} className="relative">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                      <input
                        type="text"
                        placeholder="Enter Tracking ID (e.g., SWC-20260001)"
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-dark-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/50 placeholder-dark-400"
                        id="tracking-input"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={trackLoading}
                      className="px-6 py-3.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50 whitespace-nowrap"
                      id="track-btn"
                    >
                      {trackLoading ? 'Tracking...' : 'Track Now'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 50L48 45.7C96 41.3 192 32.7 288 30C384 27.3 480 30.7 576 37.5C672 44.3 768 54.7 864 55.8C960 57 1056 49 1152 44.3C1248 39.7 1344 38.3 1392 37.7L1440 37V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Track Result */}
      {trackResult && (
        <section className="max-w-3xl mx-auto px-4 -mt-4 mb-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-glass border border-primary-100 !p-8"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-primary-500 mb-1">{trackResult.complaintId}</p>
                <h3 className="text-xl font-bold text-dark-800">{trackResult.title}</h3>
              </div>
              <StatusBadge status={trackResult.status} size="lg" />
            </div>
            <div className="flex gap-4 text-sm text-dark-500 mb-6">
              <span>{trackResult.category?.icon} {trackResult.category?.name}</span>
              <span>•</span>
              <span>Department: {trackResult.department || 'Unassigned'}</span>
            </div>
            <h4 className="text-sm font-bold text-dark-700 mb-4">Resolution Timeline</h4>
            <ComplaintTimeline timeline={trackResult.timeline} />
          </motion.div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 bg-dark-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-dark-900 mb-4">
              Why Choose <span className="text-gradient">SwachTrack</span>?
            </h2>
            <p className="text-dark-500 max-w-2xl mx-auto">
              Built for transparency, accountability, and citizen empowerment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card group hover:border-primary-200"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:from-primary-500 group-hover:to-accent-500 transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-primary-500 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-bold text-dark-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-dark-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-dark-900 mb-4">
              Complaint Categories
            </h2>
            <p className="text-dark-500">Report issues across these civic categories</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card text-center hover:border-primary-200 cursor-default"
              >
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h4 className="font-bold text-dark-800 text-sm">{cat.name}</h4>
                <p className="text-xs text-dark-400 mt-1">{cat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">
            Ready to make a difference?
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of citizens who are making their communities better by reporting civic issues.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:shadow-2xl hover:shadow-white/25 transition-all text-lg"
          >
            Get Started Free <HiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 text-dark-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🧹</span>
              </div>
              <span className="font-bold text-white font-display">SwachTrack</span>
            </div>
            <p className="text-sm">© {new Date().getFullYear()} SwachTrack. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
