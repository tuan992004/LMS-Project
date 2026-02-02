import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/userAuthStore';
import SignOut from '../auth/signout';
import { LayoutDashboard, Users, BookOpen, Settings, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

export const AdminLayout = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const { user, logOut } = useAuthStore((state) => state);
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/users', label: 'User Management', icon: Users },
        { path: '/admin/courses', label: 'Course Management', icon: BookOpen },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            {/* Sidebar */}
            <aside
                style={{
                    width: isExpanded ? '260px' : '80px',
                    backgroundColor: 'black',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    transition: 'width 0.3s ease',
                    zIndex: 50,
                    overflow: 'hidden', // Hide overflow text when collapsed
                    borderRight: '1px solid #1f2937'
                }}
            >
                {/* Header / Toggle */}
                <div style={{
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isExpanded ? 'space-between' : 'center',
                    marginBottom: '2rem',
                    minHeight: '80px'
                }}>
                    {isExpanded && (
                        <div>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>ADMIN</h1>
                            <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{user?.fullname || 'Administrator'}</p>
                        </div>
                    )}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        style={{
                            background: isExpanded ? '#16db41ff' : '#e20d0dff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white'
                        }}
                    >
                        {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 1rem' }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path; // Simple active check
                        return (
                            <Link
                                key={item.label}
                                to={item.path}
                                style={{
                                    textDecoration: 'none',
                                    color: isActive ? 'white' : '#9ca3af',
                                    backgroundColor: isActive ? '#374151' : 'transparent',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: isExpanded ? 'flex-start' : 'center',
                                    gap: '0.75rem',
                                    transition: 'colors 0.2s',
                                    whiteSpace: 'nowrap'
                                }}
                                className="hover:text-white hover:bg-gray-800"
                            >
                                <item.icon size={20} />
                                {isExpanded && <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer / Logout */}
                <div style={{ padding: '1.5rem', borderTop: '1px solid #1f2937' }}>
                    <div
                        onClick={() => {
                            logOut();
                            navigate('/login');
                        }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: isExpanded ? 'flex-start' : 'center', gap: '0.75rem', color: '#ef4444', cursor: 'pointer' }}
                    >
                        <LogOut size={20} />
                        {isExpanded && <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Sign Out</span>}
                    </div>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <main style={{
                flex: 1,
                marginLeft: isExpanded ? '260px' : '80px',
                transition: 'margin-left 0.3s ease',
                minHeight: '100vh',
                width: '100%' // Ensure full width
            }}>
                <Outlet />
            </main>
        </div>
    );
};
