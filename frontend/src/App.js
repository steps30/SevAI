import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Complaint from "./pages/Complaint";
import Dashboard from "./pages/Dashboard";
import TrackComplaint from "./pages/TrackComplaint";
import MyProfile from "./pages/MyProfile";
import LoginRoleSelect from "./pages/LoginRoleSelect";
import AdminPanel from "./pages/AdminPanel";
import MyComplaints from "./pages/MyComplaints"; // ADDED THIS IMPORT
import { LanguageProvider } from "./context/LanguageContext";

function ProtectedRoute({ isLoggedIn, selectedRole, allowedRoles, children }) {
  if (!isLoggedIn) {
    return <Navigate to="/role-select" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(selectedRole)) {
    return <Navigate to={selectedRole === "admin" ? "/admin" : "/"} replace />;
  }

  return children;
}

function App() {
  // BUG FIX: Read from localStorage so the user stays logged in if they refresh the page!
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("isLoggedIn") === "true");

  const [selectedRole, setSelectedRole] = useState(() => localStorage.getItem("loginRole") || "");
  const [adminDepartment, setAdminDepartment] = useState(() => localStorage.getItem("adminDepartment") || "");
  const [adminId, setAdminId] = useState(() => localStorage.getItem("adminId") || "");
  const [currentUserEmail, setCurrentUserEmail] = useState(() => localStorage.getItem("currentUserEmail") || "");
  const [currentUserName, setCurrentUserName] = useState(() => localStorage.getItem("currentUserName") || "");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Sync isLoggedIn state to localStorage whenever it changes
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem("isLoggedIn", "true");
    } else {
      localStorage.removeItem("isLoggedIn");
    }
  }, [isLoggedIn]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    localStorage.setItem("loginRole", role);

    if (role !== "admin") {
      setAdminDepartment("");
      setAdminId("");
      localStorage.removeItem("adminDepartment");
      localStorage.removeItem("adminId");
    }
  };

  const handleRoleReset = () => {
    setSelectedRole("");
    setAdminDepartment("");
    setAdminId("");
    setCurrentUserEmail("");
    setCurrentUserName("");
    localStorage.removeItem("loginRole");
    localStorage.removeItem("adminDepartment");
    localStorage.removeItem("adminId");
    localStorage.removeItem("currentUserEmail");
    localStorage.removeItem("currentUserName");
  };

  return (
    <LanguageProvider>
      <Router>
        {/* Show Navbar only after login */}
        {isLoggedIn && <Navbar theme={theme} setTheme={setTheme} selectedRole={selectedRole} />}

        <Routes>
          {/* Default Route */}
          <Route
            path="/"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn} selectedRole={selectedRole}>
                {selectedRole === "admin" ? <Navigate to="/admin" replace /> : <Home />}
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn} selectedRole={selectedRole} allowedRoles={["admin"]}>
                <AdminPanel adminDepartment={adminDepartment} adminId={adminId} />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/complaint"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn} selectedRole={selectedRole} allowedRoles={["user"]}>
                <Complaint />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn} selectedRole={selectedRole} allowedRoles={["user"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/track"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn} selectedRole={selectedRole} allowedRoles={["user"]}>
                <TrackComplaint />
              </ProtectedRoute>
            }
          />

          {/* ADDED THE MY COMPLAINTS ROUTE */}
          <Route
            path="/my-complaints"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn} selectedRole={selectedRole} allowedRoles={["user"]}>
                <MyComplaints />
              </ProtectedRoute>
            }
          />

          {/* Role Select Route */}
          <Route
            path="/role-select"
            element={
              isLoggedIn
                ? <Navigate to={selectedRole === "admin" ? "/admin" : "/"} replace />
                : <LoginRoleSelect onSelectRole={handleRoleSelect} />
            }
          />

          {/* Login Route */}
          <Route
            path="/login"
            element={
              isLoggedIn
                ? <Navigate to={selectedRole === "admin" ? "/admin" : "/"} replace />
                : selectedRole
                  ? <Login
                    setIsLoggedIn={setIsLoggedIn}
                    selectedRole={selectedRole}
                    onChangeRole={handleRoleReset}
                    setAdminDepartment={setAdminDepartment}
                    setAdminId={setAdminId}
                    setCurrentUserEmail={setCurrentUserEmail}
                    setCurrentUserName={setCurrentUserName}
                  />
                  : <Navigate to="/role-select" replace />
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn} selectedRole={selectedRole}>
                <MyProfile
                  setIsLoggedIn={setIsLoggedIn}
                  setSelectedRole={handleRoleReset}
                  selectedRole={selectedRole}
                  currentUserEmail={currentUserEmail}
                  currentUserName={currentUserName}
                />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to={isLoggedIn ? (selectedRole === "admin" ? "/admin" : "/") : "/role-select"} replace />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;