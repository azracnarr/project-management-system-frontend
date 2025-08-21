// src/pages/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // JWT token'ı çözümlemek için gerekli kütüphane

function UserDashboard() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState(""); // Kullanıcı adını göstermek için

    // Yeni: Proje listesinin açık/kapalı durumunu tutar
    const [isListExpanded, setIsListExpanded] = useState(false);
    // Yeni: Arama çubuğu için state
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        // Token yoksa veya yetkili değilse yönlendir
        if (!token) {
            setError("Giriş yapmanız gerekiyor.");
            setLoading(false);
            navigate("/login");
            return;
        }

        try {
            // JWT token'ı çözümleyerek roller ve username bilgisini alıyoruz
            const decodedToken = jwtDecode(token);
            const roles = decodedToken.roles || [];
            const user = decodedToken.sub; // Genellikle 'sub' alanı kullanıcı adıdır

            const authorized = roles.some((r) => r === "CALISAN");

            if (!authorized) {
                setError("⚠️ Bu sayfaya erişim yetkiniz yoktur. 'CALISAN' rolü gereklidir.");
                setLoading(false);
                return;
            }
            setUsername(user); // Kullanıcı adını state'e kaydet

            // Backend'den projeleri çekme işlemi
            axios
                .get("http://localhost:8080/api/project/my_project", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((res) => {
                    setProjects(res.data);
                    setLoading(false);
                })
                .catch((err) => {
                    // Hata durumunda, hata mesajına göre kullanıcıya bilgi ver
                    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                        setError("Oturum süreniz doldu veya yetkiniz yok. Lütfen tekrar giriş yapın.");
                        localStorage.clear();
                        navigate("/login");
                    } else {
                        setError("Projeler alınamadı. Sunucu hatası.");
                    }
                    setLoading(false);
                });

        } catch (err) {
            // Token çözümleme hatası, süresi dolmuş veya geçersiz token
            setError("Geçersiz veya süresi dolmuş token. Lütfen tekrar giriş yapın.");
            localStorage.clear();
            navigate("/login");
            setLoading(false);
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    // Yeni: Projeleri arama terimine göre filtrele
    const filteredProjects = projects.filter(proj =>
        proj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proj.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proj.project_status.toLowerCase().includes(searchTerm.toLowerCase())
    );


    if (loading) {
        return (
            <div style={{ padding: "20px", textAlign: "center", fontSize: "1.2em" }}>
                <p>Yükleniyor...</p>
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
                        backgroundColor: "#007bff",
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
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "1px solid #eee", paddingBottom: "20px" }}>
                <h1 style={{ color: "#333", margin: 0 }}>👋 Kullanıcı Paneline Hoşgeldiniz, {username}!</h1>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                >
                    Çıkış Yap
                </button>
            </div>

            {/* Mevcut Proje Listesi Bölümü */}
            <div style={{
                border: "1px solid #ddd",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                maxWidth: "800px",
                margin: "0 auto"
            }}>
                <h2
                    style={{
                        color: "#333",
                        textAlign: "center",
                        marginBottom: "20px",
                        cursor: "pointer", // Tıklanabilir olduğunu belirt
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "10px"
                    }}
                    onClick={() => setIsListExpanded(!isListExpanded)} // Tıklanınca durumu değiştir
                >
                    📋 Size Atanmış Projeler {isListExpanded ? "▲" : "▼"}
                </h2>

                {/* Arama Çubuğu */}
                {isListExpanded && ( // Liste açıkken arama çubuğunu göster
                    <div style={{ marginBottom: "20px", textAlign: "center" }}>
                        <input
                            type="text"
                            placeholder="Proje adı, açıklama veya duruma göre ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: "10px",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                                width: "80%",
                                maxWidth: "400px",
                                fontSize: "1em"
                            }}
                        />
                    </div>
                )}

                {/* Proje Listesi (Sadece isListExpanded true ise göster) */}
                {isListExpanded && (
                    filteredProjects.length > 0 ? (
                        <ul style={{ listStyleType: "none", padding: 0, maxWidth: "800px", margin: "0 auto" }}>
                            {filteredProjects.map((p) => (
                                <li key={p.project_id} style={{
                                    background: "#f9f9f9",
                                    border: "1px solid #ddd",
                                    padding: "15px 20px", // Daha büyük padding
                                    marginBottom: "10px", // Daha fazla boşluk
                                    borderRadius: "8px", // Daha yuvarlak köşeler
                                    display: "flex",
                                    flexDirection: "column", // İçerikleri dikey hizala
                                    gap: "5px", // İçerikler arasında boşluk
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)" // Hafif gölge
                                }}>
                                    <span style={{ fontSize: "1.1em", fontWeight: "bold", color: "#0056b3" }}>
                                        {p.name || "İsim yok"}
                                    </span>
                                    <span style={{ fontSize: "0.95em", color: "#666" }}>
                                        Açıklama: {p.description || "Yok"}
                                    </span>
                                    <span style={{ fontSize: "0.95em", color: "#666" }}>
                                        Durum: {p.project_status || "Yok"}
                                    </span>
                                    {Array.isArray(p.workers) && p.workers.length > 0 && (
                                        <span style={{ fontSize: "0.9em", color: "#1a60a5ff", marginTop: "5px" }}>
                                            Çalışanlar: {p.workers.map(worker => worker.name).join(", ")}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ textAlign: "center", color: "#666" }}>Aradığınız kriterlere uygun proje bulunmamaktadır.</p>
                    )
                )}
                {!isListExpanded && (
                    <p style={{ textAlign: "center", color: "#666" }}>Listeyi görmek için başlığa tıklayın.</p>
                )}
            </div>
        </div>
    );
}

export default UserDashboard;
