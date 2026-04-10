import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../service/courseService";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/userAuthStore";
import { Save, X, BookOpen, FileText, Sparkles, PlusCircle } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

export default function AddCourseForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    title: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cancelPath = user?.role === 'admin' ? '/admin/courses' : '/teacher/courses';
  const successPath = user?.role === 'admin' ? '/admin/courses' : '/teacher/courses';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await courseService.createCourse(form);
      toast.success(t('alert_course_create_success'), {
        description: t('alert_course_create_success_sub')
      });
      navigate(successPath);
    } catch (error) {
      toast.error(error.response?.data?.message || t('alert_course_create_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-12 animate-fade-in-up">
      <div className="glass-card p-12 relative overflow-hidden group shadow-2xl border-none">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)] opacity-[0.03] rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />
        
        <header className="relative z-10 mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] shadow-inner">
              <PlusCircle className="h-6 w-6" />
            </div>
            <h2 className="text-4xl font-black text-[var(--text-primary)] tracking-tight italic">
              {t('course_add_title')}
            </h2>
          </div>
          <p className="text-[var(--text-secondary)] font-medium text-lg italic opacity-80 leading-relaxed">
            {t('course_add_subtitle')}
          </p>
        </header>
        
        <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-60 ml-1">
              <BookOpen className="h-3 w-3" />
              {t('course_label_title')}
            </label>
            <input 
              name="title" 
              placeholder={t('course_place_title')} 
              onChange={handleChange} 
              required 
              className="w-full px-6 py-5 rounded-2xl border border-[var(--border-color)] bg-white/5 focus:bg-white/10 focus:ring-4 focus:ring-[var(--accent-primary)]/20 outline-none transition-all text-xl font-bold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/30 placeholder:italic"
            />
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-60 ml-1">
              <FileText className="h-3 w-3" />
              {t('course_label_desc')}
            </label>
            <textarea 
              name="description" 
              placeholder={t('course_place_desc')} 
              onChange={handleChange} 
              rows="6"
              required
              className="w-full px-6 py-5 rounded-2xl border border-[var(--border-color)] bg-white/5 focus:bg-white/10 focus:ring-4 focus:ring-[var(--accent-primary)]/20 outline-none transition-all text-lg font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/30 placeholder:italic leading-relaxed resize-none"
            />
          </div>

          <div className="flex items-center justify-between gap-6 pt-10 border-t border-[var(--border-color)]/50">
            <button 
              type="button" 
              onClick={() => navigate(cancelPath)}
              className="px-8 py-5 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--border-color)] transition-all active:scale-95 flex items-center gap-2 shadow-inner"
            >
              <X className="h-4 w-4" />
              {t('course_action_cancel')}
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn-primary !px-12 !py-5 text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('course_action_saving')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  {t('course_action_save')}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-12 p-6 rounded-2xl bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/10 flex items-start gap-4">
          <Sparkles className="h-6 w-6 text-[var(--accent-primary)] shrink-0 mt-1 opacity-60" />
          <p className="text-xs font-medium italic text-[var(--text-secondary)] leading-relaxed">
            <span className="text-[var(--text-primary)] font-bold">{t('course_tip_title')}</span> {t('course_tip_desc')}
          </p>
        </div>
      </div>
    </div>

  );
}