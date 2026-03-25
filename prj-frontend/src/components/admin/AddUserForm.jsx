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
      toast.success("User added successfully!");
      navigate("/admin/users");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add user");
    }
  };

  return (
    <div className="p-8 min-h-[calc(100vh-5rem)] flex items-center justify-center">
      <div className="insta-card p-10 w-full max-w-[500px] shadow-2xl relative overflow-hidden">
        <button 
          onClick={() => navigate("/admin/users")}
          className="absolute right-6 top-6 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black text-[var(--text-primary)] mb-2 tracking-tight">
            Create New User
          </h2>
          <p className="text-[var(--text-secondary)] text-sm font-medium">
            Add a new member to the Lumina ecosystem.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2 text-[var(--text-secondary)]">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-5 w-5" />
              <input
                {...register("fullname")}
                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-all text-[var(--text-primary)] bg-white/40 focus:bg-white/60 ${
                  errors.fullname
                    ? "border-red-500 bg-red-50/10"
                    : "border-[var(--border-color)] focus:border-[var(--accent-primary)]"
                }`}
                placeholder="John Doe"
              />
            </div>
            {errors.fullname && (
              <p className="text-red-500 text-xs mt-2 font-medium">
                {errors.fullname.message}
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2 text-[var(--text-secondary)]">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-5 w-5" />
              <input
                {...register("username")}
                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-all text-[var(--text-primary)] bg-white/40 focus:bg-white/60 ${
                  errors.username
                    ? "border-red-500 bg-red-50/10"
                    : "border-[var(--border-color)] focus:border-[var(--accent-primary)]"
                }`}
                placeholder="johndoe123"
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-xs mt-2 font-medium">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2 text-[var(--text-secondary)]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-5 w-5" />
              <input
                {...register("email")}
                type="email"
                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-all text-[var(--text-primary)] bg-white/40 focus:bg-white/60 ${
                  errors.email
                    ? "border-red-500 bg-red-50/10"
                    : "border-[var(--border-color)] focus:border-[var(--accent-primary)]"
                }`}
                placeholder="john@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-2 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2 text-[var(--text-secondary)]">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-5 w-5" />
              <input
                {...register("password")}
                type="password"
                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-all text-[var(--text-primary)] bg-white/40 focus:bg-white/60 ${
                  errors.password
                    ? "border-red-500 bg-red-50/10"
                    : "border-[var(--border-color)] focus:border-[var(--accent-primary)]"
                }`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-2 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2 text-[var(--text-secondary)]">
              Role
            </label>
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-5 w-5" />
              <select
                {...register("role")}
                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-all appearance-none text-[var(--text-primary)] bg-white/40 focus:bg-white/60 ${
                  errors.role
                    ? "border-red-500 bg-red-50/10"
                    : "border-[var(--border-color)] focus:border-[var(--accent-primary)]"
                }`}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {errors.role && (
              <p className="text-red-500 text-xs mt-2 font-medium">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="flex-1 py-4 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold hover:opacity-80 transition-all text-sm active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold hover:opacity-90 disabled:opacity-50 transition-all text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
