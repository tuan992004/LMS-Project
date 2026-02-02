import React, { useState } from "react";
import { LoginForm } from "../components/auth/login-from";
import { Navbar } from "../components/common/Navbar";
import axios from "axios";

export const LoginPage = ({ onLogin }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "#FAFAFA",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Navbar />

      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ width: "100%", maxWidth: "450px" }}>
          <LoginForm />
        </div>
      </main>
    </div>
  );
};

