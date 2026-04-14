import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Crown, Home } from 'lucide-react';
import { DashboardSettings } from '@/hooks/useAdminDashboardSettings';

interface MobileHeaderProps {
  settings: DashboardSettings;
  setSidebarOpen: (open: boolean) => void;
  title: string;
  subtitle?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  settings,
  setSidebarOpen,
  title,
  subtitle
}) => {
  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 h-14">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-1 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-gray-900">
              {settings.dashboard_name || 'Admin'}
            </span>
          </div>

          <Link
            to="/"
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="View store"
          >
            <Home className="w-5 h-5 text-gray-600" />
          </Link>
        </div>
      </header>

      {/* Mobile Page Title */}
      <div className="lg:hidden px-4 py-3 bg-white border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </>
  );
};

