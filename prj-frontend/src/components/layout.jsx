import React from 'react';
import { UserRole } from '../types';

export const Layout = ({ children, user, onLogout, currentPage, onNavigate }) => {
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {children}
      </div>
    );
  }

  const getNavItems = () => {
    switch (user.role) {
      case UserRole.ADMIN:
        return [
          { id: 'admin-dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
          { id: 'admin-users', label: 'Users', icon: 'fa-users' },
          { id: 'admin-verify', label: 'Approvals', icon: 'fa-check-circle' },
        ];
      case UserRole.TEACHER:
        return [
          { id: 'teacher-dashboard', label: 'Course Management', icon: 'fa-chalkboard-teacher' },
          { id: 'teacher-create', label: 'Create Course', icon: 'fa-plus-circle' },
        ];
      case UserRole.STUDENT:
        return [
          { id: 'student-dashboard', label: 'Explore', icon: 'fa-compass' },
          { id: 'student-enrolled', label: 'My Learning', icon: 'fa-book-open' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-700 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-lightbulb text-white text-sm"></i>
          </div>
          <span className="text-xl font-bold tracking-tight">The Academic Hood</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full border-2 border-indigo-500"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-400 truncate capitalize">
                {user.role.toLowerCase()}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg transition-colors text-sm"
          >
            <i className="fa-solid fa-sign-out-alt"></i>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-lightbulb text-white text-sm"></i>
            </div>
            <span className="text-lg font-bold text-gray-900">Academic Hood</span>
          </div>

          <button onClick={onLogout} className="text-gray-500 hover:text-gray-900">
            <i className="fa-solid fa-sign-out-alt text-xl"></i>
          </button>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
