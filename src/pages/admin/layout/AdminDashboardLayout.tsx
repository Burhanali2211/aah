import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  BarChart3,
  Settings,
  Warehouse,
  Store,
  MessageSquare,
  Globe,
  Share2,
  Phone,
  Link2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminDashboardSettings } from '@/hooks/useAdminDashboardSettings';
import { AdminDashboardLayoutProps, NavItem } from './AdminDashboardLayout/types';
import { Sidebar } from './AdminDashboardLayout/Sidebar';
import { DesktopHeader } from './AdminDashboardLayout/DesktopHeader';
import { MobileHeader } from './AdminDashboardLayout/MobileHeader';

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  {
    name: 'Products',
    path: '/admin/products',
    icon: Package,
    children: [
      { name: 'All Products', path: '/admin/products', icon: Package },
      { name: 'Categories', path: '/admin/categories', icon: Tag },
      { name: 'Inventory', path: '/admin/inventory', icon: Warehouse },
      { name: 'Quick Sale', path: '/admin/pos', icon: Store },
    ],
  },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  {
    name: 'Customers',
    path: '/admin/users',
    icon: Users,
    children: [
      { name: 'All Users', path: '/admin/users', icon: Users },
      { name: 'Inquiries', path: '/admin/contact-submissions', icon: MessageSquare },
    ],
  },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  {
    name: 'Settings',
    path: '/admin/settings',
    icon: Settings,
    children: [
      { name: 'Site Settings', path: '/admin/settings/site', icon: Globe },
      { name: 'Social Media', path: '/admin/settings/social-media', icon: Share2 },
      { name: 'Contact Info', path: '/admin/settings/contact', icon: Phone },
      { name: 'Footer Links', path: '/admin/settings/footer-links', icon: Link2 },
    ],
  },
];

export const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['/admin/products']);
  const { settings } = useAdminDashboardSettings();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSidebarOpen(prev => prev === true ? false : prev);
      if (location.pathname.includes('/admin/settings')) {
        setExpandedItems(prev => prev.includes('/admin/settings') ? prev : [...prev, '/admin/settings']);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    if (path === '/admin/users') {
      return location.pathname.startsWith('/admin/users') || location.pathname.startsWith('/admin/contact-submissions');
    }
    return location.pathname.startsWith(path);
  };

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const getInitials = () => {
    if (user?.fullName) {
      return user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'A';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader 
        settings={settings} 
        setSidebarOpen={setSidebarOpen} 
        title={title} 
        subtitle={subtitle} 
      />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 max-w-[85vw] bg-white border-r border-gray-200 shadow-xl transform transition-transform duration-300 ease-out flex flex-col lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar 
          settings={settings}
          user={user}
          navItems={navItems}
          setSidebarOpen={setSidebarOpen}
          expandedItems={expandedItems}
          toggleExpanded={toggleExpanded}
          isActive={isActive}
          handleLogout={handleLogout}
          getInitials={getInitials}
          locationPathname={location.pathname}
        />
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen flex flex-col">
        <DesktopHeader 
          title={title} 
          subtitle={subtitle} 
          user={user} 
          getInitials={getInitials} 
        />

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-6 xl:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardLayout;

