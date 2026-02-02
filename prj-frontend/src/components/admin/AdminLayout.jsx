import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/userAuthStore';
import SignOut from '../auth/signout';
import { LayoutDashboard, Users, BookOpen, Settings, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

export const AdminLayout = () => {
    const [isHovered, setIsHovered] = useState(false);
    const { user, logOut } = useAuthStore((state) => state);
    const location = useLocation();
    const navigate = useNavigate();

    const showSidebar = isHovered;

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/users', label: 'User Management', icon: Users },
        { path: '/admin/courses', label: 'Course Management', icon: BookOpen },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            {/* Sidebar */}
            <aside
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    width: showSidebar ? '260px' : '80px',
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
                    overflow: 'hidden',
                    borderRight: '1px solid #1f2937'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center', // Always center since no toggle button
                    marginBottom: '2rem',
                    minHeight: '80px'
                }}>
                    {showSidebar ? (
                        <div>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>ADMIN</h1>
                            <p style={{ color: '#9ca3af', fontSize: '1.0 rem' }}>{user?.fullname || 'Administrator'}</p>
                        </div>
                    ) : (
                        <div style={{ width: '32px', height: '32px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: 'bold' }}>
                            A
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 1rem' }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
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
                                    justifyContent: showSidebar ? 'flex-start' : 'center',
                                    gap: '0.75rem',
                                    transition: 'colors 0.2s',
                                    whiteSpace: 'nowrap'
                                }}
                                className="hover:text-white hover:bg-gray-800"
                            >
                                <item.icon size={20} />
                                {showSidebar && <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.label}</span>}
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
                        style={{ display: 'flex', alignItems: 'center', justifyContent: showSidebar ? 'flex-start' : 'center', gap: '0.75rem', color: '#ef4444', cursor: 'pointer' }}
                    >
                        <LogOut size={20} />
                        {showSidebar && <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Sign Out</span>}
                    </div>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <main style={{
                flex: 1,
                marginLeft: '80px', // Fixed margin
                transition: 'margin-left 0.3s ease',
                minHeight: '100vh',
                width: '100%'
            }}>
                <Outlet />
            </main>
        </div>
    );
};
