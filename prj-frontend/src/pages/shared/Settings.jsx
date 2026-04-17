import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/userAuthStore';
import { api } from '../../lib/axios';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Loader2, 
  Save, 
  Sun, 
  Moon, 
  Globe,
  Settings as SettingsIcon,
  ShieldCheck
} from 'lucide-react';
import useThemeStore from '../../stores/useThemeStore';
import { useTranslation } from '../../hooks/useTranslation';
import useLanguageStore from '../../stores/useLanguageStore';
import { SettingRow } from '../../components/shared/SettingRow';
import { Input } from '../../components/ui/Input';

/**
 * Settings Page - Refactored for Overlap Prevention and Monochrome Inversion.
 * Standardizes layout using SettingRow and high-contrast Input component.
 */
export const Settings = () => {
    const { user, refresh } = useAuthStore((state) => state);
    const { theme, setTheme } = useThemeStore();
    const { language, setLanguage } = useLanguageStore();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        fullname: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setForm(prev => ({
                ...prev,
                fullname: user.fullname || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password && form.password !== form.confirmPassword) {
            toast.error(t('alert_error'));
            return;
        }

        setLoading(true);
        try {
            const dataToUpdate = {
                fullname: form.fullname,
                email: form.email,
            };
            if (form.password) {
                dataToUpdate.password = form.password;
            }

            await api.put('/users/profile/edit', dataToUpdate);
            toast.success(t('alert_success'));
            await refresh();
            setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || t('alert_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="p-4 md:p-8 lg:p-12 max-w-4xl mx-auto min-h-screen animate-fade-in" aria-labelledby="settings-title">
            <header className="mb-12 space-y-2">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-zinc-50 dark:text-black shadow-xl">
                        <SettingsIcon size={24} strokeWidth={1.5} className="shrink-0" />
                    </div>
                    <h1 id="settings-title" className="text-3xl md:text-5xl font-medium text-zinc-900 dark:text-zinc-300 tracking-tighter italic leading-relaxed">
                        {t('settings_title')}
                    </h1>
                </div>
                <p className="text-zinc-500 font-medium italic opacity-80 leading-relaxed max-w-2xl px-1">
                    {t('settings_subtitle')}
                </p>
            </header>

            <div className="space-y-12 pb-32">
                
                {/* 1. Interactive Summary Rows (The "Thumb-Reach" Hub) */}
                <section className="space-y-4" aria-label="Quick Preferences">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SettingRow 
                            icon={theme === 'light' ? Sun : Moon}
                            label={t('settings_appearance')}
                            value={theme === 'light' ? t('settings_mode_light') : t('settings_mode_dark')}
                            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        />
                        
                        <SettingRow 
                            icon={Globe}
                            label={t('settings_lang')}
                            value={language === 'en' ? t('settings_lang_en') : t('settings_lang_vi')}
                            onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
                        />
                    </div>
                </section>

                {/* 2. Comprehensive Configuration Form */}
                <section className="glass-card p-6 md:p-12 relative overflow-hidden bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-900 dark:bg-zinc-100 opacity-[0.02] rounded-full -mr-32 -mt-32 pointer-events-none" />
                    
                    <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
                        
                        {/* Personal Information */}
                        <div className="space-y-10">
                            <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                                <User className="h-5 w-5 text-zinc-900 dark:text-zinc-100 shrink-0" strokeWidth={1.5} />
                                <h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-300 italic">{t('settings_personal_info')}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <Input
                                    label={t('login_username_label')}
                                    value={user?.username || ''}
                                    disabled
                                    icon={ShieldCheck}
                                    className="bg-zinc-100/50 dark:bg-zinc-900/30"
                                />

                                <Input
                                    label={t('label_full_name')}
                                    name="fullname"
                                    value={form.fullname}
                                    onChange={handleChange}
                                    required
                                    icon={User}
                                />
                            </div>

                            <Input
                                label={t('label_email')}
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                icon={Mail}
                            />
                        </div>

                        {/* Security */}
                        <div className="space-y-10 pt-4">
                            <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                                <Lock className="h-5 w-5 text-zinc-900 dark:text-zinc-100 shrink-0" strokeWidth={1.5} />
                                <h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-300 italic">{t('settings_security')}</h2>
                            </div>

                            <div className="p-6 md:p-10 rounded-[2.5rem] bg-[var(--bg-secondary)] border border-zinc-200 dark:border-zinc-800 space-y-10">
                                <p className="text-xs text-zinc-500 font-medium italic leading-relaxed max-w-lg">
                                    Update your access credentials regularly. Leave fields blank to retain your current identity tokens.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <Input
                                        label={t('label_password')}
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder={t('placeholder_password')}
                                        icon={Lock}
                                    />

                                    <Input
                                        label={`${t('settings_security')}`}
                                        type="password"
                                        name="confirmPassword"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        placeholder={t('placeholder_password')}
                                        icon={Shield}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Footer */}
                        <div className="flex justify-end pt-8 border-t border-zinc-100 dark:border-zinc-900">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`
                                    flex items-center gap-3 px-10 h-16 rounded-2xl font-medium text-[10px] uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 italic
                                    ${loading 
                                        ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' 
                                        : 'bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-black hover:opacity-90'}
                                `}
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} />
                                ) : (
                                    <Save className="h-5 w-5" strokeWidth={1.5} />
                                )}
                                {loading ? t('settings_saving') : t('settings_save')}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
};
