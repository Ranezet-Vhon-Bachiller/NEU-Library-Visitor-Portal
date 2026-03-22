import React from 'react';
import { useAuth } from './Auth';
import { LogOut, User, Shield, LayoutDashboard, ClipboardList, LogIn } from 'lucide-react';
import { AppRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'form' | 'admin';
  setActiveTab: (tab: 'form' | 'admin') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, role, login, logout, setRole } = useAuth();

  const canSwitchRole = user?.email === 'jcesperanza@neu.edu.ph' || user?.email === 'ranezetvhon.bachiller@neu.edu.ph';

  return (
    <div className="min-h-screen font-sans text-stone-900">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg" 
                alt="NEU Logo" 
                className="w-10 h-10 object-contain"
                referrerPolicy="no-referrer"
              />
              <h1 className="text-xl font-bold tracking-tight text-emerald-900">NEU Library Visitor Portal</h1>
            </div>

            {user && (
              <div className="flex items-center gap-4">
                {/* Role Switcher for Admin/Special Users */}
                {canSwitchRole && (
                  <div className="hidden sm:flex items-center bg-stone-100 rounded-full p-1 border border-stone-200">
                    <button
                      onClick={() => setRole('User')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        role === 'User' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                      }`}
                    >
                      User
                    </button>
                    <button
                      onClick={() => setRole('Admin')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        role === 'Admin' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3 pl-4 border-l border-stone-200">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-stone-900">{user.displayName}</p>
                    <p className="text-xs text-stone-500">{role}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs (Admin only) */}
      {user && role === 'Admin' && (
        <div className="bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab('form')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all flex items-center gap-2 ${
                  activeTab === 'form'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                Visitor Log
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all flex items-center gap-2 ${
                  activeTab === 'admin'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin Dashboard
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-stone-500">© 2026 New Era University Library. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
