import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import complaintService from '../services/complaintService';
import toast from 'react-hot-toast';
import { HiOutlinePhotograph, HiOutlineX } from 'react-icons/hi';

const NewComplaint = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', priority: 'medium', address: '',
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await complaintService.getCategories();
        setCategories(data.data);
      } catch (err) {
        toast.error('Failed to load categories');
      }
    };
    loadCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      return toast.error('Maximum 5 images allowed');
    }
    
    const newImages = [...images, ...files].slice(0, 5);
    setImages(newImages);

    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    
    URL.revokeObjectURL(previews[index]);
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.description.length < 20) {
      return toast.error('Description must be at least 20 characters');
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('category', formData.category);
      fd.append('priority', formData.priority);
      fd.append('location', JSON.stringify({ address: formData.address }));
      images.forEach((img) => fd.append('images', img));

      const { data } = await complaintService.create(fd);
      toast.success(`Complaint filed! ID: ${data.data.complaintId}`);
      navigate(`/complaints/${data.data._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to file complaint';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title mb-2">File New Complaint</h1>
        <p className="text-dark-500 mb-8">Provide details about the civic issue you want to report.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category */}
          <div className="card">
            <h3 className="text-sm font-bold text-dark-700 mb-3">Select Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <label
                  key={cat._id}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${formData.category === cat._id
                      ? 'border-primary-500 bg-primary-50 shadow-sm'
                      : 'border-dark-100 hover:border-dark-200 hover:bg-dark-50'
                    }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat._id}
                    checked={formData.category === cat._id}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs font-semibold text-dark-700 text-center">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Title & Description */}
          <div className="card space-y-4">
            <div>
              <label className="label-field">Complaint Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief title describing the issue"
                className="input-field"
                required
                minLength={5}
                maxLength={100}
                id="complaint-title"
              />
              <p className="text-xs text-dark-400 mt-1">{formData.title.length}/100 characters</p>
            </div>

            <div>
              <label className="label-field">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide detailed description of the issue (minimum 20 characters)"
                className="textarea-field"
                rows={5}
                required
                minLength={20}
                maxLength={2000}
                id="complaint-description"
              />
              <p className={`text-xs mt-1 ${formData.description.length < 20 ? 'text-danger-500' : 'text-dark-400'}`}>
                {formData.description.length}/2000 characters (min 20)
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="card">
            <label className="label-field">Location / Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter the address or location of the issue"
              className="input-field"
              id="complaint-address"
            />
          </div>

          {/* Priority */}
          <div className="card">
            <label className="label-field mb-3">Priority Level</label>
            <div className="flex gap-3">
              {[
                { value: 'low', label: 'Low', color: 'border-green-200 bg-green-50 text-green-700', active: 'border-green-500 bg-green-100 ring-2 ring-green-500/20' },
                { value: 'medium', label: 'Medium', color: 'border-yellow-200 bg-yellow-50 text-yellow-700', active: 'border-yellow-500 bg-yellow-100 ring-2 ring-yellow-500/20' },
                { value: 'high', label: 'High', color: 'border-red-200 bg-red-50 text-red-700', active: 'border-red-500 bg-red-100 ring-2 ring-red-500/20' },
              ].map((p) => (
                <label
                  key={p.value}
                  className={`flex-1 text-center py-3 rounded-xl border-2 cursor-pointer font-semibold text-sm transition-all
                    ${formData.priority === p.value ? p.active : p.color}`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={p.value}
                    checked={formData.priority === p.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="card">
            <label className="label-field mb-3">Upload Photos (max 5)</label>
            
            {previews.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                {previews.map((preview, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-dark-200 group">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-dark-800/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <HiOutlineX className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length < 5 && (
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-dark-200 rounded-xl cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all">
                <HiOutlinePhotograph className="w-10 h-10 text-dark-300 mb-2" />
                <span className="text-sm text-dark-500 font-medium">Click to upload images</span>
                <span className="text-xs text-dark-400 mt-1">JPEG, PNG, WebP (max 5MB each)</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="complaint-images"
                />
              </label>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !formData.category}
            className="btn-primary w-full !py-4 text-base"
            id="complaint-submit"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Filing complaint...
              </span>
            ) : 'Submit Complaint'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default NewComplaint;
