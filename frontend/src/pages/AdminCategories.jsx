import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import adminService from '../services/adminService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', department: '', slaHours: 48, icon: '📋' });

  const loadCategories = async () => {
    try {
      const { data } = await adminService.getAllCategories();
      setCategories(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: '', description: '', department: '', slaHours: 48, icon: '📋' });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setFormData({ name: cat.name, description: cat.description || '', department: cat.department, slaHours: cat.slaHours, icon: cat.icon || '📋' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await adminService.updateCategory(editing._id, formData);
        toast.success('Category updated');
      } else {
        await adminService.createCategory(formData);
        toast.success('Category created');
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this category?')) return;
    try {
      await adminService.deleteCategory(id);
      toast.success('Category deactivated');
      loadCategories();
    } catch (err) {
      toast.error('Failed to deactivate');
    }
  };

  const icons = ['📋', '🗑️', '🚿', '💡', '🛣️', '💧', '🚽', '🔧', '🏗️', '🌳', '🔌', '🚰'];

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="section-title">Category Management</h1>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
            <HiOutlinePlus className="w-4 h-4" /> New Category
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`card ${!cat.isActive ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{cat.icon}</span>
                  <div>
                    <h3 className="font-bold text-dark-800">{cat.name}</h3>
                    <p className="text-xs text-dark-400">{cat.department}</p>
                  </div>
                </div>
                {!cat.isActive && (
                  <span className="badge bg-dark-100 text-dark-500 text-[10px]">Inactive</span>
                )}
              </div>
              {cat.description && (
                <p className="text-sm text-dark-500 mb-3">{cat.description}</p>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-dark-100">
                <span className="text-xs text-dark-400">SLA: {cat.slaHours}h</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)} className="p-2 rounded-lg hover:bg-dark-50 text-dark-400 hover:text-primary-500 transition-colors">
                    <HiOutlinePencil className="w-4 h-4" />
                  </button>
                  {cat.isActive && (
                    <button onClick={() => handleDelete(cat._id)} className="p-2 rounded-lg hover:bg-danger-50 text-dark-400 hover:text-danger-500 transition-colors">
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'New Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Icon</label>
            <div className="flex flex-wrap gap-2">
              {icons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xl transition-all
                    ${formData.icon === icon ? 'border-primary-500 bg-primary-50 scale-110' : 'border-dark-100 hover:border-dark-200'}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label-field">Category Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field" required />
          </div>
          <div>
            <label className="label-field">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="textarea-field" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Department</label>
              <input type="text" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="input-field" required />
            </div>
            <div>
              <label className="label-field">SLA (hours)</label>
              <input type="number" value={formData.slaHours} onChange={(e) => setFormData({...formData, slaHours: parseInt(e.target.value)})} className="input-field" min={1} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCategories;
