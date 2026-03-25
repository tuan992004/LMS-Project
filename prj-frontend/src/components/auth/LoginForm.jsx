import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/userAuthStore";
import { User, Lock, ArrowRight, Loader2 } from "lucide-react";

const logInSchema = z.object({
  username: z.string().min(3, "Username phải có ít nhất 3 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export const LoginForm = () => {
  const logIn = useAuthStore((state) => state.logIn);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(logInSchema),
  });

  const onSubmit = async (data) => {
    try {
      const { username, password } = data;
      const user = await logIn(username, password);

      switch (user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "instructor":
          navigate("/instructor");
          break;
        case "student":
          navigate("/student");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass-card p-10 shadow-2xl relative overflow-hidden group">
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-80" />
      
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight mb-2">
            The Academic <span className="text-[var(--accent-primary)] italic">Hood</span>
        </h1>
        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-60">
            Login to your sanctuary
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2 px-1">
            Username
          </label>
          <div className="relative group/input">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-5 w-5 opacity-40 group-focus-within/input:opacity-100 transition-opacity" />
            <input
              type="text"
              placeholder="Enter your username"
              {...register("username")}
              className={`
                w-full pl-12 pr-4 py-4 rounded-2xl border transition-all text-[var(--text-primary)] font-medium
                bg-white/40 focus:bg-white/60 focus:ring-2 focus:ring-[var(--accent-primary)]/50 outline-none
                ${errors.username ? 'border-rose-500/50 bg-rose-500/5' : 'border-[var(--border-color)]'}
              `}
            />
          </div>
          {errors.username && (
            <p className="text-rose-500 text-[10px] font-bold mt-2 px-1 italic">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2 px-1">
            Password
          </label>
          <div className="relative group/input">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-5 w-5 opacity-40 group-focus-within/input:opacity-100 transition-opacity" />
            <input
              type="password"
              placeholder="Enter your password"
              {...register("password")}
              className={`
                w-full pl-12 pr-4 py-4 rounded-2xl border transition-all text-[var(--text-primary)] font-medium
                bg-white/40 focus:bg-white/60 focus:ring-2 focus:ring-[var(--accent-primary)]/50 outline-none
                ${errors.password ? 'border-rose-500/50 bg-rose-500/5' : 'border-[var(--border-color)]'}
              `}
            />
          </div>
          {errors.password && (
            <p className="text-rose-500 text-[10px] font-bold mt-2 px-1 italic">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest text-xs
            transition-all shadow-xl active:scale-[0.98] mt-8
            ${isSubmitting 
              ? 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] cursor-not-allowed' 
              : 'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90'}
          `}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              Access Library
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      {/* Decorative background element */}
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[var(--accent-primary)] opacity-5 rounded-full blur-3xl pointer-events-none group-hover:opacity-10 transition-opacity" />
    </div>
  );
};
