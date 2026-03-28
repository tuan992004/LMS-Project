import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/userAuthStore';
import { NotificationBell } from '../shared/NotificationBell';
import { 
    LayoutDashboard, 
    BookOpen, 
    Settings, 
    LogOut, 
    ChevronLeft, 
    ChevronRight, 
    Search,
    User as UserIcon,
    Menu,
    X,
    GraduationCap,
    ChevronDown
} from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';

import { useTranslation } from '../../hooks/useTranslation';

export const StudentLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);
    
    const { user, logOut } = useAuthStore((state) => state);
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { path: '/student', label: t('nav_dashboard'), icon: LayoutDashboard },
        { path: '/student/courses', label: t('nav_courses'), icon: BookOpen },
    ];

    const handleLogout = () => {
        logOut();
        navigate('/login');
    };

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsProfileOpen(false);
    }, [location.pathname]);

    // Handle click outside profile dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex min-h-screen font-sans text-[var(--text-primary)] transition-colors duration-500 bg-[var(--bg-primary)]">
            {/* Sidebar for Desktop */}
            <aside
                onMouseEnter={() => setIsSidebarOpen(true)}
                onMouseLeave={() => setIsSidebarOpen(false)}
                className={`
                    fixed left-0 top-0 h-screen bg-[var(--nav-bg)] backdrop-blur-2xl border-r border-[var(--border-color)] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-[100]
                    ${isSidebarOpen ? 'w-80 shadow-[20px_0_50px_-15px_rgba(0,0,0,0.1)]' : 'w-24'}
                    hidden lg:flex flex-col overflow-hidden
                `}
            >
                {/* Sidebar Header */}
                <div className="h-24 flex items-center justify-between px-8 border-b border-[var(--border-color)]/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-primary)] opacity-[0.03] rounded-full -mr-16 -mt-16" />
                    
                    {isSidebarOpen ? (
                        <div className="flex items-center gap-4 animate-fade-in">
                            <div className="w-10 h-10 bg-[var(--accent-primary)] rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/20 rotate-3 translate-y-[-2px]">
                                <GraduationCap className="text-white h-6 w-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-2xl tracking-tighter text-[var(--text-primary)] italic">
                                    {t('portal_student')}
                                </span>
                                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] opacity-40">{t('portal_student_sub')}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-10 h-10 bg-[var(--accent-primary)] rounded-full flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20 transition-transform duration-500 hover:rotate-[360deg]">
                            <GraduationCap className="text-white h-6 w-6" />
                        </div>
                    )}
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-1 py-10 px-6 space-y-3 overflow-y-auto custom-scrollbar z-10">
                    {navItems.map((item, idx) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.label}
                                to={item.path}
                                className={`
                                    flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 group relative overflow-hidden
                                    ${isActive 
                                        ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-[0_15px_30px_-5px_rgba(0,0,0,0.2)]' 
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--accent-primary)]/[0.08] hover:text-[var(--accent-primary)]'}
                                    ${!isSidebarOpen && 'justify-center px-0 h-14 w-14 mx-auto'}
                                `}
                                title={!isSidebarOpen ? item.label : ''}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-primary)]" />
                                )}
                                <item.icon className={`h-5 w-5 transition-all duration-300 group-hover:scale-110 ${isActive ? 'text-[var(--bg-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`} />
                                {isSidebarOpen && (
                                    <span className="text-sm font-black uppercase tracking-widest animate-fade-in">{item.label}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar User Profile (Minimized version) */}
                <div className="p-6 border-t border-[var(--border-color)]/50 bg-[var(--bg-secondary)]/30 backdrop-blur-md">
                    <div className={`flex items-center gap-4 p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)]/50 shadow-inner group ${!isSidebarOpen && 'justify-center cursor-pointer'}`}>
                        <div className="w-12 h-12 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center shadow-lg group-hover:bg-[var(--accent-primary)] transition-colors duration-500 overflow-hidden relative">
                            <div className="absolute inset-x-0 bottom-0 h-2 bg-white/10" />
                            <UserIcon className="h-6 w-6" />
                        </div>
                        {isSidebarOpen && (
                            <div className="flex-1 min-w-0 animate-fade-in">
                                <p className="text-sm font-black text-[var(--text-primary)] truncate italic">{user?.fullname || 'Student'}</p>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 blink" />
                                    <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.2em] font-black opacity-40">Scholar Verified</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            <main 
                className={`
                    flex-1 flex flex-col min-h-screen transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                    ${isSidebarOpen ? 'lg:ml-80' : 'lg:ml-24'}
                `}
            >
                {/* Top Navbar */}
                <header className="h-24 glass-nav sticky top-0 z-[90] px-8 sm:px-12 flex items-center justify-between">
                    {/* Mobile Menu Toggle */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden p-3 rounded-2xl hover:bg-[var(--bg-secondary)] transition-all active:scale-95 border border-[var(--border-color)]/50"
                    >
                        <Menu className="h-6 w-6 text-[var(--text-secondary)]" />
                    </button>

                    {/* Search Bar Placeholder */}
                    <div className="hidden md:flex items-center gap-4 bg-[var(--bg-secondary)]/50 border border-[var(--border-color)]/50 px-6 py-3 rounded-3xl w-full max-w-lg group focus-within:bg-[var(--bg-primary)] focus-within:ring-4 focus-within:ring-[var(--accent-primary)]/10 focus-within:border-[var(--accent-primary)] transition-all">
                        <Search className="h-4 w-4 text-[var(--text-secondary)] opacity-40 group-focus-within:text-[var(--accent-primary)] group-focus-within:opacity-100" />
                        <input 
                            type="text" 
                            placeholder="Find a course or lesson..." 
                            className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-[0.2em] w-full text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/40"
                        />
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4 sm:gap-8">
                        <div className="flex items-center gap-3">
                            <NotificationBell />
                        </div>
                        
                        <div className="h-10 w-px bg-[var(--border-color)]/50 mx-2 hidden sm:block" />
                        
                        {/* Profile Dropdown Container */}
                        <div className="relative" ref={profileRef}>
                            <button 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className={`
                                    flex items-center gap-4 px-3 py-2 rounded-2xl transition-all cursor-pointer group
                                    ${isProfileOpen ? 'bg-[var(--bg-secondary)]' : 'hover:bg-[var(--bg-secondary)]/50'}
                                `}
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-black text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1 italic tracking-tight">
                                        {user?.fullname || 'Student'}
                                    </p>
                                    <div className="flex items-center justify-end gap-2">
                                        <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.3em] font-black opacity-30">
                                            {t('portal_student_sub')}
                                        </p>
                                        <ChevronDown className={`h-3 w-3 text-[var(--text-secondary)] transition-transform duration-500 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-[var(--text-primary)] flex items-center justify-center text-[var(--bg-primary)] shadow-2xl group-hover:scale-105 group-hover:bg-[var(--accent-primary)] transition-all duration-300 relative overflow-hidden">
                                     <div className="absolute inset-x-0 bottom-0 h-2 bg-white/10" />
                                    <UserIcon className="h-6 w-6" />
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute top-full right-0 mt-5 w-72 animate-fade-in-up z-[110]">
                                    <div className="glass-card p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-[var(--border-color)]/30 overflow-hidden !rounded-[2rem]">
                                        <div className="px-6 py-5 border-b border-[var(--border-color)]/50 bg-[var(--bg-secondary)]/50 rounded-t-[1.5rem]">
                                            <p className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-[0.4em] mb-2">{t('auth_welcome')}</p>
                                            <p className="text-sm font-bold text-[var(--text-primary)] truncate opacity-80 decoration-[var(--accent-primary)]/20 underline underline-offset-4">{user?.email}</p>
                                        </div>
                                        <div className="p-2 pt-4 space-y-2">
                                            <Link 
                                                to="/student/settings" 
                                                className="flex items-center gap-4 px-4 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:bg-[var(--accent-primary)]/[0.08] hover:text-[var(--accent-primary)] transition-all group"
                                            >
                                                <Settings className="h-4 w-4 transition-transform group-hover:rotate-90" />
                                                {t('nav_settings')}
                                            </Link>
                                            <button 
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-all group"
                                            >
                                                <LogOut className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                {t('nav_logout')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content Viewport */}
                <div className="flex-1 p-8 sm:p-12 animate-fade-in relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-primary)]/10 to-transparent" />
                    <Outlet />
                </div>
            </main>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[150] lg:hidden">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-80 bg-[var(--nav-bg)] backdrop-blur-3xl shadow-[50px_0_100px_-20px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-left duration-500 border-r border-[var(--border-color)]/30">
                        <div className="h-24 flex items-center justify-between px-8 border-b border-[var(--border-color)]/30 relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-primary)] opacity-[0.03] rounded-full -mr-16 -mt-16" />
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[var(--accent-primary)] rounded-full flex items-center justify-center shadow-xl">
                                    <GraduationCap className="text-white h-6 w-6" />
                                </div>
                                <span className="font-black text-2xl tracking-tighter text-[var(--text-primary)] italic">{t('portal_student')}</span>
                            </div>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="h-10 w-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-rose-500 hover:text-white transition-all">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <nav className="flex-1 py-10 px-6 space-y-3">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.label}
                                        to={item.path}
                                        className={`
                                            flex items-center gap-5 px-6 py-5 rounded-2xl transition-all duration-300
                                            ${isActive 
                                                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-2xl font-black' 
                                                : 'text-[var(--text-secondary)] hover:bg-[var(--accent-primary)]/10 hover:text-[var(--accent-primary)]'}
                                        `}
                                    >
                                        <item.icon className={`h-6 w-6 ${isActive ? 'text-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'}`} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-8 border-t border-[var(--border-color)]/30 bg-[var(--bg-secondary)]/20">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-4 px-6 py-5 rounded-2xl text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all duration-300"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('nav_logout')}</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
};
