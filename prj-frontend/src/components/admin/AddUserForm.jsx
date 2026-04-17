import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema } from "../../type/userSchema";
import { User, Mail, Lock, Shield, Loader2, X } from "lucide-react";
import userService from "../../service/userService";
import { useTranslation } from "../../hooks/useTranslation";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export default function AddUserForm() {
  const { t } = useTranslation();
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
      toast.success(t('alert_provision_success'));
      navigate("/admin/users");
    } catch (error) {
      toast.error(error.response?.data?.message || t('alert_provision_error'));
    }
  };

  return (
    <div className="p-8 min-h-[calc(100vh-5rem)] flex items-center justify-center animate-fade-in-up">
      <div className="glass-card p-8 md:p-12 w-full max-w-[650px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-none relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)] opacity-[0.03] rounded-full -mr-32 -mt-32 transition-transform duration-[2000ms] group-hover:scale-125 pointer-events-none" />
        
        <button 
          onClick={() => navigate("/admin/users")}
          className="absolute right-6 top-6 h-10 w-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-rose-500 hover:text-white transition-all shadow-inner group/close z-10"
        >
          <X className="h-5 w-5 group-hover/close:rotate-90 transition-transform" />
        </button>

        <header className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-primary)]">{t('user_provisioning')}</h3>
            </div>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input
                label={t('label_full_name')}
                placeholder={t('placeholder_name')}
                icon={User}
                error={errors.fullname?.message}
                {...register("fullname")}
            />

            <Input
                label={t('label_username')}
                placeholder={t('placeholder_username')}
                icon={User}
                error={errors.username?.message}
                {...register("username")}
            />
          </div>

          <Input
            label={t('label_email')}
            type="email"
            placeholder={t('placeholder_email')}
            icon={Mail}
            error={errors.email?.message}
            {...register("email")}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input
                label={t('label_password')}
                type="password"
                placeholder={t('placeholder_password')}
                icon={Lock}
                error={errors.password?.message}
                {...register("password")}
            />

            <div className="space-y-2">
                <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">{t('label_role')}</label>
                <div className="relative group/input">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-5 w-5 opacity-40 group-focus-within/input:opacity-100 transition-opacity pointer-events-none" />
                    <select
                        {...register("role")}
                        className={`
                            w-full pl-12 pr-10 py-3.5 rounded-2xl border transition-all appearance-none text-[var(--text-primary)] font-bold 
                            bg-white/40 dark:bg-slate-900/40 backdrop-blur-md outline-none cursor-pointer
                            text-base md:text-sm leading-relaxed
                            ${errors.role ? "border-rose-500 bg-rose-500/5 ring-4 ring-rose-500/10" : "border-[var(--border-color)] focus:bg-white/60 focus:ring-4 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)]"}
                        `}
                    >
                        <option value="student">{t('role_student')}</option>
                        <option value="instructor">{t('role_instructor')}</option>
                        <option value="admin">{t('role_admin')}</option>
                    </select>
                </div>
                {errors.role && <p className="text-rose-500 text-[10px] font-bold mt-2 px-1 italic">{errors.role.message}</p>}
            </div>
          </div>

          <footer className="flex flex-col sm:flex-row gap-4 pt-10">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/admin/users")}
              className="flex-1 order-2 sm:order-1"
            >
              {t('user_abort')}
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              icon={Shield}
              className="flex-[2] order-1 sm:order-2"
            >
              {t('user_execute')}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
