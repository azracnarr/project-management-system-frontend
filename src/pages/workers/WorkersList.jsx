// src/pages/workers/WorkersList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import WorkerForm from "./WorkerForm";

function WorkersList() {
    const [workers, setWorkers] = useState([]);
    const [editingWorker, setEditingWorker] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const [isListExpanded, setIsListExpanded] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchWorkers = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/worker/list", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setWorkers(response.data);
        } catch (err) {
            setError("Çalışanlar alınamadı.");
            console.error("Çalışanları çekerken hata:", err);
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
            fetchWorkers();
        } catch (err) {
            setError("Geçersiz veya süresi dolmuş token. Lütfen tekrar giriş yapın.");
            localStorage.clear();
            navigate("/login");
            setLoading(false);
        }
    }, [token, navigate]);

    const handleSubmit = async (workerData) => {
        try {
            if (workerData.id) {
                await axios.put(`http://localhost:8080/api/worker/update/${workerData.id}`, workerData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert('Çalışan başarıyla güncellendi!');
            } else {
                await axios.post("http://localhost:8080/api/worker/create", workerData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert('Çalışan başarıyla eklendi!');
            }
            fetchWorkers();
            setEditingWorker(null);
            setIsListExpanded(true);
        } catch (err) {
            console.error("Ekleme/Güncelleme hatası:", err.response ? err.response.data : err.message);
            alert('İşlem başarısız oldu.');
        }
    };

    const handleDelete = async (workerId) => {
        if (!window.confirm("Bu çalışanı silmek istediğinize emin misiniz?")) {
            return;
        }
        try {
            await axios.delete(`http://localhost:8080/api/worker/delete/${workerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Çalışan başarıyla silindi!');
            fetchWorkers();
            setEditingWorker(null);
        } catch (err) {
            console.error('Silme hatası:', err.response ? err.response.data : err.message);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                alert('Yetkiniz yok veya oturum süreniz doldu. Lütfen tekrar giriş yapın.');
                localStorage.clear();
                navigate("/login");
            } else if (err.response && err.response.status === 404) {
                alert('Silinecek çalışan bulunamadı.');
            } else {
                alert('Silme işlemi başarısız oldu.');
            }
        }
    };

    const filteredWorkers = workers.filter(worker =>
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.gender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.e_mail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(worker.age).includes(searchTerm)
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

            {/* Yeni çalışan ekleme formu */}
            {!editingWorker && (
                <div style={{
                    marginBottom: "3rem",
                    padding: "2rem",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    backgroundColor: "#fff",
                    maxWidth: "800px", // Burası güncellendi
                    margin: "0 auto 3rem auto",
                }}>
                    <h2 style={{ color: "#2c3e50", textAlign: "center", marginBottom: "2rem", borderBottom: "2px solid #3498db", paddingBottom: "1rem" }}>
                        ➕ Yeni Çalışan Ekle
                    </h2>
                    <WorkerForm onSubmit={handleSubmit} />
                </div>
            )}

            {/* Düzenleme formu */}
            {editingWorker && (
                <div style={{
                    marginBottom: "3rem",
                    padding: "2rem",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    backgroundColor: "#fff",
                    maxWidth: "800px", // Burası da güncellendi
                    margin: "0 auto 3rem auto",
                }}>
                    <h2 style={{ color: "#2c3e50", textAlign: "center", marginBottom: "2rem", borderBottom: "2px solid #27ae60", paddingBottom: "1rem" }}>
                        ✏️ Çalışan Düzenle
                    </h2>
                    <WorkerForm
                        initialData={editingWorker}
                        onSubmit={handleSubmit}
                        onCancel={() => setEditingWorker(null)}
                        onDelete={handleDelete}
                    />
                </div>
            )}

            <hr style={{ margin: "3rem 0", border: "none", borderTop: "1px dashed #ccc" }} />

            {/* Mevcut Çalışan Listesi Bölümü */}
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
                    👥 Mevcut Çalışan Listesi <span style={{ transition: "transform 0.3s ease", transform: isListExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
                </h2>

                {isListExpanded && (
                    <>
                        {/* Arama Çubuğu */}
                        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
                            <input
                                type="text"
                                placeholder="Çalışan adı, yaşı veya cinsiyetine göre ara..."
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

                        {/* Çalışan Listesi */}
                        {filteredWorkers.length > 0 ? (
                            <ul style={{ listStyleType: "none", padding: 0 }}>
                                {filteredWorkers.map((worker) => (
                                    <li
                                        key={worker.id}
                                        style={{
                                            background: "#ecf0f1",
                                            padding: "20px 25px",
                                            marginBottom: "15px",
                                            borderRadius: "10px",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "8px",
                                            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                                            borderLeft: `5px solid ${editingWorker && editingWorker.id === worker.id ? '#3498db' : '#27ae60'}`,
                                            transition: "all 0.3s ease",
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: "1.2em", fontWeight: "700", color: "#2c3e50" }}>
                                                {worker.name || "İsim yok"}
                                            </span>
                                            <button
                                                onClick={() => setEditingWorker(worker)}
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
                                            Yaş: {worker.age || "Yok"}
                                        </span>
                                        <span style={{ fontSize: "1em", color: "#555" }}>
                                            Cinsiyet: {worker.gender || "Yok"}
                                        </span>
                                        <span style={{ fontSize: "1em", color: "#555" }}>
                                            E-mail: {worker.e_mail || "Yok"}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ textAlign: "center", color: "#7f8c8d", fontStyle: "italic", fontSize: "1.1em" }}>
                                Aradığınız kriterlere uygun çalışan bulunmamaktadır.
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

export default WorkersList;