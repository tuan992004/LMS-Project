import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import logo from '../../assets/logo.png';

export const Navbar = () => {
    const [isCoursesOpen, setIsCoursesOpen] = useState(false);
    const { t } = useTranslation();

    return (
        <nav style={{ width: "100%", padding: "1rem 3rem", position: "relative", zIndex: 50 }}>
            <div
                style={{
                    maxWidth: "1280px",
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    alignItems: "center",
                    width: "100%",
                }}
            >
                {/* Logo */}
                <header style={{ display: "flex", justifyContent: "flex-start" }}>
                    <img src={logo} alt="The Academic Hood" style={{ height: "50px", objectFit: "contain" }} />
                </header>

                {/* Navigation Links */}
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', fontSize: '0.875rem', fontWeight: 500 }}>
                    <Link
                        to="/"
                        style={{ color: "black", textDecoration: "none", fontWeight: "bold" }}
                    >
                        {t('nav_home')}
                    </Link>
                    <Link
                        to="#"
                        style={{ color: "#374151", textDecoration: "none" }}
                    >
                        {t('nav_about')}
                    </Link>

                    {/* Courses Dropdown */}
                    <div
                        style={{ position: 'relative' }}
                        onMouseEnter={() => setIsCoursesOpen(true)}
                        onMouseLeave={() => setIsCoursesOpen(false)}
                        onBlur={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget)) {
                                setIsCoursesOpen(false);
                            }
                        }}
                    >
                        <Link
                            to="#"
                            style={{ color: "#374151", textDecoration: "none", display: 'flex', alignItems: 'center', gap: '4px' }}
                            aria-haspopup="true"
                            aria-expanded={isCoursesOpen}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setIsCoursesOpen(!isCoursesOpen);
                                }
                                if (e.key === 'Escape') {
                                    setIsCoursesOpen(false);
                                }
                            }}
                        >
                            {t('nav_courses_intro')}
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1L5 5L9 1" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>

                        {/* Dropdown Menu */}
                        {isCoursesOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                paddingTop: '1rem', // Invisible bridge
                                zIndex: 100,
                            }}>
                                <div style={{
                                    backgroundColor: 'white',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    borderRadius: '0.5rem',
                                    padding: '2rem',
                                    minWidth: '500px',
                                    border: '1px solid #f3f4f6',
                                    position: 'relative' // For the triangle
                                }}>
                                    {/* Triangle Pointer */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '-6px',
                                        left: '50%',
                                        transform: 'translateX(-50%) rotate(45deg)',
                                        width: '12px',
                                        height: '12px',
                                        backgroundColor: 'white',
                                        borderLeft: '1px solid #f3f4f6',
                                        borderTop: '1px solid #f3f4f6'
                                    }}></div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                                        {/* Left Column - Basic */}
                                        <div>
                                            <h4 style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1rem' }}>
                                                {t('nav_ielts_basic')}
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                <Link to="#" style={{ textDecoration: 'none', color: '#1f2937', fontSize: '0.875rem', fontWeight: 500 }} className="hover:text-black">{t('nav_pre_ielts')}</Link>
                                                <Link to="#" style={{ textDecoration: 'none', color: '#1f2937', fontSize: '0.875rem', fontWeight: 500 }} className="hover:text-black">{t('nav_ielts_4')}</Link>
                                                <Link to="#" style={{ textDecoration: 'none', color: '#1f2937', fontSize: '0.875rem', fontWeight: 500 }} className="hover:text-black">{t('nav_ielts_5')}</Link>
                                                <Link to="#" style={{ textDecoration: 'none', color: '#1f2937', fontSize: '0.875rem', fontWeight: 500 }} className="hover:text-black">{t('nav_ielts_6')}</Link>
                                            </div>
                                        </div>

                                        {/* Right Column - Advanced */}
                                        <div>
                                            <h4 style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1rem' }}>
                                                {t('nav_ielts_advanced')}
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                <Link to="#" style={{ textDecoration: 'none', color: '#1f2937', fontSize: '0.875rem', fontWeight: 500 }} className="hover:text-black">{t('nav_ielts_65')}</Link>
                                                <Link to="#" style={{ textDecoration: 'none', color: '#1f2937', fontSize: '0.875rem', fontWeight: 500 }} className="hover:text-black">{t('nav_ielts_7')}</Link>
                                                <Link to="#" style={{ textDecoration: 'none', color: '#1f2937', fontSize: '0.875rem', fontWeight: 500 }} className="hover:text-black">{t('nav_ielts_ws')}</Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Empty Spacer to balance the grid */}
                <div aria-hidden="true" />
            </div>
        </nav>
    );
};
