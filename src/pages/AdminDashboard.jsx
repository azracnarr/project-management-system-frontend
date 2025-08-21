// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Genel API çağrıları için
import { jwtDecode } from "jwt-decode"; // Token çözmek için

// Yönetim bileşenlerini import edin
import ProjectList from "./projects/ProjectList"; // Proje yönetimi bileşeni
import WorkersList from "./workers/WorkersList"; // Çalışan yönetimi bileşeni
import ProjectAssignmentForm from "./projects/ProjectAssigmentForm";  // Çalışana proje atama bileşeni

function AdminDashboard() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("");
    // Aktif olarak hangi bölümün gösterileceğini tutan state (varsayılan: projeler)
    const [activeAdminSection, setActiveAdminSection] = useState("projects");

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            setError("Giriş yapmanız gerekiyor.");
            setLoading(false);
            navigate("/login");
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            const roles = decodedToken.roles || [];
            const user = decodedToken.sub; // Genellikle 'sub' alanı kullanıcı adıdır

            // Sadece 'PROJE_YONETICISI' rolüne sahip kullanıcıların erişimine izin ver
            const authorized = roles.some((r) => r === "PROJE_YONETICISI");

            if (!authorized) {
                setError("⚠️ Bu sayfaya erişim yetkiniz yoktur. 'PROJE_YONETICISI' rolü gereklidir.");
                setLoading(false);
                return;
            }

            setUsername(user); // Kullanıcı adını state'e kaydet
            setLoading(false); // Yükleme tamamlandı

        } catch (err) {
            console.error("Token doğrulama hatası:", err);
            setError("Geçersiz veya süresi dolmuş token. Lütfen tekrar giriş yapın.");
            localStorage.clear();
            setLoading(false);
            navigate("/login");
        }
    }, [token, navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    if (loading) {
        return (
            <div style={{ padding: "20px", textAlign: "center", fontSize: "1.2em" }}>
                <p>Yönetici Paneli Yükleniyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: "20px", color: "red", textAlign: "center" }}>
                <h2>{error}</h2>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#5c1056ff",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        marginTop: "15px"
                    }}
                >
                    Giriş Sayfasına Dön
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "1px solid #eee", paddingBottom: "20px" }}>
                <h1 style={{ color: "#333", margin: 0 }}>👋 Yönetici Paneline Hoşgeldiniz, {username}!</h1>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#b80d0dff",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                >
                    Çıkış Yap
                </button>
            </div>

            {/* Navigasyon Butonları */}
            <div style={{ marginBottom: "30px", display: "flex", gap: "15px" }}>
                <button
                    onClick={() => setActiveAdminSection("projects")}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: activeAdminSection === "projects" ? "#8a1270ff" : "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "1em"
                    }}
                >
                    Projeleri Yönet
                </button>
                <button
                    onClick={() => setActiveAdminSection("workers")}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: activeAdminSection === "workers" ? "#8a1270ff" : "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "1em"
                    }}
                >
                    Çalışanları Yönet
                </button>
                <button
                    onClick={() => setActiveAdminSection("assignProject")}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: activeAdminSection === "assignProject" ? "#8a1270ff" : "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "1em"
                    }}
                >
                    Çalışana Proje Ata
                </button>
            </div>

            {/* İçerik Alanı: Seçilen bölüme göre bileşeni render et */}
            <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                {activeAdminSection === "projects" && (
                    <section>
                        <h2>📋 Proje Yönetimi</h2>
                        <ProjectList />
                    </section>
                )}

                {activeAdminSection === "workers" && (
                    <section>
                        <h2>👥 Çalışan Yönetimi</h2>
                        <WorkersList />
                    </section>
                )}

                {activeAdminSection === "assignProject" && (
                    <section>
                        <h2>🔗 Çalışana Proje Atama</h2>
                        <ProjectAssignmentForm />
                    </section>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
