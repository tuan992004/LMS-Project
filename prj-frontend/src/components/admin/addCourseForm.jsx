import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../service/courseService";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/userAuthStore";
import { Save, X, BookOpen, FileText, Sparkles, PlusCircle } from "lucide-react";

export default function AddCourseForm() {
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
      toast.success("Khởi tạo học phần thành công!", {
        description: "Khóa học đã được thêm vào hệ thống lưu trữ."
      });
      navigate(successPath);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi cấu trúc học phần");
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
              New <span className="text-[var(--accent-primary)]">Curriculum</span>
            </h2>
          </div>
          <p className="text-[var(--text-secondary)] font-medium text-lg italic opacity-80 leading-relaxed">
            Thiết kế lộ trình học thuật mới. Hãy bắt đầu với những thông tin cơ bản nhất.
          </p>
        </header>
        
        <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-60 ml-1">
              <BookOpen className="h-3 w-3" />
              Tên khóa học / Course Title
            </label>
            <input 
              name="title" 
              placeholder="Ví dụ: Advanced Quantum Computing 2024..." 
              onChange={handleChange} 
              required 
              className="w-full px-6 py-5 rounded-2xl border border-[var(--border-color)] bg-white/5 focus:bg-white/10 focus:ring-4 focus:ring-[var(--accent-primary)]/20 outline-none transition-all text-xl font-bold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/30 placeholder:italic"
            />
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-60 ml-1">
              <FileText className="h-3 w-3" />
              Mô tả chi tiết / Academic Abstract
            </label>
            <textarea 
              name="description" 
              placeholder="Trình bày mục tiêu đào tạo, đối tượng hướng tới và kết quả đầu ra dự kiến..." 
              onChange={handleChange} 
              rows="6"
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
              Huỷ bỏ
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn-primary !px-12 !py-5 text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  Lưu học phần mới
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-12 p-6 rounded-2xl bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/10 flex items-start gap-4">
          <Sparkles className="h-6 w-6 text-[var(--accent-primary)] shrink-0 mt-1 opacity-60" />
          <p className="text-xs font-medium italic text-[var(--text-secondary)] leading-relaxed">
            <span className="text-[var(--text-primary)] font-bold">Pro Tip:</span> Một mô tả khóa học chi tiết và rõ ràng giúp tăng tỷ lệ học viên tham gia học tập lên tới 40%. Đừng quên cập nhật giáo trình sau khi tạo xong học phần này.
          </p>
        </div>
      </div>
    </div>
  );
}