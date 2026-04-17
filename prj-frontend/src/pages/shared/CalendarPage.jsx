import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/axios";
import { 
    Calendar as CalendarIcon, 
    ArrowLeft, 
    Loader2,
    Layout
} from "lucide-react";
import SharedCalendar from '../../components/shared/SharedCalendar';
import { useTranslation } from "../../hooks/useTranslation";

export const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get("/dashboard/summary");
                setEvents(response.data.data.calendarEvents || []);
            } catch (error) {
                console.error("Calendar sync error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-vh-[80vh] p-8 text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-[var(--accent-primary)] opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] animate-pulse">{t('dashboard_syncing')}</p>
        </div>
    );

    return (
        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto min-h-screen animate-fade-in-up">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 md:mb-16">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate(-1)}
                        className="h-12 w-12 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all group"
                    >
                        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight italic flex items-center gap-3">
                            <CalendarIcon className="h-8 w-8 text-[var(--accent-primary)]" />
                            Scholastic <span className="text-[var(--accent-primary)]">Intelligence</span>
                        </h1>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-4 px-6 py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/20">
                    <Layout className="h-4 w-4 opacity-40" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Full Spectrum View</span>
                </div>
            </header>

            <main className="glass-card !p-0 overflow-hidden shadow-2xl border-none">
                <div className="p-4 md:p-8">
                     <SharedCalendar events={events} variant="full" />
                </div>
            </main>

            <footer className="mt-12 text-center">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20 italic">
                    All dates synchronized with centralized LMS protocol
                 </p>
            </footer>
        </div>
    );
};
