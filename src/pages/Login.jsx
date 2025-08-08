// src/pages/auth/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.timeout = 10000; // 10 saniye timeout

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // localStorage'dan güvenli veri okuma fonksiyonu
    const getRolesFromStorage = () => {
        try {
            const roleData = localStorage.getItem("role");
            console.log("Raw role data:", roleData, "Type:", typeof roleData);

            if (!roleData || roleData === "undefined" || roleData === "null") {
                return [];
            }

            // Eğer zaten bir array ise direkt döndür
            if (Array.isArray(roleData)) {
                return roleData;
            }

            // String ise parse et
            const parsed = JSON.parse(roleData);
            return Array.isArray(parsed) ? parsed : [];

        } catch (error) {
            console.error("localStorage role verisi bozuk:", error);
            console.log("Bozuk veri temizleniyor...");
            localStorage.removeItem("role");
            return [];
        }
    };

    // Component mount olduğunda zaten giriş yapılmış mı kontrol et
    useEffect(() => {
        console.log("Login component mounted, checking existing roles...");

        try {
            const roles = getRolesFromStorage();
            console.log("Found roles:", roles);

            if (roles && roles.length > 0 && roles[0] && roles[0].authority) {
                const role = roles[0].authority;
                console.log("Redirecting based on role:", role);

                if (role === "PROJE_YONETICISI") {
                    navigate("/admin-dashboard", { replace: true });
                } else if (role === "CALISAN") {
                    navigate("/user-dashboard", { replace: true });
                }
            }
        } catch (error) {
            console.error("useEffect error:", error);
            localStorage.clear();
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            console.log("Attempting login to:", `${API_BASE_URL}/api/auth/login`);

            // GEÇICI: Backend yoksa mock data ile test
            if (username === "admin" && password === "123") {
                const mockResponse = {
                    data: {
                        roles: [{ authority: "PROJE_YONETICISI" }]
                    }
                };
                console.log("Mock login successful");
                localStorage.setItem("role", JSON.stringify(mockResponse.data.roles));
                localStorage.setItem("username", username);
                navigate("/admin-dashboard", { replace: true });
                return;
            }

            // Backend'e login isteği gönder - düzeltilmiş URL
            const response = await axios.post("/api/auth/login", {
                username,
                password,
            }, {
                // CORS için gerekli olabilir
                withCredentials: false
            });

            console.log("Login response:", response.data);

            // Backend'den kullanıcı bilgisi ve rol geliyor
            const userData = response.data;

            if (userData && userData.role !== undefined && userData.role.length > 0) {

                // Başarılı login sonrası token'ı da kaydet
                localStorage.setItem("role", JSON.stringify(userData.role));
                localStorage.setItem("username", username);

                // Eğer backend JWT token döndürüyorsa kaydet
                if (userData.token) {
                    localStorage.setItem("token", userData.token);
                }

                // Rol bazlı yönlendirme (ilk rolü alıyoruz)
                const role = userData.role;
                console.log("Ramazan:", role.filter((f) => f.authority === "PROJE_YONETICISI"));
                const yonetici = role.filter((f) => f.authority === "PROJE_YONETICISI").length > 0 ? true : false;

                if (yonetici) {
                    navigate("/admin-dashboard", { replace: true });
                } else {
                    navigate("/user-dashboard", { replace: true });
                }
            } else {
                setError("Kullanıcı rol bilgisi alınamadı.");
            }
        } catch (err) {
            console.error("Login error:", err);

            // Daha detaylı hata mesajları
            if (err.code === 'ECONNABORTED') {
                setError("İstek zaman aşımına uğradı. Sunucu yanıt vermiyor.");
            } else if (err.response) {
                // Sunucu yanıt verdi ama hata kodu ile
                const status = err.response.status;
                const message = err.response.data?.message || err.response.statusText;

                if (status === 401) {
                    setError("Geçersiz kullanıcı adı veya şifre.");
                } else if (status === 403) {
                    setError("Bu hesapla giriş yapma yetkiniz yok.");
                } else if (status === 500) {
                    setError("Sunucu hatası. Lütfen daha sonra tekrar deneyin.");
                } else {
                    setError(`Giriş başarısız (${status}): ${message}`);
                }
            } else if (err.request) {
                // İstek gönderildi ama yanıt alınamadı
                setError(`Sunucuya bağlanılamıyor (${API_BASE_URL}). Lütfen:\n- Backend servisinin çalıştığını kontrol edin\n- URL'nin doğru olduğunu kontrol edin\n- Ağ bağlantınızı kontrol edin`);
            } else {
                // İstek hazırlanırken hata oluştu
                setError("Bir hata oluştu. Lütfen tekrar deneyin.");
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f0f2f5',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                backgroundColor: '#fff',
                textAlign: 'center'
            }}>
                <h1 style={{
                    fontSize: '2.5em',
                    marginBottom: '1rem',
                    color: '#2c3e50',
                    borderBottom: '2px solid #3498db',
                    paddingBottom: '1rem'
                }}>
                    Proje Yönetim Sistemi
                </h1>
                <h2 style={{
                    fontSize: '1.5em',
                    marginBottom: '2rem',
                    color: '#7f8c8d'
                }}>
                    Giriş Yap
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        placeholder="Kullanıcı Adı"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            fontSize: '1em',
                            boxSizing: 'border-box'
                        }}
                    />
                    <input
                        placeholder="Şifre"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            fontSize: '1em',
                            boxSizing: 'border-box'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: loading ? '#bdc3c7' : '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '1em',
                            fontWeight: 'bold',
                            transition: 'background-color 0.3s ease'
                        }}
                    >
                        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </button>

                    {error && (
                        <div style={{
                            color: '#e74c3c',
                            marginTop: '1rem',
                            padding: '1rem',
                            borderRadius: '8px',
                            backgroundColor: '#fdecec',
                            border: '1px solid #e74c3c',
                            whiteSpace: 'pre-line',
                            textAlign: 'left'
                        }}>
                            {error}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default Login;