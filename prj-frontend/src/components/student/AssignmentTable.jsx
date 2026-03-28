import React from 'react';
import { Calendar, BookOpen, ChevronRight, FileText } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const AssignmentTable = ({ assignments, onRowClick }) => {
  const { t } = useTranslation();

  const getStatusStyle = (assignment) => {
    const isOverdue = assignment.due_date && 
                      new Date(assignment.due_date) < new Date() && 
                      assignment.status === 'pending';
                      
    if (isOverdue) return 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]';
    
    const styles = {
      pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      submitted: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      late: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      graded: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    };
    return styles[assignment.status] || styles.pending;
  };

  const isOverdue = (date) => date && new Date(date) < new Date();

  return (
    <div className="overflow-x-auto glass-card border-none shadow-2xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-color)]">
            <th className="px-10 py-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-60">
              {t('assign_title')}
            </th>
            <th className="px-10 py-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-60 text-center">
              {t('assign_course')}
            </th>
            <th className="px-10 py-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-60 text-center">
              {t('assign_due_date')}
            </th>
            <th className="px-10 py-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-60 text-center">
              Status
            </th>
            <th className="px-10 py-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-60 text-right">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-color)] bg-white/5">
          {assignments.map((assignment) => {
            const overdue = isOverdue(assignment.due_date) && assignment.status === 'pending';
            return (
              <tr 
                key={assignment.id} 
                onClick={() => onRowClick(assignment.id)}
                className="hover:bg-[var(--accent-primary)]/[0.02] transition-all cursor-pointer group"
              >
                <td className="px-10 py-8">
                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center group-hover:bg-[var(--accent-primary)] transition-all duration-500 shadow-lg">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 max-w-xs">
                      <div className="font-bold text-[var(--text-primary)] text-lg leading-tight truncate">
                        {assignment.title}
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest opacity-40 italic">
                        {assignment.course_title}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8 text-center">
                   <span className="text-xs font-bold text-[var(--text-secondary)]">
                     {assignment.course_title}
                   </span>
                </td>
                <td className="px-10 py-8 text-center">
                  <div className={`flex items-center justify-center gap-2 text-xs font-bold ${overdue ? 'text-rose-500' : 'text-[var(--text-secondary)]'}`}>
                    <Calendar className="h-4 w-4 opacity-40" />
                    {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : '—'}
                  </div>
                </td>
                <td className="px-10 py-8 text-center">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(assignment)}`}>
                    {overdue ? t('assign_overdue') : t(`assign_status_${assignment.status}`)}
                  </span>
                </td>
                <td className="px-10 py-8 text-right">
                  <button className="h-10 w-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all shadow-sm active:scale-95">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AssignmentTable;
