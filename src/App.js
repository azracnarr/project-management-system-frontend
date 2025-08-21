import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import ProjectList from "./pages/projects/ProjectList";
import WorkersList from "./pages/workers/WorkersList";
import ProjectAssignmentForm from "./pages/projects/ProjectAssigmentForm";

// Rol bazlı koruma yapan özel route bileşeni
function PrivateRoute({ children, role }) {
  // localStorage'dan güvenli veri okuma
  const getRolesFromStorage = () => {
    try {
      const roleData = localStorage.getItem("role");
      if (!roleData) return [];
      return JSON.parse(roleData);
    } catch (error) {
      console.error("localStorage role verisi bozuk:", error);
      localStorage.removeItem("role");
      return [];
    }
  };

  const roles = getRolesFromStorage();
  const authorized = roles.some((r) => r.authority === role);

  if (!authorized) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Ana sayfa yönlendirme bileşeni
function HomeRedirect() {
  // localStorage'dan güvenli veri okuma
  const getRolesFromStorage = () => {
    try {
      const roleData = localStorage.getItem("role");
      if (!roleData) return [];
      return JSON.parse(roleData);
    } catch (error) {
      console.error("localStorage role verisi bozuk:", error);
      localStorage.removeItem("role");
      return [];
    }
  };

  const roles = getRolesFromStorage();

  if (roles.some((r) => r.authority === "PROJE_YONETICISI")) {
    return <Navigate to="/admin-dashboard" replace />;
  }
  if (roles.some((r) => r.authority === "CALISAN")) {
    return <Navigate to="/user-dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Giriş sayfası */}
        <Route path="/login" element={<Login />} />

        {/* Admin panel ve yöneticiye özel sayfalar */}
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute role="PROJE_YONETICISI">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <PrivateRoute role="PROJE_YONETICISI">
              <ProjectList />
            </PrivateRoute>
          }
        />
        <Route
          path="/workers"
          element={
            <PrivateRoute role="PROJE_YONETICISI">
              <WorkersList />
            </PrivateRoute>
          }
        />
        <Route
          path="/project-assignment"
          element={
            <PrivateRoute role="PROJE_YONETICISI">
              <ProjectAssignmentForm />
            </PrivateRoute>
          }
        />

        {/* Kullanıcı paneli */}
        <Route
          path="/user-dashboard"
          element={
            <PrivateRoute role="CALISAN">
              <UserDashboard />
            </PrivateRoute>
          }
        />

        {/* Anasayfa - rol bazlı yönlendirme */}
        <Route path="/" element={<HomeRedirect />} />

        {/* Bilinmeyen tüm rotalar login'e yönlendirilsin */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* ToastContainer'ı Routes'tan sonra koydum ve özel yapılandırma ekledim */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastClassName="custom-toast"
      />
    </Router>
  );
}

export default App;