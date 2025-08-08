// src/pages/workers/WorkerForm.jsx
import React, { useState, useEffect } from "react";

function WorkerForm({ onSubmit, initialData, onCancel, onDelete }) {
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [e_mail, setEmail] = useState("");
    const [error, setError] = useState(""); // Hata mesajı için

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || "");
            setAge(initialData.age !== undefined ? initialData.age : "");
            setGender(initialData.gender || "");
            setEmail(initialData.e_mail || "");
        } else {
            clearForm();
        }
    }, [initialData]);

    const clearForm = () => {
        setName("");
        setAge("");
        setGender("");
        setEmail("");
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let formErrors = {};

        if (!name) formErrors.name = "Bu alan zorunludur.";
        if (!e_mail) formErrors.e_mail = "Bu alan zorunludur.";
        if (!age) formErrors.age = "Bu alan zorunludur.";
        if (!gender) formErrors.gender = "Bu alan zorunludur.";
        setError(""); // Önceki hatayı temizle

        const ageNumber = Number(age);

        try {
            await onSubmit({
                id: initialData ? initialData.id : undefined,
                name: name.trim(),
                age: ageNumber,
                gender,
                e_mail,
            });

            if (!initialData) {
                clearForm();
            }
        } catch (err) {
            // Backend hatasını yakala
            if (err.response && err.response.data) {
                setError(err.response.data); // Örn: "Bu e-mail zaten kayıtlı!"
            } else {
                setError("Bir hata oluştu.");
            }
        }
    };

    const handleDelete = () => {
        if (initialData && initialData.id) {
            onDelete(initialData.id);
            clearForm();
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
            <div>
                <label style={{ marginBottom: "0.5rem", fontWeight: "600", color: "#34495e" }}>
                    Adı:
                </label>
                <input
                    type="text"
                    placeholder="Çalışan adı"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        fontSize: "1em",
                        boxSizing: "border-box",
                    }}
                />
            </div>
            <div>
                <label style={{ marginBottom: "0.5rem", fontWeight: "600", color: "#34495e" }}>
                    Yaşı:
                </label>
                <input
                    type="number"
                    placeholder="Yaşı"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    min={18}
                    max={100}
                    style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        fontSize: "1em",
                        boxSizing: "border-box",
                    }}
                />
            </div>
            <div>
                <label style={{ marginBottom: "0.5rem", fontWeight: "600", color: "#34495e" }}>
                    E-mail
                </label>
                <input
                    type="text"
                    placeholder="E-mail"
                    value={e_mail}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        fontSize: "1em",
                        boxSizing: "border-box",
                    }}
                />
            </div>

            {/* Hata mesajını göster */}
            {error && (
                <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>
            )}

            <div>
                <label style={{ marginBottom: "0.5rem", fontWeight: "600", color: "#34495e" }}>
                    Cinsiyeti:
                </label>
                <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
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
                    <option value="">Cinsiyet Seçin</option>
                    <option value="Erkek">Erkek</option>
                    <option value="Kadın">Kadın</option>
                    <option value="Diğer">Diğer</option>
                </select>
            </div>
            <div
                style={{
                    marginTop: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                }}
            >
                <button
                    type="submit"
                    style={{
                        flexGrow: 1,
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
                    {initialData ? "Güncelle" : "Ekle"}
                </button>
                {initialData && onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            flexGrow: 1,
                            padding: "0.75rem 1.5rem",
                            backgroundColor: "#95a5a6",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "1em",
                            fontWeight: "bold",
                            transition: "background-color 0.3s ease",
                        }}
                    >
                        İptal
                    </button>
                )}
                {initialData && onDelete && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        style={{
                            flexGrow: 1,
                            padding: "0.75rem 1.5rem",
                            backgroundColor: "#c0392b",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "1em",
                            fontWeight: "bold",
                            transition: "background-color 0.3s ease",
                        }}
                    >
                        Sil
                    </button>
                )}
            </div>
        </form>
    );
}

export default WorkerForm;
