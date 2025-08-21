import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import WorkerForm from "./WorkerForm";
import { confirmAlert } from 'react-confirm-alert';

function WorkersList() {
    const [workers, setWorkers] = useState([]);
    const [editingWorker, setEditingWorker] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const [isListExpanded, setIsListExpanded] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [itemsPerPage] = useState(5);

    const workersListRef = useRef(null);

    const fetchWorkers = async (page = 0) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/api/worker/list?page=${page}&size=${itemsPerPage}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setWorkers(response.data.content);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.number);
        } catch (err) {
            setError("Çalışanlar alınamadı.");
            console.error("Çalışanları çekerken hata:", err);
            toast.error("❌ Çalışan listesi yüklenemedi. Sunucuya erişilemiyor.");
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
                toast.error("❌ Yetkisiz erişim. 'PROJE_YONETICISI' rolü gereklidir.");
                return;
            }
            fetchWorkers(0);
        } catch (err) {
            setError("Geçersiz veya süresi dolmuş token. Lütfen tekrar giriş yapın.");
            localStorage.clear();
            navigate("/login");
            setLoading(false);
            toast.error("❌ Oturum süresi doldu veya geçersiz token. Lütfen tekrar giriş yapın.");
        }
    }, [token, navigate]);

    useEffect(() => {
        if (isListExpanded && workersListRef.current) {
            workersListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [workers, isListExpanded]);

    const handleSubmit = async (workerData) => {
        try {
            if (workerData.worker_id) {
                await axios.put(`http://localhost:8080/api/worker/update/${workerData.worker_id}`, workerData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post("http://localhost:8080/api/worker/create", workerData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            fetchWorkers(currentPage);
            setEditingWorker(null);
            setIsListExpanded(true);
        } catch (err) {
            console.error("Ekleme/Güncelleme hatası:", err);
            const errorMessage = err.response?.data?.message || "İşlem başarısız oldu!";
            toast.error(`❌ ${errorMessage}`);
        }
    };

    const handleDeleteWorker = async (workerId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Oturum açma bilgileri bulunamadı');
            return;
        }

        confirmAlert({
            title: 'Çalışanı Silme Onayı',
            message: 'Bu çalışanı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
            buttons: [
                {
                    label: 'Evet',
                    onClick: async () => {
                        try {
                            const response = await axios.delete(`http://localhost:8080/api/worker/delete/${workerId}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            toast.success(response.data.message || 'Çalışan başarıyla silindi');
                            fetchWorkers(currentPage);
                            setEditingWorker(null); // Silme sonrası formu kapat
                        } catch (error) {
                            console.error('Silme hatası:', error);
                            const errorMessage = error.response?.data?.message || 'Silme işlemi başarısız oldu';
                            toast.error(`❌ ${errorMessage}`);
                            if (error.response?.status === 401 || error.response?.status === 403) {
                                localStorage.clear();
                                navigate('/login');
                            }
                        }
                    }
                },
                {
                    label: 'Hayır',
                    onClick: () => toast.info('Silme işlemi iptal edildi')
                }
            ]
        });
    };

    const filteredWorkers = workers.filter(worker =>
        worker?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.gender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (worker.worker_email?.toLowerCase().includes(searchTerm.toLowerCase()) || worker.e_mail?.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
                        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                    }}
                >
                    Giriş Sayfasına Dön
                </button>
            </div>
        );
    }

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [...Array(totalPages).keys()];

        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "2rem",
                gap: "10px"
            }}>
                <button
                    onClick={() => fetchWorkers(currentPage - 1)}
                    disabled={currentPage === 0}
                    style={{
                        padding: "10px 20px",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        cursor: "pointer",
                        backgroundColor: currentPage === 0 ? "#ddd" : "#fff",
                    }}
                >
                    Önceki
                </button>
                {pages.map(page => (
                    <button
                        key={page}
                        onClick={() => fetchWorkers(page)}
                        style={{
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: currentPage === page ? "bold" : "normal",
                            backgroundColor: currentPage === page ? "#3498db" : "#fff",
                            color: currentPage === page ? "white" : "black",
                        }}
                    >
                        {page + 1}
                    </button>
                ))}
                <button
                    onClick={() => fetchWorkers(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    style={{
                        padding: "10px 20px",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        cursor: "pointer",
                        backgroundColor: currentPage === totalPages - 1 ? "#ddd" : "#fff",
                    }}
                >
                    Sonraki
                </button>
            </div>
        );
    };

    return (
        <div style={{ padding: "2rem", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
            {!editingWorker && (
                <div style={{
                    marginBottom: "3rem",
                    padding: "2rem",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    backgroundColor: "#fff",
                    maxWidth: "800px",
                    margin: "0 auto 3rem auto",
                }}>
                    <h2 style={{ color: "#2c3e50", textAlign: "center", marginBottom: "2rem", borderBottom: "2px solid #8a1270ff", paddingBottom: "1rem" }}>
                        ➕ Yeni Çalışan Ekle
                    </h2>
                    <WorkerForm onSubmit={handleSubmit} />
                </div>
            )}

            {editingWorker && (
                <div style={{
                    marginBottom: "3rem",
                    padding: "2rem",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    backgroundColor: "#fff",
                    maxWidth: "800px",
                    margin: "0 auto 3rem auto",
                }}>
                    <h2 style={{ color: "#2c3e50", textAlign: "center", marginBottom: "2rem", borderBottom: "2px solid #8a1270ff", paddingBottom: "1rem" }}>
                        ✏️ Çalışan Düzenle
                    </h2>
                    <WorkerForm
                        initialData={editingWorker}
                        onSubmit={handleSubmit}
                        onCancel={() => setEditingWorker(null)}
                        onDelete={handleDeleteWorker}
                    />
                </div>
            )}

            <hr style={{ margin: "3rem 0", border: "none", borderTop: "1px dashed #ccc" }} />

            <div
                ref={workersListRef}
                style={{
                    padding: "2rem",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    backgroundColor: "#fff",
                    maxWidth: "900px",
                    margin: "0 auto",
                }}
            >
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
                        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
                            <input
                                type="text"
                                placeholder="Çalışan adı, yaşı, e-mail veya cinsiyetine göre ara..."
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

                        {filteredWorkers.length > 0 ? (
                            <ul style={{ listStyleType: "none", padding: 0 }}>
                                {filteredWorkers.map((worker) => (
                                    <li
                                        key={worker.worker_id || worker.id}
                                        style={{
                                            background: "#ecf0f1",
                                            padding: "20px 25px",
                                            marginBottom: "15px",
                                            borderRadius: "10px",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "8px",
                                            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                                            borderLeft: `5px solid ${editingWorker && (editingWorker.worker_id === worker.worker_id || editingWorker.id === worker.id) ? '#3498db' : '#27ae60'}`,
                                            transition: "all 0.3s ease",
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: "1.2em", fontWeight: "700", color: "#8a1270ff" }}>
                                                {worker.name || "İsim yok"}
                                            </span>
                                            <button
                                                onClick={() => setEditingWorker(worker)}
                                                style={{
                                                    padding: "8px 18px",
                                                    backgroundColor: "#8a1270ff",
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
                                            E-mail: {worker.worker_email || worker.e_mail || "Yok"}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ textAlign: "center", color: "#7f8c8d", fontStyle: "italic", fontSize: "1.1em" }}>
                                Aradığınız kriterlere uygun çalışan bulunmamaktadır.
                            </p>
                        )}
                        {renderPagination()}
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