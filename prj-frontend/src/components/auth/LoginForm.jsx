import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/userAuthStore";
import { User, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export const LoginForm = () => {
    const { t } = useTranslation();
    const logIn = useAuthStore((state) => state.logIn);
    const navigate = useNavigate();

    const logInSchema = z.object({
        username: z.string().min(3, t('login_error_user_min')),
        password: z.string().min(6, t('login_error_pass_min')),
    });

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
                case "admin": navigate("/admin"); break;
                case "instructor": navigate("/teacher"); break;
                case "student": navigate("/student"); break;
                default: navigate("/");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="glass-card p-10 shadow-2xl relative overflow-hidden group">
            <div className="mb-10 text-center animate-fade-in-up">
                <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight mb-2">
                    The Academic <span className="text-[var(--accent-primary)] italic">Hood</span>
                </h1>
                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-60">
                    {t('login_subtitle')}
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                    label={t('login_username_label')}
                    placeholder={t('login_username_placeholder')}
                    icon={User}
                    error={errors.username?.message}
                    {...register("username")}
                />

                <Input
                    label={t('login_password_label')}
                    placeholder={t('login_password_placeholder')}
                    type="password"
                    icon={Lock}
                    error={errors.password?.message}
                    {...register("password")}
                />

                <Button
                    type="submit"
                    isLoading={isSubmitting}
                    icon={ArrowRight}
                    className="w-full mt-8"
                >
                    {isSubmitting ? t('login_btn_authenticating') : t('login_btn_access')}
                </Button>
            </form>
        </div>
    );
};
