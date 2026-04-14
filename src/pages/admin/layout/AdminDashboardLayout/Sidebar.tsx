import React from 'react';
import { Link } from 'react-router-dom';
import { X, Crown, Shield, Home, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { NavItem } from './types';
import { isValidImageUrl } from '@/utils/images';
import { DashboardSettings } from '@/hooks/useAdminDashboardSettings';
import { User } from '@/types';

interface SidebarProps {
  settings: DashboardSettings;
  user: User | null;
  navItems: NavItem[];
  setSidebarOpen: (open: boolean) => void;
  expandedItems: string[];
  toggleExpanded: (path: string) => void;
  isActive: (path: string) => boolean;
  handleLogout: () => Promise<void>;
  getInitials: () => string;
  locationPathname: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  settings,
  user,
  navItems,
  setSidebarOpen,
  expandedItems,
  toggleExpanded,
  isActive,
  handleLogout,
  getInitials,
  locationPathname
}) => {
  return (
    <>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2.5">
          {settings.dashboard_logo_url && isValidImageUrl(settings.dashboard_logo_url) ? (
            <img
              src={settings.dashboard_logo_url}
              alt="Logo"
              className="w-9 h-9 rounded-xl object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center shadow-sm flex-shrink-0">
              <Crown className="w-5 h-5 text-white" />
            </div>
          )}
          <span className="text-base font-bold text-gray-900 truncate">
            {settings.dashboard_name || 'Admin Panel'}
          </span>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors lg:hidden"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Admin Profile Card */}
      <div className="p-3 flex-shrink-0">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">{getInitials()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">
                {user?.fullName || 'Admin'}
              </p>
              <p className="text-xs text-slate-500 font-medium">Super Admin</p>
            </div>
            <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-full">
              <Shield className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.includes(item.path);

          return (
            <div key={item.path}>
              {hasChildren ? (
                <button
                  onClick={() => toggleExpanded(item.path)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 min-h-[44px] ${
                    active
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-slate-700' : 'text-gray-500'}`} />
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 min-h-[44px] ${
                    active
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-slate-700' : 'text-gray-500'}`} />
                  <span className="font-medium text-sm flex-1">{item.name}</span>
                  {active && <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                </Link>
              )}

              {hasChildren && isExpanded && (
                <div className="ml-4 mt-0.5 mb-1 space-y-0.5 border-l-2 border-gray-200 pl-3">
                  {item.children?.map((child) => {
                    const ChildIcon = child.icon;
                    const childActive = locationPathname.startsWith(child.path);
                    return (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all min-h-[42px] ${
                          childActive
                            ? 'bg-slate-100 text-slate-900'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <ChildIcon className={`w-4 h-4 flex-shrink-0 ${childActive ? 'text-slate-700' : 'text-gray-400'}`} />
                        <span className="text-sm">{child.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div
        className="p-3 border-t border-gray-200 space-y-0.5 flex-shrink-0"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors min-h-[44px]"
        >
          <Home className="w-5 h-5 text-gray-500 flex-shrink-0" />
          <span className="font-medium text-sm">View Store</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors min-h-[44px]"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </>
  );
};

