// src/pages/projects/ProjectList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import ProjectForm from "./ProjectForm"; // ProjectForm'u import edin

function ProjectList() {
    const [projects, setProjects] = useState([]);
    const [editingProject, setEditingProject] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const [isListExpanded, setIsListExpanded] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchProjects = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/project/list", {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("Gelen veri:", response.data);
            setProjects(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError("Projeler alınamadı.");
            console.error("Projeleri çekerken hata:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            const roles = decodedToken.roles || [];
            const authorized = roles.some((r) => r === "PROJE_YONETICISI");
            if (!authorized) {
                setError("Yetkiniz yok. Bu sayfaya erişim için 'PROJE_YONETICISI' rolü gereklidir.");
                setLoading(false);
                return;
            }
            fetchProjects();
        } catch (err) {
            setError("Geçersiz veya süresi dolmuş token. Lütfen tekrar giriş yapın.");
            localStorage.clear();
            navigate("/login");
            setLoading(false);
        }
    }, [token, navigate]);

    const handleSubmit = async (projectData) => {
        try {
            if (projectData.id) {
                await axios.put(`http://localhost:8080/api/project/update/${projectData.id}`, projectData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert('Proje başarıyla güncellendi!');
            } else {
                await axios.post("http://localhost:8080/api/project/create", projectData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert('Proje başarıyla eklendi!');
            }
            fetchProjects();
            setEditingProject(null);
            setIsListExpanded(true);
        } catch (err) {
            console.error("Ekleme/Güncelleme hatası:", err.response ? err.response.data : err.message);
            alert('İşlem başarısız oldu.');
        }
    };

    const handleDelete = async (projectId) => {
        if (!window.confirm("Bu projeyi silmek istediğinize emin misiniz?")) {
            return;
        }

        try {
            await axios.delete(`http://localhost:8080/api/project/delete/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert('Proje başarıyla silindi!');
            fetchProjects();
            setEditingProject(null);
        } catch (err) {
            console.error('Silme hatası:', err.response ? err.response.data : err.message);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                alert('Yetkiniz yok veya oturum süreniz doldu. Lütfen tekrar giriş yapın.');
                localStorage.clear();
                navigate("/login");
            } else if (err.response && err.response.status === 404) {
                alert('Silinecek proje bulunamadı.');
            } else {
                alert('Silme işlemi başarısız oldu.');
            }
        }
    };

    const filteredProjects = (projects || []).filter(proj =>
        proj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proj.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proj.project_status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div style={{ padding: "2rem", textAlign: "center", fontSize: "1.2em", color: "#666" }}>Yükleniyor...</div>;
    }

    if (error) {
        return (
            <div style={{ padding: "2rem", textAlign: "center", color: "red", backgroundColor: "#ffebeb", borderRadius: "8px", margin: "2rem auto", maxWidth: "600px" }}>
                <h2 style={{ marginBottom: "1rem" }}>{error}</h2>
                <button
                    onClick={() => navigate("/login")}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "1em",
                    }}
                >
                    Giriş Sayfasına Dön
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: "2rem", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: "#f0f2f5", minHeight: "100vh" }}>

            {/* Yeni proje ekleme formu */}
            {!editingProject && (
                <div style={{
                    marginBottom: "3rem",
                    padding: "2rem",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    backgroundColor: "#fff",
                    maxWidth: "800px", // Burası 800px olarak güncellendi
                    margin: "0 auto 3rem auto",
                }}>
                    <h2 style={{ color: "#2c3e50", textAlign: "center", marginBottom: "2rem", borderBottom: "2px solid #3498db", paddingBottom: "1rem" }}>
                        ➕ Yeni Proje Ekle
                    </h2>
                    <ProjectForm onSubmit={handleSubmit} />
                </div>
            )}

            {/* Düzenleme formu */}
            {editingProject && (
                <div style={{
                    marginBottom: "3rem",
                    padding: "2rem",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    backgroundColor: "#fff",
                    maxWidth: "800px", // Burası da 800px olarak güncellendi
                    margin: "0 auto 3rem auto",
                }}>
                    <h2 style={{ color: "#2c3e50", textAlign: "center", marginBottom: "2rem", borderBottom: "2px solid #27ae60", paddingBottom: "1rem" }}>
                        ✏️ Proje Düzenle
                    </h2>
                    <ProjectForm
                        initialData={editingProject}
                        onSubmit={handleSubmit}
                        onCancel={() => setEditingProject(null)}
                        onDelete={handleDelete}
                    />
                </div>
            )}

            <hr style={{ margin: "3rem 0", border: "none", borderTop: "1px dashed #ccc" }} />

            {/* Mevcut Proje Listesi Bölümü */}
            <div style={{
                padding: "2rem",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                backgroundColor: "#fff",
                maxWidth: "900px",
                margin: "0 auto",
            }}>
                <h2
                    onClick={() => setIsListExpanded(!isListExpanded)}
                    style={{
                        color: "#34495e",
                        textAlign: "center",
                        marginBottom: "1rem",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "10px",
                        fontSize: "1.8em",
                    }}
                >
                    📋 Mevcut Proje Listesi <span style={{ transition: "transform 0.3s ease", transform: isListExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
                </h2>

                {isListExpanded && (
                    <>
                        {/* Arama Çubuğu */}
                        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
                            <input
                                type="text"
                                placeholder="Proje adı, açıklama veya duruma göre ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    padding: "12px",
                                    borderRadius: "8px",
                                    border: "1px solid #ddd",
                                    width: "100%",
                                    maxWidth: "500px",
                                    fontSize: "1em",
                                    boxSizing: "border-box",
                                    transition: "box-shadow 0.3s ease",
                                }}
                            />
                        </div>

                        {/* Proje Listesi */}
                        {filteredProjects.length > 0 ? (
                            <ul style={{ listStyleType: "none", padding: 0 }}>
                                {filteredProjects.map((proj) => (
                                    <li
                                        key={proj.id}
                                        style={{
                                            background: "#ecf0f1",
                                            padding: "20px 25px",
                                            marginBottom: "15px",
                                            borderRadius: "10px",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "8px",
                                            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                                            borderLeft: `5px solid ${editingProject && editingProject.id === proj.id ? '#3498db' : '#27ae60'}`,
                                            transition: "all 0.3s ease",
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: "1.2em", fontWeight: "700", color: "#2c3e50" }}>
                                                {proj.name || "İsim yok"}
                                            </span>
                                            <button
                                                onClick={() => setEditingProject(proj)}
                                                style={{
                                                    padding: "8px 18px",
                                                    backgroundColor: "#3498db",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    cursor: "pointer",
                                                    fontSize: "0.9em",
                                                    fontWeight: "600",
                                                    transition: "background-color 0.3s ease",
                                                }}
                                            >
                                                Düzenle
                                            </button>
                                        </div>
                                        <span style={{ fontSize: "1em", color: "#555" }}>
                                            Açıklama: {proj.description || "Yok"}
                                        </span>
                                        <span style={{ fontSize: "1em", color: "#555" }}>
                                            Durum: {proj.project_status || "Yok"}
                                        </span>
                                        {Array.isArray(proj.workers) && proj.workers.length > 0 && (
                                            <span style={{ fontSize: "0.9em", color: "#7f8c8d", marginTop: "5px" }}>
                                                Çalışanlar: {proj.workers.map(worker => worker.name).join(", ")}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ textAlign: "center", color: "#7f8c8d", fontStyle: "italic", fontSize: "1.1em" }}>
                                Aradığınız kriterlere uygun proje bulunmamaktadır.
                            </p>
                        )}
                    </>
                )}
                {!isListExpanded && (
                    <p style={{ textAlign: "center", color: "#7f8c8d", marginTop: "1rem" }}>
                        Listeyi görmek için başlıktaki ok işaretine tıklayın.
                    </p>
                )}
            </div>
        </div>
    );
}

export default ProjectList;