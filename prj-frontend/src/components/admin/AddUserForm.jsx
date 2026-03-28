import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema } from "../../type/userSchema";
import { User, Mail, Lock, Shield, Loader2, X } from "lucide-react";
import userService from "../../service/userService";

export default function AddUserForm() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullname: "",
      username: "",
      email: "",
      password: "",
      role: "student",
    },
  });

  const onSubmit = async (data) => {
    try {
      await userService.addUser(data);
      toast.success("Identity Provisioned successfully!");
      navigate("/admin/users");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to provision identity");
    }
  };

  return (
    <div className="p-8 min-h-[calc(100vh-5rem)] flex items-center justify-center animate-fade-in-up">
      <div className="glass-card p-12 w-full max-w-[550px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-none relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)] opacity-[0.03] rounded-full -mr-32 -mt-32 transition-transform duration-[2000ms] group-hover:scale-125" />
        
        <button 
          onClick={() => navigate("/admin/users")}
          className="absolute right-8 top-8 h-10 w-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-rose-500 hover:text-white transition-all shadow-inner group/close"
        >
          <X className="h-5 w-5 group-hover/close:rotate-90 transition-transform" />
        </button>

        <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-[var(--accent-primary)] flex items-center justify-center text-white shadow-lg">
                    <UserPlus className="h-6 w-6" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-primary)]">Identity Provisioning</h3>
            </div>
          <h2 className="text-4xl font-black text-[var(--text-primary)] tracking-tight italic">
            New <span className="text-[var(--accent-primary)]">Scholar</span> Record
          </h2>
          <p className="text-[var(--text-secondary)] mt-3 font-medium italic opacity-80 decoration-[var(--accent-primary)]/10 underline underline-offset-8">
            Ghi danh thành viên mới vào hệ sinh thái Lumina.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60 ml-1">Legal Full Name</label>
                <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-4 w-4 opacity-40 group-focus-within:opacity-100 group-focus-within:text-[var(--accent-primary)] transition-all" />
                    <input
                        {...register("fullname")}
                        placeholder="e.g. Nicolaus Copernicus"
                        className={`w-full pl-14 pr-6 py-4 rounded-3xl border transition-all text-[var(--text-primary)] font-medium bg-white/5 focus:bg-white/10 outline-none ${
                        errors.fullname ? "border-rose-500 focus:ring-4 focus:ring-rose-500/10" : "border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10"
                        }`}
                    />
                </div>
                {errors.fullname && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-4">{errors.fullname.message}</p>}
            </div>

            <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60 ml-1">Identity Alias</label>
                <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-4 w-4 opacity-40 group-focus-within:opacity-100 group-focus-within:text-[var(--accent-primary)] transition-all" />
                    <input
                        {...register("username")}
                        placeholder="e.g. copernicus_99"
                        className={`w-full pl-14 pr-6 py-4 rounded-3xl border transition-all text-[var(--text-primary)] font-medium bg-white/5 focus:bg-white/10 outline-none ${
                        errors.username ? "border-rose-500 focus:ring-4 focus:ring-rose-500/10" : "border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10"
                        }`}
                    />
                </div>
                {errors.username && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-4">{errors.username.message}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-4 w-4 opacity-40 group-focus-within:opacity-100 group-focus-within:text-[var(--accent-primary)] transition-all" />
              <input
                {...register("email")}
                type="email"
                placeholder="university@lumina.edu"
                className={`w-full pl-14 pr-6 py-4 rounded-3xl border transition-all text-[var(--text-primary)] font-medium bg-white/5 focus:bg-white/10 outline-none ${
                  errors.email ? "border-rose-500 focus:ring-4 focus:ring-rose-500/10" : "border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10"
                }`}
              />
            </div>
            {errors.email && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-4">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60 ml-1">Access Token</label>
                <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-4 w-4 opacity-40 group-focus-within:opacity-100 group-focus-within:text-[var(--accent-primary)] transition-all" />
                <input
                    {...register("password")}
                    type="password"
                    placeholder="••••••••"
                    className={`w-full pl-14 pr-6 py-4 rounded-3xl border transition-all text-[var(--text-primary)] font-medium bg-white/5 focus:bg-white/10 outline-none ${
                    errors.password ? "border-rose-500 focus:ring-4 focus:ring-rose-500/10" : "border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10"
                    }`}
                />
                </div>
                {errors.password && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-4">{errors.password.message}</p>}
            </div>

            <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60 ml-1">Hierarchy Role</label>
                <div className="relative group">
                <Shield className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-4 w-4 opacity-40 group-focus-within:opacity-100 group-focus-within:text-[var(--accent-primary)] transition-all pointer-events-none" />
                <select
                    {...register("role")}
                    className={`w-full pl-14 pr-10 py-4 rounded-3xl border transition-all appearance-none text-[var(--text-primary)] font-bold bg-white/5 focus:bg-white/10 outline-none cursor-pointer ${
                    errors.role ? "border-rose-500 focus:ring-4 focus:ring-rose-500/10" : "border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10"
                    }`}
                >
                    <option value="student">Academic Personnel</option>
                    <option value="instructor">Pedagogical Expert</option>
                    <option value="admin">System Custodian</option>
                </select>
                </div>
                {errors.role && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-4">{errors.role.message}</p>}
            </div>
          </div>

          <div className="flex gap-6 pt-10">
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="flex-1 py-5 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--border-color)] transition-all active:scale-95 shadow-inner"
            >
              Abort Protocol
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] py-5 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl active:scale-95 hover:opacity-95 flex items-center justify-center gap-3 group"
            >
              {isSubmitting ? (
                 <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                    <Shield className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    Execute Provisioning
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
