import React from 'react';
import { Calendar, Clock, BookOpen, ChevronRight, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const AssignmentCard = ({ assignment, onClick }) => {
  const { t } = useTranslation();
  
  const isOverdue = assignment.due_date && 
                    new Date(assignment.due_date) < new Date() && 
                    assignment.status === 'pending';

  const statusColors = {
    pending: isOverdue ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    submitted: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    late: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    graded: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  };

  return (
    <div 
      onClick={() => onClick(assignment.id)}
      className={`
        insta-card p-6 flex flex-col gap-6 cursor-pointer active:scale-[0.98] transition-all border
        ${isOverdue ? 'border-rose-500/30' : 'border-[var(--border-color)]'}
      `}
    >
      <div className="flex justify-between items-start">
        <div className="h-12 w-12 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)]">
          <BookOpen className="h-6 w-6" />
        </div>
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[assignment.status]}`}>
          {isOverdue ? t('assign_overdue') : t(`assign_status_${assignment.status}`)}
        </span>
      </div>

      <div className="space-y-2">
        <h4 className="text-xl font-bold text-[var(--text-primary)] leading-tight break-words">
          {assignment.title}
        </h4>
        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-40 italic">
          {assignment.course_title}
        </p>
      </div>

      <div className="pt-6 border-t border-[var(--border-color)] flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-40">
            {t('assign_due_date')}
          </span>
          <div className={`flex items-center gap-2 text-xs font-bold ${isOverdue ? 'text-rose-500' : 'text-[var(--text-primary)]'}`}>
            <Calendar className="h-3.5 w-3.5" />
            {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No Deadline'}
          </div>
        </div>
        <div className="h-10 w-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] shadow-inner">
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

export default AssignmentCard;
