import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  ShoppingCart, Loader2, ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useNotification } from '../../../contexts/NotificationContext';
import { OrderDetails } from './OrderDetails';

// Modular Components
import { OrderStatsGrid } from './OrderStatsGrid';
import { OrderFilters } from './OrderFilters';
import { OrderMobileList } from './List/OrderMobileList';
import { OrderDesktopTable } from './List/OrderDesktopTable';
import { Order, OrderStats } from './types';

// Module-level cache – survives SPA navigation, cleared on hard refresh
let _ordersCache: { orders: Order[]; totalItems: number; totalPages: number } | null = null;
let _orderStatsCache: OrderStats | null = null;

export const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(_ordersCache?.orders ?? []);
  const [loading, setLoading] = useState(_ordersCache === null);
  const [statsLoading, setStatsLoading] = useState(_orderStatsCache === null);
  const [stats, setStats] = useState<OrderStats | null>(_orderStatsCache);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(_ordersCache?.totalPages ?? 1);
  const [totalItems, setTotalItems] = useState(_ordersCache?.totalItems ?? 0);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstMount = useRef(true);

  const handleSearchChange = useCallback((value: string) => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 300);
  }, []);

  useEffect(() => {
    return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current); };
  }, []);

  const pageSize = 10;

  useEffect(() => {
    const background = isFirstMount.current && _orderStatsCache !== null;
    fetchStats(background);
  }, []);

  useEffect(() => {
    const background = isFirstMount.current && _ordersCache !== null;
    isFirstMount.current = false;
    fetchOrders(background);
  }, [currentPage, searchTerm, statusFilter, paymentStatusFilter]);

  const fetchStats = async (background = false) => {
    try {
      if (!background) setStatsLoading(true);
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [
        { count: totalOrders },
        { count: pendingOrders },
        { count: ordersToday },
        { data: revenueRows },
        { data: todayRevenueRows },
        { data: paidRows },
        { data: statusRows },
      ] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
        supabase.from('orders').select('total_amount').in('status', ['delivered', 'shipped']),
        supabase.from('orders').select('total_amount').in('status', ['delivered', 'shipped']).gte('created_at', todayStart.toISOString()),
        supabase.from('orders').select('total_amount').eq('payment_status', 'paid'),
        supabase.from('orders').select('status'),
      ]);

      const totalRevenue = (revenueRows || []).reduce((s, o) => s + parseFloat(o.total_amount || '0'), 0);
      const revenueToday = (todayRevenueRows || []).reduce((s, o) => s + parseFloat(o.total_amount || '0'), 0);
      const paidTotal = (paidRows || []).reduce((s, o) => s + parseFloat(o.total_amount || '0'), 0);
      const avgOrderValue = paidRows && paidRows.length > 0 ? paidTotal / paidRows.length : 0;

      const statusBreakdown: Record<string, number> = {};
      (statusRows || []).forEach((o) => {
        statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
      });

      const newStats: OrderStats = { totalOrders: totalOrders ?? 0, totalRevenue, pendingOrders: pendingOrders ?? 0, ordersToday: ordersToday ?? 0, revenueToday, avgOrderValue, statusBreakdown };
      setStats(newStats);
      _orderStatsCache = newStats;
    } catch {
      // non-critical
    } finally {
      if (!background) setStatsLoading(false);
    }
  };

  const fetchOrders = async (background = false) => {
    try {
      if (!background) setLoading(true);
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (statusFilter) query = query.eq('status', statusFilter);
      if (paymentStatusFilter) query = query.eq('payment_status', paymentStatusFilter);
      if (searchTerm) query = query.ilike('order_number', `%${searchTerm}%`);

      const { data, error, count } = await query.range(from, to);
      if (error) throw error;

      const ordersRaw = data || [];
      const userIds = [...new Set(ordersRaw.map((o) => o.user_id).filter(Boolean))];
      const profileMap: Record<string, { full_name?: string; email?: string }> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, full_name, email').in('id', userIds);
        (profiles || []).forEach((p) => { profileMap[p.id] = p; });
      }

      const mappedOrders = ordersRaw.map((o) => ({
        ...o,
        customer_name: profileMap[o.user_id]?.full_name || 'Guest',
        customer_email: profileMap[o.user_id]?.email || '',
      }));
      const ti = count ?? 0;
      const tp = Math.max(1, Math.ceil(ti / pageSize));
      setOrders(mappedOrders);
      setTotalItems(ti);
      setTotalPages(tp);
      // Cache only the default (page 1, no filters) result
      if (currentPage === 1 && !searchTerm && !statusFilter && !paymentStatusFilter) {
        _ordersCache = { orders: mappedOrders, totalItems: ti, totalPages: tp };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load orders';
      if (!background) showNotification({ type: 'error', title: 'Error', message: msg });
    } finally {
      if (!background) setLoading(false);
    }
  };

  if (selectedOrderId) {
    return (
      <OrderDetails
        orderId={selectedOrderId}
        onClose={() => { setSelectedOrderId(null); fetchOrders(); fetchStats(); }}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShoppingCart className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500">Manage and track customer orders</p>
          </div>
        </div>
        <button
          onClick={() => { fetchOrders(); fetchStats(); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl font-medium text-sm text-gray-700 transition-colors min-h-[44px] flex-shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <OrderStatsGrid
        stats={stats}
        loading={statsLoading}
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => { setStatusFilter(s); setCurrentPage(1); }}
      />

      <OrderFilters
        searchInput={searchInput}
        onSearchInputChange={(val) => { setSearchInput(val); handleSearchChange(val); }}
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => { setStatusFilter(s); setCurrentPage(1); }}
        paymentStatusFilter={paymentStatusFilter}
        onPaymentStatusFilterChange={(s) => { setPaymentStatusFilter(s); setCurrentPage(1); }}
        onClearFilters={() => { setSearchInput(''); setSearchTerm(''); setStatusFilter(''); setPaymentStatusFilter(''); setCurrentPage(1); }}
        totalItems={totalItems}
      />

      <OrderMobileList 
        loading={loading}
        orders={orders}
        setSelectedOrderId={setSelectedOrderId}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        setCurrentPage={setCurrentPage}
        ChevronLeft={ChevronLeft}
        ChevronRight={ChevronRight}
      />

      <OrderDesktopTable 
        loading={loading}
        orders={orders}
        setSelectedOrderId={setSelectedOrderId}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        setCurrentPage={setCurrentPage}
        ChevronLeft={ChevronLeft}
        ChevronRight={ChevronRight}
      />
    </div>
  );
};

