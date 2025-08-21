// src/pages/project/ProjectAssignmentForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function ProjectAssigmentForm() {
    const [projects, setProjects] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [selectedWorkerId, setSelectedWorkerId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchDropdownData = async () => {
            if (!token) {
                toast.error("Yetkilendirme tokenı bulunamadı.");
                setLoading(false);
                navigate("/login");
                return;
            }

            try {
                const projectsRes = await axios.get('http://localhost:8080/api/project/all', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProjects(projectsRes.data || []);

                const workersRes = await axios.get('http://localhost:8080/api/worker/all', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWorkers(workersRes.data || []);

                setLoading(false);
            } catch (err) {
                console.error("Veri çekme hatası:", err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    toast.error("Oturum süreniz doldu veya yetkiniz yok. Lütfen tekrar giriş yapın.");
                    localStorage.clear();
                    navigate("/login");
                } else {
                    toast.error("Projeler veya çalışanlar yüklenirken hata oluştu.");
                }
                setLoading(false);
            }
        };

        fetchDropdownData();
    }, [token, navigate]);

    const handleAssign = async (e) => {
        e.preventDefault();

        if (!selectedProjectId || !selectedWorkerId) {
            console.log("Uyarı toast tetiklendi");
            toast.warning('Lütfen hem proje hem de çalışan seçin.');
            return;
        }

        console.log("API isteği gönderiliyor...", {
            selectedWorkerId,
            selectedProjectId
        });

        try {
            const response = await axios.post(
                `http://localhost:8080/api/worker/${selectedWorkerId}/project/${selectedProjectId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("API Response:", response);

            if (response.status === 200) {
                console.log("Başarı toast tetiklendi");
                toast.success("Çalışan projeye başarıyla atandı!");
            } else {
                console.log("Info toast tetiklendi");
                toast.info(response.data || "Atama işlemi tamamlandı ancak beklenmedik bir durum oluştu.");
            }
            setSelectedProjectId('');
            setSelectedWorkerId('');
        } catch (err) {
            console.error("Atama hatası:", err.response ? err.response.data : err.message);
            console.log("Hata toast tetiklendi");

            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                toast.error("Oturum süreniz doldu veya yetkiniz yok. Lütfen tekrar giriş yapın.");
                localStorage.clear();
                navigate("/login");
            } else {
                toast.error(err.response?.data || "Atama işlemi başarısız oldu.");
            }
        }
    };

    if (loading) {
        return <div style={{ padding: "2rem", textAlign: "center", fontSize: "1.2em", color: "#666" }}>Yükleniyor...</div>;
    }

    return (
        <div style={{
            maxWidth: "800px",
            margin: "2rem auto",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            backgroundColor: "#fff",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
            <h2 style={{ color: "#2c3e50", textAlign: "center", marginBottom: "2rem", borderBottom: "2px solid #8a1270ff", paddingBottom: "1rem" }}>
                📝 Çalışana Proje Ata
            </h2>
            <form onSubmit={handleAssign} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#34495e" }}>
                        Proje Seçin:
                    </label>
                    <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        required
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            borderRadius: "8px",
                            border: "1px solid #ddd",
                            fontSize: "1em",
                            backgroundColor: "white",
                            boxSizing: "border-box",
                            transition: "border-color 0.3s ease",
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#3498db"}
                        onBlur={(e) => e.target.style.borderColor = "#ddd"}
                    >
                        <option value="">-- Proje Seç --</option>
                        {(projects || []).map(project => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#34495e" }}>
                        Çalışan Seçin:
                    </label>
                    <select
                        value={selectedWorkerId}
                        onChange={(e) => setSelectedWorkerId(e.target.value)}
                        required
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            borderRadius: "8px",
                            border: "1px solid #ddd",
                            fontSize: "1em",
                            backgroundColor: "white",
                            boxSizing: "border-box",
                            transition: "border-color 0.3s ease",
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#3498db"}
                        onBlur={(e) => e.target.style.borderColor = "#ddd"}
                    >
                        <option value="">-- Çalışan Seç --</option>
                        {(workers || []).map(worker => (
                            <option key={worker.worker_id} value={worker.worker_id}>
                                {worker.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ marginTop: "1rem" }}>
                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            padding: "0.75rem 1.5rem",
                            backgroundColor: "#8a1270ff",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "1em",
                            fontWeight: "bold",
                            transition: "all 0.3s ease",
                            transform: "translateY(0)",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#8a1270ff";
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 4px 12px rgba(52, 152, 219, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#8a1270ff";
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                        }}
                    >
                        Çalışana Proje Ata
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProjectAssigmentForm;