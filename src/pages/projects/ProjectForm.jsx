import React, { useState, useEffect } from "react";
import axios from "axios"; // axios'a burada ihtiyacınız olmayabilir, sadece onSubmit prop'u yeterli

function ProjectForm({ onSubmit, initialData, onCancel, onDelete }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectStatus, setProjectStatus] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setProjectStatus(initialData.project_status || "");
    } else {
      clearForm();
    }
  }, [initialData]);

  const clearForm = () => {
    setName("");
    setDescription("");
    setProjectStatus("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id: initialData ? initialData.id : undefined,
      name: name.trim(),
      description: description.trim(),
      project_status: projectStatus.trim(),
    });
    if (!initialData) {
      clearForm();
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
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "2rem",
        borderRadius: "12px",
        backgroundColor: "#f9f9f9",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        maxWidth: "500px",
        margin: "0 auto",
      }}
    >
      <h2 style={{ textAlign: "center", color: "#333", marginBottom: "10px" }}>
        {initialData ? "Projeyi Güncelle" : "Yeni Proje Ekle"}
      </h2>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label style={{ marginBottom: "8px", fontWeight: "600", color: "#555" }}>
          Proje Adı:
        </label>
        <input
          type="text"
          placeholder="Proje Adı"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "1em",
            transition: "border-color 0.3s ease",
          }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label style={{ marginBottom: "8px", fontWeight: "600", color: "#555" }}>
          Açıklama:
        </label>
        <input
          type="text"
          placeholder="Açıklama"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "1em",
            transition: "border-color 0.3s ease",
          }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label style={{ marginBottom: "8px", fontWeight: "600", color: "#555" }}>
          Durum:
        </label>
        <input
          type="text"
          placeholder="Proje Durumu"
          value={projectStatus}
          onChange={(e) => setProjectStatus(e.target.value)}
          required
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "1em",
            transition: "border-color 0.3s ease",
          }}
        />
      </div>
      <div style={{ marginTop: "15px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <button
          type="submit"
          style={{
            padding: "12px 24px",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "1em",
            fontWeight: "600",
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
              padding: "12px 24px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1em",
              fontWeight: "600",
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
              padding: "12px 24px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1em",
              fontWeight: "600",
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

export default ProjectForm;