import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import axios from 'axios';

function WorkerForm({ onSubmit, initialData, onCancel, onDelete }) {
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [workerEmail, setWorkerEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || "");
            setAge(initialData.age !== undefined ? initialData.age : "");
            setGender(initialData.gender || "");
            setWorkerEmail(initialData.worker_email || initialData.e_mail || "");
        } else {
            clearForm();
        }
    }, [initialData]);

    const clearForm = () => {
        setName("");
        setAge("");
        setGender("");
        setWorkerEmail("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!name.trim()) {
            toast.warning("Çalışan adı gereklidir!");
            return;
        }
        if (!workerEmail.trim()) {
            toast.warning("E-posta adresi gereklidir!");
            return;
        }
        if (!emailRegex.test(workerEmail.trim())) {
            toast.warning("Lütfen geçerli bir e-posta adresi girin.");
            return;
        }
        if (!age || Number(age) < 18 || Number(age) > 100) {
            toast.warning("Yaş 18-100 arasında olmalıdır!");
            return;
        }
        if (!gender) {
            toast.warning("Lütfen bir cinsiyet seçin!");
            return;
        }

        setIsSubmitting(true);
        const ageNumber = Number(age);

        try {
            await onSubmit({
                worker_id: initialData ? (initialData.worker_id || initialData.id) : undefined,
                name: name.trim(),
                age: ageNumber,
                gender,
                worker_email: workerEmail.trim(),
            });

            if (!initialData) {
                toast.success("✅ Çalışan başarıyla eklendi!");
                clearForm();
            } else {
                toast.success("✅ Çalışan başarıyla güncellendi!");
            }
        } catch (err) {
            console.error("İşlem hatası:", err);
            const errorMessage = err.response?.data?.message || err.message || "Bir hata oluştu.";
            toast.error("❌ " + errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                padding: "2.5rem",
                borderRadius: "16px",
                backgroundColor: "#ffffff",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e1e8ed",
            }}
        >
            <h2 style={{ textAlign: "center", color: "#333", marginBottom: "10px" }}>
                {initialData ? "Çalışanı Güncelle" : "Yeni Çalışan Ekle"}
            </h2>

            <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#34495e" }}>
                    Adı <span style={{ color: "red" }}>*</span>
                </label>
                <input
                    type="text"
                    placeholder="Çalışan adı"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd", fontSize: "1em", boxSizing: "border-box", transition: "border-color 0.3s ease" }}
                    onFocus={(e) => e.target.style.borderColor = "#3498db"}
                    onBlur={(e) => e.target.style.borderColor = "#ddd"}
                />
            </div>

            <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#34495e" }}>
                    Yaşı <span style={{ color: "red" }}>*</span>
                </label>
                <input
                    type="number"
                    placeholder="Yaşı"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    min={18}
                    max={100}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd", fontSize: "1em", boxSizing: "border-box", transition: "border-color 0.3s ease" }}
                    onFocus={(e) => e.target.style.borderColor = "#3498db"}
                    onBlur={(e) => e.target.style.borderColor = "#ddd"}
                />
            </div>

            <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#34495e" }}>
                    E-mail <span style={{ color: "red" }}>*</span>
                </label>
                <input
                    type="email"
                    placeholder="ornek@email.com"
                    value={workerEmail}
                    onChange={(e) => setWorkerEmail(e.target.value)}
                    required
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd", fontSize: "1em", boxSizing: "border-box", transition: "border-color 0.3s ease" }}
                    onFocus={(e) => e.target.style.borderColor = "#3498db"}
                    onBlur={(e) => e.target.style.borderColor = "#ddd"}
                />
            </div>

            <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#34495e" }}>
                    Cinsiyeti <span style={{ color: "red" }}>*</span>
                </label>
                <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd", fontSize: "1em", backgroundColor: "white", boxSizing: "border-box", transition: "border-color 0.3s ease" }}
                    onFocus={(e) => e.target.style.borderColor = "#3498db"}
                    onBlur={(e) => e.target.style.borderColor = "#ddd"}
                >
                    <option value="">Cinsiyet Seçin</option>
                    <option value="Erkek">Erkek</option>
                    <option value="Kadın">Kadın 🌸</option>
                </select>
            </div>

            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        flexGrow: 1,
                        minWidth: "120px",
                        padding: "0.75rem 1.5rem",
                        backgroundColor: isSubmitting ? "#bdc3c7" : "#8a1270ff",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                        fontSize: "1em",
                        fontWeight: "bold",
                        transition: "all 0.3s ease",
                        position: "relative"
                    }}
                    onMouseEnter={(e) => { if (!isSubmitting) e.target.style.backgroundColor = "#8a1270ff"; }}
                    onMouseLeave={(e) => { if (!isSubmitting) e.target.style.backgroundColor = "#8a1270ff"; }}
                >
                    {isSubmitting ? "⏳ İşleniyor..." : (initialData ? "✅ Güncelle" : "➕ Ekle")}
                </button>

                {initialData && onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        style={{
                            flexGrow: 1,
                            minWidth: "120px",
                            padding: "0.75rem 1.5rem",
                            backgroundColor: "#95a5a6",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: isSubmitting ? "not-allowed" : "pointer",
                            fontSize: "1em",
                            fontWeight: "bold",
                            transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => { if (!isSubmitting) e.target.style.backgroundColor = "#7f8c8d"; }}
                        onMouseLeave={(e) => { if (!isSubmitting) e.target.style.backgroundColor = "#95a5a6"; }}
                    >
                        ❌ İptal
                    </button>
                )}

                {initialData && onDelete && (
                    <button
                        type="button"
                        onClick={() => onDelete(initialData.worker_id)}
                        disabled={isSubmitting}
                        style={{
                            flexGrow: 1,
                            minWidth: "120px",
                            padding: "0.75rem 1.5rem",
                            backgroundColor: "#cd71c5ff",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: isSubmitting ? "not-allowed" : "pointer",
                            fontSize: "1em",
                            fontWeight: "bold",
                            transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => { if (!isSubmitting) e.target.style.backgroundColor = "#cd71c5ff"; }}
                        onMouseLeave={(e) => { if (!isSubmitting) e.target.style.backgroundColor = "#cd71c5ff"; }}
                    >
                        🗑️ Sil
                    </button>
                )}
            </div>

            <div style={{
                fontSize: "0.85rem",
                color: "#7f8c8d",
                textAlign: "center",
                marginTop: "1rem",
                padding: "12px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px dashed #dee2e6"
            }}>
                <strong>💡 İpucu:</strong> Tüm alanlar zorunludur.
            </div>
        </form>
    );
}

export default WorkerForm;