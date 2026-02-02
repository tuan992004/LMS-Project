import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/userAuthStore";


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
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "1rem",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        overflow: "hidden",
        margin: "0 auto",
        border: "1px solid #e5e7eb",
        width: "100%",
        maxWidth: "28rem",
      }}
    >
      <div style={{ backgroundColor: "black", padding: "2rem", textAlign: "center" }}>
        <h1
          style={{
            fontSize: "1.875rem",
            fontWeight: "bold",
            color: "white",
            letterSpacing: "-0.025em",
            margin: 0,
          }}
        >
          The Academic Hood
        </h1>
        <p
          style={{
            color: "#9ca3af",
            marginTop: "0.5rem",
            fontSize: "0.875rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Login to your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "bold",
              color: "#111827",
              marginBottom: "0.25rem",
            }}
          >
            Username
          </label>
          <input
            type="text"
            placeholder="Enter your username"
            {...register("username")}
            style={{
              width: "100%",
              backgroundColor: "white",
              color: "black",
              border: "2px solid #d1d5db",
              borderRadius: "0.375rem",
              padding: "0.75rem",
              boxSizing: "border-box",
            }}
          />
          {errors.username && (
            <p style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem", fontWeight: 500 }}>
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "bold",
              color: "#111827",
              marginBottom: "0.25rem",
            }}
          >
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            {...register("password")}
            style={{
              width: "100%",
              backgroundColor: "white",
              color: "black",
              border: "2px solid #d1d5db",
              borderRadius: "0.375rem",
              padding: "0.75rem",
              boxSizing: "border-box",
            }}
          />
          {errors.password && (
            <p style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem", fontWeight: 500 }}>
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            backgroundColor: "black",
            color: "white",
            paddingTop: "0.75rem",
            paddingBottom: "0.75rem",
            borderRadius: "0.375rem",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontSize: "0.875rem",
            border: "none",
            cursor: "pointer",
            opacity: isSubmitting ? 0.5 : 1,
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#374151")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "black")}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};