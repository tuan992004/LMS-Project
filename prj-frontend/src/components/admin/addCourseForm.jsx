import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../service/courseService";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/userAuthStore";

export default function AddCourseForm() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cancelPath = user?.role === 'admin' ? '/admin/courses' : '/instructor/courses';
  const successPath = user?.role === 'admin' ? '/admin/courses' : '/instructor/courses';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await courseService.createCourse(form);
      toast.success("Thêm khóa học mới thành công!");
      navigate(successPath);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tạo khóa học");
    }
  };

  return (
    <div className="glass-card max-w-2xl mx-auto my-12 p-10">
      <h2 className="text-3xl font-black text-[var(--text-primary)] mb-8 tracking-tight">
        Tạo khóa học mới
      </h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
            Tên khóa học
          </label>
          <input 
            name="title" 
            placeholder="Ví dụ: Lập trình ReactJS cơ bản" 
            onChange={handleChange} 
            required 
            className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-white/40 focus:bg-white/60 focus:ring-2 focus:ring-[var(--accent-primary)] outline-none transition-all text-[var(--text-primary)]"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
            Mô tả khóa học
          </label>
          <textarea 
            name="description" 
            placeholder="Nhập mô tả chi tiết nội dung khóa học..." 
            onChange={handleChange} 
            rows="5"
            className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-white/40 focus:bg-white/60 focus:ring-2 focus:ring-[var(--accent-primary)] outline-none transition-all text-[var(--text-primary)]"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="button" 
            onClick={() => navigate(cancelPath)}
            className="flex-1 py-4 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold hover:opacity-80 transition-all active:scale-95"
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className="flex-[2] py-4 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold hover:opacity-90 transition-all shadow-xl active:scale-95"
          >
            Lưu khóa học
          </button>
        </div>
      </form>
    </div>
  );
}