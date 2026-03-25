import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema } from "../../type/userSchema";
import { User, Mail, Lock, Shield, Loader2 } from "lucide-react";
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
    <div className="p-12 min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-3xl p-12 w-full max-w-[500px] shadow-2xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Create New User
          </h2>
          <p className="text-gray-500 text-sm">
            Fill in the details below to add a new member to the system.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                {...register("fullname")}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all ${
                  errors.fullname
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 focus:border-black"
                }`}
                placeholder="John Doe"
              />
            </div>
            {errors.fullname && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.fullname.message}
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                {...register("username")}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all ${
                  errors.username
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 focus:border-black"
                }`}
                placeholder="johndoe123"
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                {...register("email")}
                type="email"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all ${
                  errors.email
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 focus:border-black"
                }`}
                placeholder="john@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                {...register("password")}
                type="password"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all ${
                  errors.password
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 focus:border-black"
                }`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Role
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                {...register("role")}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all appearance-none ${
                  errors.role
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 focus:border-black"
                }`}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {errors.role && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="flex-1 py-3.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3.5 rounded-xl bg-black text-white font-bold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all text-sm shadow-lg flex items-center justify-center gap-2"
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
