import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/axios';
import { Users, Mail, BookOpen, Loader2, Search, ExternalLink, Fingerprint, X, Filter } from 'lucide-react';
import { toast } from 'sonner';
import MobileListItem from '../../components/shared/MobileListItem';
import { useTranslation } from '../../hooks/useTranslation';
import StudentDossierModal from '../../components/shared/StudentDossierModal';

export const TeacherStudents = () => {
    const { t } = useTranslation();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedStudentId, setExpandedStudentId] = useState(null);
    const [isDossierOpen, setIsDossierOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [searchCriterion, setSearchCriterion] = useState('all'); // all, name, email, username
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const dropdownRef = React.useRef(null);

    const handleViewDossier = (id) => {
        setSelectedStudentId(id);
        setIsDossierOpen(true);
    };

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await api.get('/instructor/students');
                setStudents(res.data);
            } catch (error) {
                console.error(error);
                toast.error(t('alert_fetch_students_error'));
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [t]);

    const filteredStudents = students.filter(s => {
        const term = searchTerm.toLowerCase();
        if (!term) return true;

        if (searchCriterion === 'email') return s.email.toLowerCase().includes(term);
        if (searchCriterion === 'username') return s.username.toLowerCase().includes(term);
        if (searchCriterion === 'name') return s.fullname.toLowerCase().includes(term);

        return s.fullname.toLowerCase().includes(term) ||
               s.email.toLowerCase().includes(term) ||
               s.username.toLowerCase().includes(term);
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsFilterDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-[var(--accent-primary)] mb-4" />
            <p className="text-[var(--text-secondary)] font-bold animate-pulse uppercase tracking-widest text-xs">{t('student_dir_loading')}</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 p-4 sm:p-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                <div className="flex flex-1 items-center gap-4 w-full md:w-auto">
                    <Link 
                        to="/teacher"
                        className="h-12 w-12 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm shrink-0 hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all duration-300 group/header-icon"
                    >
                        <Users className="h-5 w-5 opacity-60 group-hover/header-icon:opacity-100 transition-opacity" strokeWidth={1.5} />
                    </Link>

                    {/* Search Bar */}
                    <div className="relative w-full md:max-w-md group/search">
                        <input 
                            type="text"
                            data-region="input"
                            data-action="search"
                            id="searchinput"
                            name="search"
                            autoComplete="off"
                            placeholder={
                                searchCriterion === 'email' ? "Search by email..." :
                                searchCriterion === 'username' ? "Search by username..." :
                                searchCriterion === 'name' ? "Search by name..." :
                                t('search_scholars') || "Search scholars..."
                            }
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-control withclear pl-6 focus:ring-4 focus:ring-[var(--accent-primary)]/10"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] opacity-40 hover:opacity-100 transition-all"
                            >
                                <X className="h-3 w-3" /> 
                            </button>
                        )}
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button 
                            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                            className={`
                                relative p-2.5 rounded-2xl transition-all duration-300 active:scale-90 shadow-lg shadow-black/10 flex items-center justify-center
                                ${isFilterDropdownOpen || searchCriterion !== 'all' 
                                    ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)] hover:opacity-90' 
                                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)]/40 hover:bg-[var(--bg-primary)]/40 hover:text-[var(--accent-primary)]'}
                            `}
                        >
                            <Filter className={`h-6 w-6 transition-transform duration-500 ${isFilterDropdownOpen ? 'rotate-12' : ''}`} />
                        </button>

                        {isFilterDropdownOpen && (
                            <div className="absolute top-full left-0 mt-3 z-[100] glass-card !p-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-[var(--border-color)] animate-in fade-in slide-in-from-top-2 duration-200 w-56">
                                <div className="space-y-1">
                                    {[
                                        { id: 'all', label: 'All Fields', icon: Search },
                                        { id: 'name', label: 'Name Only', icon: Users },
                                        { id: 'email', label: 'Email Only', icon: Mail },
                                        { id: 'username', label: 'Username Only', icon: Fingerprint }
                                    ].map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => {
                                                setSearchCriterion(option.id);
                                                setIsFilterDropdownOpen(false);
                                            }}
                                            className={`
                                                w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all
                                                ${searchCriterion === option.id 
                                                    ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)] shadow-md' 
                                                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-primary)]/50'}
                                            `}
                                        >
                                            <option.icon className={`h-4 w-4 ${searchCriterion === option.id ? 'opacity-100' : 'opacity-40'}`} />
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="space-y-6">
                {filteredStudents.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center glass-card border-dashed border-2 text-center">
                        <Users className="h-20 w-20 text-[var(--text-secondary)] opacity-10 mb-6" />
                        <p className="text-[var(--text-primary)] font-black uppercase tracking-widest text-sm">{t('student_none_found')}</p>
                        <p className="text-[var(--text-secondary)] text-sm mt-2 font-medium">{t('student_none_found_sub')}</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Grid View (≥ md) */}
                        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredStudents.map((student) => (
                                <div key={student.userid} className="group insta-card p-8 space-y-8 hover:border-[var(--accent-primary)]/30 transition-all active:scale-[0.98]">
                                    <div className="flex items-center gap-5">
                                        <div className="h-16 w-16 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center font-black text-2xl shadow-xl group-hover:bg-[var(--accent-primary)] transition-colors">
                                            {student.fullname.charAt(0)}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                                                {student.fullname}
                                            </h3>
                                            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                                                <Mail className="h-3 w-3 opacity-40" />
                                                {student.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-60">{t('status_active_enrollments')}</p>
                                            <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
                                                <BookOpen className="h-4 w-4 text-[var(--accent-primary)]" />
                                                <span>{student.course_count} {t('student_modules')}</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleViewDossier(student.userid)}
                                            className="h-12 w-12 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--accent-primary)] hover:text-[var(--bg-primary)] transition-all shadow-sm"
                                        >
                                            <ExternalLink className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Mobile Summary-to-Detail View (< md) */}
                        <div className="md:hidden divide-y divide-[var(--border-color)]/30">
                            {filteredStudents.map((student) => (
                                <MobileListItem
                                    key={student.userid}
                                    title={student.fullname}
                                    subtitle={`${student.course_count} ${t('dash_active')} ${t('student_modules')}`}
                                    avatar={student.fullname.charAt(0).toUpperCase()}
                                    isExpanded={expandedStudentId === student.userid}
                                    onToggle={() => setExpandedStudentId(expandedStudentId === student.userid ? null : student.userid)}
                                    actions={[
                                        {
                                            label: t('action_view_dossier'),
                                            icon: ExternalLink,
                                            onClick: () => handleViewDossier(student.userid),
                                            variant: 'primary'
                                        }
                                    ]}
                                >
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-1.5">
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40 italic flex items-center gap-2">
                                                <Mail className="h-3 w-3" /> {t('label_email_alt')}
                                            </span>
                                            <p className="font-bold text-[var(--text-primary)] break-all">{student.email}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40 italic flex items-center gap-2">
                                                    <Fingerprint className="h-3 w-3" /> {t('label_username')}
                                                </span>
                                                <p className="font-bold text-[var(--text-primary)]">@{student.username}</p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40 italic flex items-center gap-2">
                                                    <Users className="h-3 w-3" /> {t('label_scholar_id')}
                                                </span>
                                                <p className="font-bold text-[var(--text-primary)]">#{student.userid}</p>
                                            </div>
                                        </div>
                                    </div>
                                </MobileListItem>
                            ))}
                        </div>
                    </>
                )}
            </div>
            
            <StudentDossierModal 
                isOpen={isDossierOpen} 
                onClose={() => setIsDossierOpen(false)} 
                studentId={selectedStudentId} 
            />
        </div>
    );
};
