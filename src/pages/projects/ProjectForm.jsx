import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

function ProjectForm({ onSubmit, initialData, onCancel, onDelete }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectStatus, setProjectStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation & warnings
    if (!name.trim()) {
      toast.warning("Proje adı gereklidir!");
      return;
    }

    if (!description.trim()) {
      toast.warning("Proje açıklaması gereklidir!");
      return;
    }

    if (!projectStatus.trim()) {
      toast.warning("Proje durumu gereklidir!");
      return;
    }

    if (name.trim().length < 3) {
      toast.warning("Proje adı en az 3 karakter olmalıdır!");
      return;
    }

    console.log("Form submit işlemi başlatılıyor...", {
      name: name.trim(),
      description: description.trim(),
      project_status: projectStatus.trim(),
      isUpdate: !!initialData
    });

    setIsSubmitting(true);

    try {
      await onSubmit({
        id: initialData ? initialData.id : undefined,
        name: name.trim(),
        description: description.trim(),
        project_status: projectStatus.trim(),
      });

      // Proje ekleme durumunda formu temizle
      if (!initialData) {
        clearForm();
        console.log("Yeni proje eklendi, form temizlendi");

      } else {
        console.log("Proje güncellendi");

      }
    } catch (error) {
      console.error("Proje işlem hatası:", error);

    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!initialData?.id) return;
    onDelete(initialData.id); // toast, loading, hata işlemleri handleDelete içinde olacak
  };




  return (
    <div style={{
      maxWidth: "600px",
      margin: "0 auto",
      padding: "2rem",
    }}>
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

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{
            fontSize: "1rem",
            fontWeight: "600",
            color: "#34495e",
            marginBottom: "4px"
          }}>
            Proje Adı<span style={{ color: "red" }}> *</span>
          </label>
          <input
            type="text"
            placeholder="Örn: Web Sitesi Geliştirme"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            style={{
              padding: "14px 16px",
              borderRadius: "10px",
              border: "2px solid #e1e8ed",
              fontSize: "1rem",
              transition: "all 0.3s ease",
              backgroundColor: "#fafbfc",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#3498db";
              e.target.style.backgroundColor = "#fff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e1e8ed";
              e.target.style.backgroundColor = "#fafbfc";
            }}
          />
          <small style={{ color: "#7f8c8d", fontSize: "0.85rem" }}>
            {name.length}/100 karakter
          </small>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{
            fontSize: "1rem",
            fontWeight: "600",
            color: "#34495e",
            marginBottom: "4px"
          }}>
            Açıklama<span style={{ color: "red" }}> *</span>
          </label>
          <textarea
            placeholder="Proje hakkında detaylı açıklama yazın..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            maxLength={500}
            style={{
              padding: "14px 16px",
              borderRadius: "10px",
              border: "2px solid #e1e8ed",
              fontSize: "1rem",
              transition: "all 0.3s ease",
              backgroundColor: "#fafbfc",
              outline: "none",
              resize: "vertical",
              minHeight: "100px",
              fontFamily: "inherit"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#3498db";
              e.target.style.backgroundColor = "#fff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e1e8ed";
              e.target.style.backgroundColor = "#fafbfc";
            }}
          />
          <small style={{ color: "#7f8c8d", fontSize: "0.85rem" }}>
            {description.length}/500 karakter
          </small>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{
            fontSize: "1rem",
            fontWeight: "600",
            color: "#34495e",
            marginBottom: "4px"
          }}>
            Proje Durumu<span style={{ color: "red" }}> *</span>
          </label>
          <select
            value={projectStatus}
            onChange={(e) => setProjectStatus(e.target.value)}
            required
            style={{
              padding: "14px 16px",
              borderRadius: "10px",
              border: "2px solid #e1e8ed",
              fontSize: "1rem",
              transition: "all 0.3s ease",
              backgroundColor: "#fafbfc",
              outline: "none",
              cursor: "pointer"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#3498db";
              e.target.style.backgroundColor = "#fff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e1e8ed";
              e.target.style.backgroundColor = "#fafbfc";
            }}
          >
            <option value="">-- Durum Seçin --</option>
            <option value="Planlama">📋 Planlama</option>
            <option value="Geliştirme">⚡ Geliştirme</option>
            <option value="Test">🧪 Test</option>
            <option value="Tamamlandı">✅ Tamamlandı</option>
            <option value="Beklemede">⏸️ Beklemede</option>
            <option value="İptal">❌ İptal</option>
          </select>
        </div>

        <div style={{
          marginTop: "2rem",
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          flexWrap: "wrap"
        }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "14px 28px",
              backgroundColor: isSubmitting ? "#bdc3c7" : "#8a1270ff",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontSize: "1rem",
              fontWeight: "600",
              transition: "all 0.3s ease",
              minWidth: "120px",
              position: "relative"
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.target.style.backgroundColor = "#8a1270ff";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 12px rgba(52, 152, 219, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.target.style.backgroundColor = "#8a1270ff";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }
            }}
          >
            {isSubmitting ? "⏳ İşleniyor..." : (initialData ? "✏️ Güncelle" : "➕ Ekle")}
          </button>

          {initialData && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              style={{
                padding: "14px 28px",
                backgroundColor: "#95a5a6",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontSize: "1rem",
                fontWeight: "600",
                transition: "all 0.3s ease",
                minWidth: "120px"
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = "#7f8c8d";
                  e.target.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = "#95a5a6";
                  e.target.style.transform = "translateY(0)";
                }
              }}
            >
              🚫 İptal
            </button>
          )}

          {initialData && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              style={{
                padding: "14px 28px",
                backgroundColor: "#cd71c5ff",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontSize: "1rem",
                fontWeight: "600",
                transition: "all 0.3s ease",
                minWidth: "120px"
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = "#cd71c5ff";
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 12px rgba(231, 76, 60, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = "#cd71c5ff";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }
              }}
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
          <strong>💡 İpucu:</strong> Tüm alanlar zorunludur. Proje adı en az 3 karakter olmalıdır.
        </div>
      </form>
    </div>
  );
}

export default ProjectForm;