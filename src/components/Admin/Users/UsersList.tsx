import React, { useEffect, useRef, useState } from 'react';
import { Plus, Search, Users as UsersIcon, Filter, X, Loader2, ChevronLeft, ChevronRight, Shield, ShoppingBag } from 'lucide-react';
import { ConfirmModal } from '../../Common/Modal';
import { supabase } from '../../../lib/supabase';
import { useNotification } from '../../../contexts/NotificationContext';
import { UserForm } from './UserForm';
import { User } from './List/types';
import { UserMobileList } from './List/UserMobileList';
import { UserDesktopTable } from './List/UserDesktopTable';

// Module-level cache – survives SPA navigation, cleared on hard refresh
let _usersCache: { users: User[]; totalItems: number; totalPages: number } | null = null;

export const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>(_usersCache?.users ?? []);
  const [loading, setLoading] = useState(_usersCache === null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(_usersCache?.totalPages ?? 1);
  const [totalItems, setTotalItems] = useState(_usersCache?.totalItems ?? 0);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { showSuccess, showError } = useNotification();
  const isFirstMount = useRef(true);

  const pageSize = 10;

  useEffect(() => {
    const background = isFirstMount.current && _usersCache !== null;
    isFirstMount.current = false;
    fetchUsers(background);
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async (background = false) => {
    try {
      if (!background) setLoading(true);
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
      if (roleFilter) query = query.eq('role', roleFilter);
      if (statusFilter === 'active') query = query.eq('is_active', true);
      if (statusFilter === 'inactive') query = query.eq('is_active', false);
      if (searchTerm) query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      const { data, error, count } = await query.range(from, to);
      if (error) throw error;
      const rows = (data || []).map((p: any) => ({
        id: p.id, email: p.email || '', full_name: p.full_name || '',
        role: p.role || 'customer', is_active: p.is_active !== false,
        email_verified: true, created_at: p.created_at, order_count: 0, total_spent: '0'
      }));
      const ti = count ?? 0;
      const tp = Math.max(1, Math.ceil(ti / pageSize));
      setUsers(rows);
      setTotalItems(ti);
      setTotalPages(tp);
      if (currentPage === 1 && !searchTerm && !roleFilter && !statusFilter) {
        _usersCache = { users: rows, totalItems: ti, totalPages: tp };
      }
    } catch (error: any) {
      if (!background) showError('Error', error.message || 'Failed to load users');
    } finally {
      if (!background) setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      setDeleteLoading(true);
      const { error } = await supabase.from('profiles').update({ is_active: false }).eq('id', selectedUser.id);
      if (error) throw error;
      showSuccess('Done', 'User deactivated successfully');
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      showError('Error', error.message || 'Failed to deactivate user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const { error } = await supabase.from('profiles').update({ is_active: !user.is_active }).eq('id', user.id);
      if (error) throw error;
      showSuccess('Updated', `User ${user.is_active ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (error: any) {
      showError('Error', error.message || 'Failed to update user status');
    }
  };

  const clearFilters = () => { setSearchTerm(''); setRoleFilter(''); setStatusFilter(''); setCurrentPage(1); };
  const hasActiveFilters = searchTerm || roleFilter || statusFilter;

  const activeCount = users.filter(u => u.is_active).length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const sellerCount = users.filter(u => u.role === 'seller').length;

  const statCards = [
    { label: 'Total', value: totalItems, icon: UsersIcon, iconCls: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
    { label: 'Active', value: activeCount, icon: UsersIcon, iconCls: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { label: 'Admins', value: adminCount, icon: Shield, iconCls: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    { label: 'Sellers', value: sellerCount, icon: ShoppingBag, iconCls: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  ];

  const Pagination = () => (
    totalPages > 1 ? (
      <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-xs text-gray-500">
          Showing <span className="font-medium text-gray-700">{(currentPage - 1) * pageSize + 1}</span>–<span className="font-medium text-gray-700">{Math.min(currentPage * pageSize, totalItems)}</span> of <span className="font-medium text-gray-700">{totalItems}</span>
        </p>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          </button>
          {[...Array(totalPages)].map((_, i) => {
            const p = i + 1;
            if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
              return (
                <button key={p} onClick={() => setCurrentPage(p)}
                  className={`px-2.5 py-1 rounded-lg text-sm font-medium transition-colors ${p === currentPage ? 'bg-slate-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {p}
                </button>
              );
            }
            if (p === currentPage - 2 || p === currentPage + 2) return <span key={p} className="px-1 text-gray-400 text-sm">…</span>;
            return null;
          })}
          <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
    ) : null
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <UsersIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Users</h1>
            <p className="text-sm text-gray-500">Manage user accounts and permissions</p>
          </div>
        </div>
        <button
          onClick={() => { setSelectedUser(null); setShowFormModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add User</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {statCards.map((s) => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-3 sm:p-4`}>
            <div className={`w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center mb-2 shadow-sm`}>
              <s.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${s.iconCls}`} />
            </div>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 leading-none">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="ml-auto flex items-center gap-1 px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 text-sm text-gray-900 placeholder-gray-400"
            />
          </div>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 text-sm text-gray-900">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="seller">Seller</option>
            <option value="customer">Customer</option>
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 text-sm text-gray-900">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <UsersIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No users found</p>
          {hasActiveFilters && <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <UserMobileList 
            users={users} 
            onToggleStatus={handleToggleStatus} 
            onEdit={(u) => { setSelectedUser(u); setShowFormModal(true); }} 
            onDelete={(u) => { setSelectedUser(u); setShowDeleteModal(true); }} 
          />
          <UserDesktopTable 
            users={users} 
            onToggleStatus={handleToggleStatus} 
            onEdit={(u) => { setSelectedUser(u); setShowFormModal(true); }} 
            onDelete={(u) => { setSelectedUser(u); setShowDeleteModal(true); }} 
          />
          <Pagination />
        </div>
      )}

      {/* Forms & Modals */}
      {showFormModal && (
        <UserForm
          user={selectedUser}
          onClose={() => { setShowFormModal(false); setSelectedUser(null); }}
          onSuccess={() => { setShowFormModal(false); setSelectedUser(null); fetchUsers(); }}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedUser(null); }}
        onConfirm={handleDelete}
        title="Deactivate User"
        message={`Are you sure you want to deactivate \"${selectedUser?.full_name}\"?`}
        confirmText="Deactivate"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};
