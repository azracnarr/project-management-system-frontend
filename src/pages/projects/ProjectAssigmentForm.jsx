// src/pages/project/ProjectAssignmentForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ProjectAssignmentForm() {
    const [projects, setProjects] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [selectedWorkerId, setSelectedWorkerId] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchDropdownData = async () => {
            if (!token) {
                setError("Yetkilendirme tokenı bulunamadı.");
                setLoading(false);
                navigate("/login");
                return;
            }

            try {
                const projectsRes = await axios.get('http://localhost:8080/api/project/list', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProjects(projectsRes.data);

                const workersRes = await axios.get('http://localhost:8080/api/worker/list', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWorkers(workersRes.data);

                setLoading(false);
            } catch (err) {
                console.error("Veri çekme hatası:", err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    setError("Oturum süreniz doldu veya yetkiniz yok. Lütfen tekrar giriş yapın.");
                    localStorage.clear();
                    navigate("/login");
                } else {
                    setError("Projeler veya çalışanlar yüklenirken hata oluştu.");
                }
                setLoading(false);
            }
        };

        fetchDropdownData();
    }, [token, navigate]);

    const handleAssign = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!selectedProjectId || !selectedWorkerId) {
            setMessage('Lütfen hem proje hem de çalışan seçin.');
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:8080/api/worker/${selectedWorkerId}/project/${selectedProjectId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.status === 200) {
                setMessage("✅ Çalışan projeye başarıyla atandı!");
            } else {
                setMessage(response.data || "Atama işlemi tamamlandı ancak beklenmedik bir durum oluştu.");
            }
            setSelectedProjectId('');
            setSelectedWorkerId('');
        } catch (err) {
            console.error("Atama hatası:", err.response ? err.response.data : err.message);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                setError("Oturum süreniz doldu veya yetkiniz yok. Lütfen tekrar giriş yapın.");
                localStorage.clear();
                navigate("/login");
            } else {
                setError(err.response?.data || "Atama işlemi başarısız oldu.");
            }
        }
    };

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
        <div style={{
            maxWidth: "800px",
            margin: "2rem auto",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            backgroundColor: "#fff",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
            <h2 style={{ color: "#2c3e50", textAlign: "center", marginBottom: "2rem", borderBottom: "2px solid #3498db", paddingBottom: "1rem" }}>
                📝 Çalışana Proje Ata
            </h2>
            <form onSubmit={handleAssign} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div>
                    <label style={{ marginBottom: "0.5rem", fontWeight: "600", color: "#34495e" }}>
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
                        }}
                    >
                        <option value="">-- Proje Seç --</option>
                        {projects.map(project => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ marginBottom: "0.5rem", fontWeight: "600", color: "#34495e" }}>
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
                        }}
                    >
                        <option value="">-- Çalışan Seç --</option>
                        {workers.map(worker => (
                            <option key={worker.id} value={worker.id}>
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
                            backgroundColor: "#3498db",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "1em",
                            fontWeight: "bold",
                            transition: "background-color 0.3s ease",
                        }}
                    >
                        Çalışana Proje Ata
                    </button>
                </div>
            </form>

            {message && <p style={{ color: "#28a745", textAlign: "center", marginTop: "1.5rem", fontWeight: "bold" }}>{message}</p>}
            {error && <p style={{ color: "#dc3545", textAlign: "center", marginTop: "1.5rem", fontWeight: "bold" }}>{error}</p>}
        </div>
    );
}

export default ProjectAssignmentForm;