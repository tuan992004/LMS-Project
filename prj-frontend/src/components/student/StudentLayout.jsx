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

export const StudentLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);
    
    const { user, logOut } = useAuthStore((state) => state);
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { path: '/student', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/student/courses', label: 'My Courses', icon: BookOpen },
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
        <div className="flex min-h-screen font-sans text-[var(--text-primary)] transition-colors duration-300">
            {/* Sidebar for Desktop */}
            <aside
                onMouseEnter={() => setIsSidebarOpen(true)}
                onMouseLeave={() => setIsSidebarOpen(false)}
                className={`
                    fixed left-0 top-0 h-screen bg-[var(--nav-bg)] backdrop-blur-xl border-r border-[var(--border-color)] transition-all duration-300 ease-in-out z-50
                    ${isSidebarOpen ? 'w-72' : 'w-20'}
                    hidden lg:flex flex-col
                `}
            >
                {/* Sidebar Header */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-[var(--border-color)]">
                    {isSidebarOpen ? (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[var(--accent-primary)] rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <BookOpen className="text-white h-5 w-5" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-[var(--text-primary)]">STUDENT <span className="text-[var(--accent-primary)]">PORTAL</span></span>
                        </div>
                    ) : (
                        <div className="w-8 h-8 bg-[var(--accent-primary)] rounded-lg flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
                            <BookOpen className="text-white h-5 w-5" />
                        </div>
                    )}
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.label}
                                to={item.path}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                    ${isActive 
                                        ? 'bg-[var(--accent-primary)] !text-white shadow-lg font-semibold' 
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'}
                                    ${!isSidebarOpen && 'justify-center px-0'}
                                `}
                                title={!isSidebarOpen ? item.label : ''}
                            >
                                <item.icon className={`h-5 w-5 transition-colors ${isActive ? '!text-white' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`} />
                                {isSidebarOpen && <span className={`text-sm ${isActive ? '!text-white' : ''}`}>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar User Profile (Minimized version) */}
                <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
                    <div className={`flex items-center gap-3 p-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] ${!isSidebarOpen && 'justify-center'}`}>
                        <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center text-[var(--accent-primary)] shrink-0">
                            <UserIcon className="h-5 w-5" />
                        </div>
                        {isSidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[var(--text-primary)] truncate">{user?.fullname || 'Student'}</p>
                                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold">Student</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            <main 
                className={`
                    flex-1 flex flex-col min-h-screen transition-all duration-300
                    ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-20'}
                `}
            >
                {/* Top Navbar */}
                <header className="h-20 glass-nav sticky top-0 z-40 px-6 sm:px-10 flex items-center justify-between">
                    {/* Mobile Menu Toggle */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                        <Menu className="h-6 w-6 text-[var(--text-secondary)]" />
                    </button>

                    {/* Search Bar Placeholder */}
                    <div className="hidden md:flex items-center gap-3 bg-[var(--bg-secondary)] px-4 py-2 rounded-2xl w-full max-w-md border border-[var(--border-color)] group focus-within:bg-[var(--bg-primary)] focus-within:ring-2 focus-within:ring-[var(--accent-primary)] transition-all">
                        <Search className="h-4 w-4 text-[var(--text-secondary)]" />
                        <input 
                            type="text" 
                            placeholder="Find a course or lesson..." 
                            className="bg-transparent border-none outline-none text-sm w-full text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                        />
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <NotificationBell />

                        <div className="h-8 w-px bg-[var(--border-color)] mx-2 hidden sm:block" />

                        {/* Profile Dropdown Container */}
                        <div className="relative" ref={profileRef}>
                            <button 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className={`
                                    flex items-center gap-3 px-2 py-1.5 rounded-2xl transition-all cursor-pointer group
                                    ${isProfileOpen ? 'bg-[var(--bg-secondary)]' : 'hover:bg-[var(--bg-secondary)]'}
                                `}
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1">
                                        {user?.fullname || 'Student'}
                                    </p>
                                    <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold flex items-center justify-end gap-1">
                                        Student
                                        <ChevronDown className={`h-2.5 w-2.5 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-[var(--text-primary)] flex items-center justify-center text-[var(--bg-primary)] shadow-lg group-hover:scale-105 transition-transform duration-200">
                                    <UserIcon className="h-5 w-5" />
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute top-full right-0 mt-3 w-64 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="glass-card p-2 shadow-2xl border border-[var(--border-color)] overflow-hidden">
                                        <div className="px-4 py-3 border-b border-[var(--border-color)]">
                                            <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-40 mb-1">Account</p>
                                            <p className="text-sm font-bold text-[var(--text-primary)] truncate">{user?.email}</p>
                                        </div>
                                        <div className="p-1.5 space-y-1">
                                            <Link 
                                                to="/student/settings" 
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all group"
                                            >
                                                <Settings className="h-4 w-4 text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)]" />
                                                Account Settings
                                            </Link>
                                            <button 
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-all group"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content Viewport */}
                <div className="flex-1 p-6 sm:p-10">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm dark:bg-black/80" onClick={() => setIsMobileMenuOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-80 bg-[var(--nav-bg)] backdrop-blur-2xl shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 border-r border-[var(--border-color)]">
                        <div className="h-20 flex items-center justify-between px-6 border-b border-[var(--border-color)]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[var(--accent-primary)] rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <BookOpen className="text-white h-5 w-5" />
                                </div>
                                <span className="font-bold text-xl tracking-tight text-[var(--text-primary)]">STUDENT <span className="text-[var(--accent-primary)]">PORTAL</span></span>
                            </div>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <nav className="flex-1 py-6 px-4 space-y-1.5">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.label}
                                        to={item.path}
                                        className={`
                                            flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200
                                            ${isActive 
                                                ? 'bg-[var(--accent-primary)] !text-white shadow-lg font-semibold' 
                                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'}
                                        `}
                                    >
                                        <item.icon className={`h-5 w-5 ${isActive ? '!text-white' : 'text-[var(--text-secondary)]'}`} />
                                        <span className={`text-base ${isActive ? '!text-white' : ''}`}>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-6 border-t border-[var(--border-color)]">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all duration-200"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="font-semibold uppercase tracking-wider">Sign Out</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
};
