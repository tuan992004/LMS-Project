import React from 'react';
import { CourseStatus, UserRole } from '../../types.js';

export const CourseCard = ({ course, role, onClick, actionButton }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case CourseStatus.APPROVED:
        return (
          <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-medium">
            Approved
          </span>
        );
      case CourseStatus.PENDING:
        return (
          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
            Pending Review
          </span>
        );
      case CourseStatus.REJECTED:
        return (
          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
            Rejected
          </span>
        );
      case CourseStatus.DRAFT:
        return (
          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
            Draft
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="group insta-card hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer flex flex-col h-full active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:outline-none"
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`Course: ${course.title}. Instructor: ${course.instructorName}. Category: ${course.category}.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />

        <div className="absolute top-4 right-4">
          <span className="bg-black/60 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-full font-black tracking-widest uppercase shadow-lg border border-white/10">
            {course.category}
          </span>
        </div>

        {(role === UserRole.TEACHER || role === UserRole.ADMIN) && (
          <div className="absolute top-4 left-4">
            {getStatusBadge(course.status)}
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-lg md:text-xl font-black text-[var(--text-primary)] mb-3 line-clamp-2 leading-relaxed group-hover:text-[var(--accent-primary)] transition-colors">
          {course.title}
        </h3>

        <p className="text-[var(--text-secondary)] text-sm font-semibold leading-relaxed line-clamp-2 mb-6 flex-1 opacity-100">
          {course.description}
        </p>

        <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-500/20 shrink-0">
            {course.instructorName.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-40 leading-none mb-1">Instructor</span>
            <span className="text-xs font-black text-[var(--text-primary)] truncate">
              {course.instructorName}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-5 border-t border-[var(--border-color)] group-hover:border-[var(--accent-primary)]/20 transition-colors mt-auto">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
            <i className="fa-regular fa-clock" aria-hidden="true"></i>
            <span>{course.lessons.length} Modules</span>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            {actionButton}
          </div>
        </div>
      </div>
    </div>
  );
};
