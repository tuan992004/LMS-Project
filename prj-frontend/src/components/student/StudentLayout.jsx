import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/userAuthStore';
import { useUIStore } from '../../stores/useUIStore';
import { NotificationBell } from '../shared/NotificationBell';
import { MobileHeader } from '../layout/MobileHeader';
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
    ChevronDown,
    ClipboardList,
    Shield
} from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';

import { useTranslation } from '../../hooks/useTranslation';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { MobileFooterNav } from '../layout/MobileFooterNav';
import { MobileSettingsDrawer } from '../layout/MobileSettingsDrawer';
import { NotificationDrawer } from '../shared/NotificationDrawer';

export const StudentLayout = () => {
    const {
        isSidebarOpen,
        setSidebarOpen,
        setSettingsOpen
    } = useUIStore();

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    const { user, logOut } = useAuthStore((state) => state);
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { path: '/student', label: t('nav_dashboard'), icon: LayoutDashboard },
        { path: '/student/courses', label: t('nav_courses'), icon: BookOpen },
        { path: '/student/assignments', label: t('nav_assignments'), icon: ClipboardList },
    ];

    const handleLogout = () => {
        logOut();
        navigate('/login');
    };

    // Close menus on route change & handle Escape key
    useEffect(() => {
        setSettingsOpen(false);
        setIsProfileOpen(false);

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setSettingsOpen(false);
                setIsProfileOpen(false);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [location.pathname, setSettingsOpen]);
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
            {/* Sidebar for Desktop - Locked Width & No-Scroll Refactor */}
            <aside
                onMouseEnter={() => setSidebarOpen(true)}
                onMouseLeave={() => setSidebarOpen(false)}
                className={`
                    fixed left-0 top-24 h-[calc(100vh-6rem)] glass-nav border-r border-[var(--border-color)] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-[100]
                    ${isSidebarOpen ? 'w-72 shadow-2xl' : 'w-20'}
                    hidden lg:flex flex-col overflow-x-hidden overflow-y-auto box-border select-none
                `}
                aria-label={t('nav_student_sidebar_aria') || "Student Portal Sidebar"}
            >


                {/* Sidebar Navigation - Truncation focus */}
                <nav 
                    className="flex-1 py-8 px-4 space-y-2 overflow-x-hidden custom-scrollbar"
                    aria-label="Student Portal Navigation"
                >
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path) && (item.path !== '/student' || location.pathname === '/student');
                        return (
                            <Link
                                key={item.label}
                                to={item.path}
                                className={`
                                    flex items-center gap-4 h-12 rounded-xl transition-all duration-300 group relative overflow-hidden w-full
                                    ${isActive 
                                        ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-lg' 
                                        : 'text-[var(--text-primary)] hover:bg-[var(--text-primary)]/[0.08]'}
                                    ${!isSidebarOpen ? 'justify-center px-0' : 'px-4'}
                                `}
                                title={!isSidebarOpen ? item.label : ''}
                            >
                                <item.icon 
                                    className={`h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'active-icon-glow' : 'opacity-60'}`} 
                                    strokeWidth={1.5} 
                                />
                                {isSidebarOpen && (
                                    <span className="text-[12px] font-black uppercase tracking-wider animate-fade-in truncate whitespace-nowrap leading-relaxed opacity-80 group-hover:opacity-100">
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar User Profile - Muted Hierarchy */}
                <footer className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex-none overflow-hidden">
                    <Link 
                        to="/student/settings"
                        className={`flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] transition-all group cursor-pointer hover:bg-[var(--text-primary)] hover:border-[var(--text-primary)] ${!isSidebarOpen ? 'justify-center' : ''}`}
                    >
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center shadow-md relative overflow-hidden group-hover:bg-[var(--bg-primary)] group-hover:text-[var(--text-primary)] transition-colors">
                            <UserIcon className="h-5 w-5" strokeWidth={1.5} />
                        </div>
                        {isSidebarOpen && (
                            <div className="flex-1 min-w-0 animate-fade-in">
                                <p className="text-sm font-black text-[var(--text-primary)] truncate italic leading-relaxed group-hover:text-[var(--bg-primary)]">
                                    {user?.fullname || 'Student'}
                                </p>
                                <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider font-black leading-relaxed truncate group-hover:text-[var(--bg-primary)]/60">
                                    {t('auth_verified')}
                                </p>
                            </div>
                        )}
                    </Link>
                </footer>
            </aside>

            {/* Mobile View Container */}
            <div className="flex flex-col flex-1 pb-32 lg:pb-0 relative overflow-x-hidden">
                <MobileHeader />

                <main 
                    role="main"
                    className={`
                        flex-1 flex flex-col min-h-screen transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] pt-24
                        ${isSidebarOpen ? 'lg:ml-80' : 'lg:ml-24'}
                    `}
                >
                    {/* Global Top Navbar for Desktop - Moved out for full width */}
                    <header className="h-24 glass-nav fixed top-0 left-0 w-full z-[120] px-8 sm:px-12 hidden lg:flex items-center justify-between">
                        {/* Brand / Logo Space (Dynamic width to balance sidebar) */}
                        <Link 
                            to="/student"
                            className={`${isSidebarOpen ? 'w-auto' : 'w-auto'} transition-all duration-500 flex items-center gap-4`}
                        >
                             <div className="w-10 h-10 shrink-0 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl flex items-center justify-center shadow-lg transition-transform duration-500 hover:rotate-12">
                                <Shield className="h-5 w-5" strokeWidth={1.5} />
                            </div>
                            <span className="text-xl font-black italic tracking-tighter text-[var(--text-primary)] hidden sm:block">
                                The Academic Hood
                            </span>
                        </Link>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-4 sm:gap-8 pr-4">
                            <NotificationBell />
                            
                            <div className="h-10 w-px bg-[var(--border-color)]/50 mx-2 hidden sm:block" />
                            
                            {/* Profile Dropdown Container */}
                            <div className="relative" ref={profileRef}>
                                <button 
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    aria-haspopup="true"
                                    aria-expanded={isProfileOpen}
                                    aria-label={t('nav_user_menu_aria') || "Account Settings"}
                                    className={`
                                        flex items-center gap-4 px-3 py-2 rounded-2xl transition-all cursor-pointer group active:scale-95
                                        ${isProfileOpen ? 'bg-[var(--nav-bg)]' : 'hover:bg-[var(--nav-bg)]/50'}
                                    `}
                                >
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-black text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1 italic tracking-tight leading-relaxed">
                                            {user?.fullname || 'Student'}
                                        </p>
                                        <div className="flex items-center justify-end gap-2 text-[10px] uppercase tracking-widest font-black text-[var(--text-secondary)] opacity-50 group-hover:opacity-100 transition-opacity leading-relaxed">
                                            {t('portal_student_sub')}
                                            <ChevronDown className={`h-3 w-3 shrink-0 transition-transform duration-500 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-[var(--text-primary)] flex items-center justify-center text-[var(--bg-primary)] shadow-2xl group-hover:scale-105 group-hover:bg-[var(--accent-primary)] transition-all duration-300 relative overflow-hidden border border-[var(--surface-border)]">
                                         <div className="absolute inset-x-0 bottom-0 h-2 bg-[var(--surface-tint)]" />
                                        <UserIcon className="h-6 w-6 shrink-0" />
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {isProfileOpen && (
                                    <div className="absolute top-full right-0 mt-5 w-72 animate-fade-in-up z-[130]">
                                        <div className="glass-card p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-[var(--border-color)] overflow-hidden !rounded-[2rem]">
                                            <div className="px-6 py-5 border-b border-[var(--surface-divider)] bg-[var(--surface-tint)] rounded-t-[1.5rem]">
                                                <p className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-[0.4em] mb-2 leading-relaxed">{t('auth_welcome')}</p>
                                                <p className="text-sm font-black text-[var(--text-primary)] truncate opacity-80 decoration-[var(--accent-primary)]/20 underline underline-offset-4 leading-relaxed">{user?.email}</p>
                                            </div>
                                            <div className="p-2 pt-4 space-y-2">
                                                <Link 
                                                    to="/student/settings" 
                                                    className="flex items-center gap-4 px-4 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--accent-primary)] transition-all group leading-relaxed"
                                                >
                                                    <Settings className="h-4 w-4 shrink-0 transition-transform group-hover:rotate-90" />
                                                    {t('nav_settings')}
                                                </Link>
                                                <button 
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-all group leading-relaxed"
                                                >
                                                    <LogOut className="h-4 w-4 shrink-0 group-hover:translate-x-1 transition-transform" />
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
                    <section className="flex-1 p-6 md:p-12 animate-fade-in relative overflow-x-hidden">
                        <Outlet />
                    </section>
                </main>
            </div>

            {/* Mobile Navigation */}
            <MobileFooterNav />

            {/* Mobile Updates Drawer */}
            <NotificationDrawer />

            {/* Mobile Settings Drawer */}
            <MobileSettingsDrawer />
        </div>
    );
};
