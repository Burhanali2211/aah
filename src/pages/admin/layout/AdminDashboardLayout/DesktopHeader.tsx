import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Bell, Home } from 'lucide-react';
import { User } from '@/types';

interface DesktopHeaderProps {
  title: string;
  subtitle?: string;
  user: User | null;
  getInitials: () => string;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  title,
  subtitle,
  user,
  getInitials
}) => {
  return (
    <header className="hidden lg:block sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 xl:px-8 py-4">
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-1">
            <Link to="/admin" className="hover:text-slate-700 transition-colors">
              Admin
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-700 font-medium">{title}</span>
          </nav>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-500" />
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="font-medium text-sm">Store</span>
          </Link>

          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <div className="text-right hidden xl:block">
              <p className="text-sm font-semibold text-gray-900">{user?.fullName || 'Admin'}</p>
              <p className="text-xs text-slate-500">Super Admin</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">{getInitials()}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

