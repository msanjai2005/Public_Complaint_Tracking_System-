import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import adminService from '../services/adminService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlineBan, HiOutlineCheck } from 'react-icons/hi';
import { formatDate } from '../utils/formatters';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const { data } = await adminService.getAllUsers(params);
      setUsers(data.data.users);
      setTotalPages(data.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, [page, roleFilter]);

  const handleToggleBlock = async (userId) => {
    try {
      const { data } = await adminService.toggleBlockUser(userId);
      toast.success(data.message);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title mb-6">User Management</h1>

        {/* Search */}
        <div className="card mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field !pl-10 !py-2.5"
              />
            </div>
            <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="select-field !w-auto !py-2.5">
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="btn-primary !py-2.5 text-sm">Search</button>
          </form>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-50 border-b border-dark-100">
                  <tr>
                    <th className="table-header">User</th>
                    <th className="table-header">Contact</th>
                    <th className="table-header">Role</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Joined</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-dark-50/50 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-primary-300 to-accent-300 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{u.name?.[0]?.toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-dark-700 text-sm">{u.name}</p>
                            <p className="text-xs text-dark-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell text-sm">{u.phone}</td>
                      <td className="table-cell">
                        <span className={`badge ${
                          u.role === 'admin' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                          u.role === 'staff' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                          'bg-dark-50 text-dark-600 border border-dark-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="table-cell">
                        {u.isBlocked ? (
                          <span className="badge bg-danger-50 text-danger-600 border border-danger-200">Blocked</span>
                        ) : (
                          <span className="badge bg-success-50 text-success-600 border border-success-200">Active</span>
                        )}
                      </td>
                      <td className="table-cell text-sm text-dark-400">{formatDate(u.createdAt)}</td>
                      <td className="table-cell text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleBlock(u._id)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                              ${u.isBlocked
                                ? 'bg-success-50 text-success-600 hover:bg-success-100'
                                : 'bg-danger-50 text-danger-600 hover:bg-danger-100'
                              }`}
                          >
                            {u.isBlocked ? <><HiOutlineCheck className="w-3.5 h-3.5" /> Unblock</> : <><HiOutlineBan className="w-3.5 h-3.5" /> Block</>}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </motion.div>
    </div>
  );
};

export default AdminUsers;
