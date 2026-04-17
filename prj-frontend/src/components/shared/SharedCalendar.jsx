import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/userAuthStore';

const SharedCalendar = ({ events = [], className = "", variant = "full" }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [currentDate, setCurrentDate] = useState(new Date());

    const isMini = variant === "mini";
    const now = new Date();

    const upcomingEvent = [...events]
        .filter(ev => ev.due_date && new Date(ev.due_date) >= now)
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

    // Date calculations
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const prevMonth = (e) => {
        if (isMini) return;
        e?.stopPropagation();
        setCurrentDate(new Date(year, month - 1, 1));
    };
    
    const nextMonth = (e) => {
        if (isMini) return;
        e?.stopPropagation();
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const dayHeaders = isMini ? ["S", "M", "T", "W", "T", "F", "S"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Organize events by date - Robust mapping to handle ISO strings and Date objects
    const eventsByDate = events.reduce((acc, event) => {
        if (!event.due_date) return acc;
        
        // Ensure we always have a valid Date object
        const d = new Date(event.due_date);
        if (isNaN(d.getTime())) return acc;

        // Use a consistent key format (YYYY-M-D) regardless of timezone
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        
        if (!acc[key]) acc[key] = [];
        acc[key].push(event);
        return acc;
    }, {});

    const getTypeColor = (type) => {
        switch (type) {
            case 'homework': return 'bg-emerald-500';
            case 'test': return 'bg-rose-500';
            case 'session': return 'bg-amber-500';
            default: return 'bg-blue-500';
        }
    };

    const getTextColorClass = (type) => {
        switch (type) {
            case 'homework': return 'text-emerald-500';
            case 'test': return 'text-rose-500';
            case 'session': return 'text-amber-500';
            default: return 'text-blue-500';
        }
    };

    const isToday = (day) => {
        const today = new Date();
        return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
    };

    const handleEventClick = (e, event) => {
        if (!event) return;
        e.stopPropagation(); // Prevent parent clicks
        
        const role = user?.role;
        const { id, course_id, type } = event;
        
        if (type === 'session') {
            const lessonId = event.lesson_id || id;
            if (role === 'instructor') {
                navigate(`/teacher/course/${course_id}/lesson/${lessonId}`);
            } else if (role === 'student') {
                navigate(`/student/course/${course_id}`);
            } else {
                navigate(`/admin/lessons/${course_id}`);
            }
        } else {
            if (role === 'instructor') {
                navigate(`/teacher/course/${course_id}/assignment/${id}`);
            } else if (role === 'student') {
                navigate(`/student/assignment/${id}`);
            } else {
                navigate(`/admin/assignment/${id}`);
            }
        }
    };

    const handleCalendarClick = () => {
        if (!isMini) return;
        const base = user?.role === 'admin' ? '/admin' : user?.role === 'instructor' ? '/teacher' : '/student';
        navigate(`${base}/calendar`);
    };

    return (
        <div 
            onClick={handleCalendarClick}
            className={`
                insta-card bg-[var(--card-bg)] flex flex-col ${isMini ? '' : 'h-full'} shadow-2xl transition-all duration-500
                ${isMini ? 'p-6 hover:border-[var(--accent-primary)]/40 hover:scale-[1.02] cursor-pointer group/mini' : 'p-6 md:p-10'}
                ${className}
            `}
        >
            {/* Header */}
            <div className={`flex items-center justify-between ${isMini ? 'mb-4' : 'mb-8'}`}>
                <div className="flex items-center gap-3">
                    <div className={`rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center ${isMini ? 'p-1.5' : 'p-2'}`}>
                        <CalendarIcon className={isMini ? 'w-4 h-4' : 'w-5 h-5'} />
                    </div>
                    <div>
                        <h3 className={`${isMini ? 'text-sm' : 'text-lg'} font-black tracking-tight`}>{monthNames[month]} {year}</h3>
                        {!isMini && <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">{t('nav_dashboard')}</p>}
                    </div>
                </div>
                {!isMini ? (
                    <div className="flex gap-2">
                        <button onClick={prevMonth} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors border border-[var(--border-color)]/10">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors border border-[var(--border-color)]/10">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="opacity-0 group-hover/mini:opacity-100 transition-opacity">
                         <ArrowRight className="w-4 h-4 text-[var(--accent-primary)]" />
                    </div>
                )}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-visible">
                <div className={`grid grid-cols-7 ${isMini ? 'mb-2' : 'mb-4'}`}>
                    {dayHeaders.map((day, idx) => (
                        <div key={idx} className={`text-center font-black uppercase tracking-widest opacity-30 ${isMini ? 'text-[8px]' : 'text-[10px]'}`}>
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {/* Padding for first week */}
                    {[...Array(firstDayOfMonth)].map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-[1.4/1] opacity-0" />
                    ))}

                    {/* Actual Days */}
                    {[...Array(daysInMonth)].map((_, i) => {
                        const day = i + 1;
                        const dateKey = `${year}-${month}-${day}`;
                        const dayEvents = eventsByDate[dateKey] || [];
                        const today = isToday(day);

                        return (
                            <div 
                                key={day} 
                                onClick={(e) => dayEvents.length > 0 && handleEventClick(e, dayEvents[0])}
                                className={`
                                    group/day relative aspect-[1.4/1] rounded-lg border flex flex-col items-center justify-center transition-all duration-300
                                    ${today ? 'border-[var(--text-primary)] bg-[var(--text-primary)]/5' : 'border-[var(--border-color)]/5 hover:border-[var(--text-primary)]/30 hover:bg-[var(--bg-secondary)]/50'}
                                    ${dayEvents.length > 0 ? 'cursor-pointer' : ''}
                                `}
                            >
                                <span className={`${isMini ? 'text-[10px]' : 'text-xs md:text-sm'} font-bold ${today ? 'text-[var(--text-primary)]' : 'opacity-60'}`}>
                                    {day}
                                </span>
                                
                                {/* Inline Deadline Content */}
                                <div className="flex flex-col items-center mt-1.5 w-full px-1 overflow-hidden pointer-events-none">
                                    {dayEvents.length > 0 && (
                                        <span className={`text-[7px] md:text-[8px] font-black uppercase truncate w-full text-center tracking-tighter sm:tracking-normal ${getTextColorClass(dayEvents[0].type)}`}>
                                            {dayEvents[0].title}
                                        </span>
                                    )}
                                    {dayEvents.length > 1 && (
                                        <span className="text-[6px] font-black opacity-20 mt-0.5">+{dayEvents.length - 1}</span>
                                    )}
                                    {/* Traditional Dots as secondary indicator */}
                                    <div className="flex gap-0.5 mt-1">
                                        {dayEvents.slice(0, isMini ? 1 : 3).map((ev, idx) => (
                                            <div 
                                                key={idx} 
                                                className={`${isMini ? 'w-0.5 h-0.5' : 'w-1 h-1'} rounded-full ${getTypeColor(ev.type)} opacity-40`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Tooltip / Popover (Only in full mode) */}
                                {!isMini && dayEvents.length > 0 && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 glass-card bg-[var(--card-bg)] !rounded-2xl shadow-2xl z-50 pointer-events-none opacity-0 group-hover/day:opacity-100 transition-opacity translate-y-2 group-hover/day:translate-y-0 duration-300">
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-50 border-b border-[var(--border-color)]/20 pb-1">
                                            {day} {monthNames[month]}
                                        </p>
                                        <div className="space-y-2">
                                            {dayEvents.map((ev, idx) => (
                                                <div key={idx} className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${getTypeColor(ev.type)}`} />
                                                        <span className="text-[10px] font-bold truncate max-w-[140px]">{ev.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-40 pl-3">
                                                        <Clock className="w-2.5 h-2.5" />
                                                        <span className="text-[9px] font-medium">
                                                            {new Date(ev.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend - Always visible to provide context */}
            <div className={`${isMini ? 'mt-4 pt-4' : 'mt-8 pt-6'} border-t border-[var(--border-color)]/10 flex flex-wrap gap-4`}>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">{isMini ? 'Projects' : t('course_tab_assignments')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">Tests</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">Homework</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">Schedules</span>
                </div>
            </div>

            {/* Upcoming Task - Only in mini mode for immediate dashboard context */}
            {isMini && upcomingEvent && (
                <div className="mt-6 p-4 rounded-2xl bg-[var(--text-primary)]/[0.03] border border-[var(--border-color)]/10 group/task hover:border-[var(--accent-primary)]/30 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${getTypeColor(upcomingEvent.type)} shadow-[0_0_8px_currentColor]`} />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-30 italic">Next Deadline</span>
                    </div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)] truncate mb-1">{upcomingEvent.title}</h4>
                    <div className="flex items-center gap-2 text-[9px] font-medium opacity-40">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(upcomingEvent.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
            )}
            
            {isMini && (
                <div className="mt-4 flex items-center justify-center">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-20 group-hover/mini:opacity-60 group-hover/mini:text-[var(--accent-primary)] transition-all italic">
                        Expand Records
                    </span>
                </div>
            )}
        </div>
    );
};

export default SharedCalendar;
