// src/pages/auth/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify"; // Toastify için import
import 'react-toastify/dist/ReactToastify.css'; // Toastify stilini de import edin

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
                toast.success("✅ Başarıyla giriş yapıldı!"); // Mock başarılı giriş bildirimi
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
                localStorage.setItem("role", JSON.stringify(userData.role));
                localStorage.setItem("username", username);

                if (userData.token) {
                    localStorage.setItem("token", userData.token);
                }

                const role = userData.role;
                console.log("Ramazan:", role.filter((f) => f.authority === "PROJE_YONETICISI"));
                const yonetici = role.filter((f) => f.authority === "PROJE_YONETICISI").length > 0 ? true : false;

                if (yonetici) {
                    toast.success("✅ Başarıyla giriş yapıldı!"); // Gerçek başarılı giriş bildirimi
                    navigate("/admin-dashboard", { replace: true });
                } else {
                    toast.success("✅ Başarıyla giriş yapıldı!"); // Gerçek başarılı giriş bildirimi
                    navigate("/user-dashboard", { replace: true });
                }
            } else {
                setError("Kullanıcı rol bilgisi alınamadı.");
                toast.error("❌ Kullanıcı rol bilgisi alınamadı."); // Toastify hata bildirimi
            }
        } catch (err) {
            console.error("Login error:", err);

            if (err.code === 'ECONNABORTED') {
                setError("İstek zaman aşımına uğradı. Sunucu yanıt vermiyor.");
                toast.error("❌ İstek zaman aşımına uğradı. Sunucu yanıt vermiyor.");
            } else if (err.response) {
                const status = err.response.status;
                const message = err.response.data?.message || err.response.statusText;

                if (status === 401) {
                    setError("Geçersiz kullanıcı adı veya şifre.");
                    toast.error("❌ Geçersiz kullanıcı adı veya şifre.");
                } else if (status === 403) {
                    setError("Bu hesapla giriş yapma yetkiniz yok.");
                    toast.error("❌ Bu hesapla giriş yapma yetkiniz yok.");
                } else if (status === 500) {
                    setError("Sunucu hatası. Lütfen daha sonra tekrar deneyin.");
                    toast.error("❌ Sunucu hatası. Lütfen daha sonra tekrar deneyin.");
                } else {
                    setError(`Giriş başarısız (${status}): ${message}`);
                    toast.error(`❌ Giriş başarısız (${status}): ${message}`);
                }
            } else if (err.request) {
                setError(`Sunucuya bağlanılamıyor (${API_BASE_URL}). Lütfen:\n- Backend servisinin çalıştığını kontrol edin\n- URL'nin doğru olduğunu kontrol edin\n- Ağ bağlantınızı kontrol edin`);
                toast.error(`❌ Sunucuya bağlanılamıyor. Lütfen backend servisini ve ağ bağlantınızı kontrol edin.`);
            } else {
                setError("Bir hata oluştu. Lütfen tekrar deneyin.");
                toast.error("❌ Bir hata oluştu. Lütfen tekrar deneyin.");
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        // Ana kapsayıcı div: Sayfanın tamamını kaplar ve arka planı ayarlar
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                fontFamily: "'Inter', sans-serif", // Daha modern bir font

                // --- ARKA PLAN RESMİ VE OVERLAY ---
                // Buraya kendi resim URL'nizi yapıştırın!
                backgroundImage: 'url("https://images.unsplash.com/photo-1672239272089-250c32c3e2e2?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
                position: 'relative', // Overlay için gerekli
                overflow: 'hidden', // Taşmaları gizle
            }}
        >
            {/* Arka plan üzerine yarı saydam katman (overlay) */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.65)', // Daha koyu yarı saydam siyah
                    zIndex: 0, // İçerikten arkada kalması için
                }}
            ></div>

            {/* Giriş Formu Kapsayıcısı */}
            <div
                style={{
                    position: 'relative', // Overlay'in üzerinde görünmesi için z-index ile birlikte
                    zIndex: 1, // Overlay'den üstte kalması için
                    backgroundColor: 'rgba(255, 255, 255, 0.98)', // Formun hafif saydam arka planı
                    padding: '3rem 2.5rem',
                    borderRadius: '18px', // Daha yuvarlak köşeler
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)', // Daha belirgin gölge
                    width: '100%',
                    maxWidth: '420px', // Genişletilmiş maksimum genişlik
                    textAlign: 'center',
                    border: '1px solid rgba(161, 8, 82, 0.5)', // Hafif kenarlık
                    backdropFilter: 'blur(5px)', // Hafif bulanıklık efekti (modern görünüm)
                }}
            >
                <h1
                    style={{
                        fontSize: '2.8em', // Daha büyük başlık
                        marginBottom: '1.5rem',
                        color: '#2c3e50', // Koyu gri/mavi ton
                        borderBottom: '3px solid #991065ff', // Daha kalın alt çizgi
                        paddingBottom: '1rem',
                        fontWeight: '800', // Daha kalın font
                    }}
                >
                    Proje Yönetim Sistemi
                </h1>
                <h2
                    style={{
                        fontSize: '1.6em', // Daha belirgin alt başlık
                        marginBottom: '2.5rem',
                        color: '#555', // Orta gri ton
                        fontWeight: '600',
                    }}
                >
                    Giriş Yap
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <input
                        placeholder="Kullanıcı Adı"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem 1.25rem', // Daha fazla padding
                            borderRadius: '10px', // Yuvarlak köşeler
                            border: '1px solid #ccc', // İnce kenarlık
                            fontSize: '1.05em', // Hafif büyük font
                            boxSizing: 'border-box',
                            transition: 'all 0.3s ease', // Geçiş efekti
                            outline: 'none',
                            backgroundColor: '#f8f8f8', // Hafif gri arka plan
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '0 0 0 3px rgba(161, 8, 82, 0.5)'; // Mavi kenarlık
                            e.target.style.boxShadow = '0 0 0 3px rgba(161, 8, 82, 0.5)'; // Odaklandığında gölge
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#ddd';
                            e.target.style.boxShadow = 'none';
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
                            padding: '1rem 1.25rem', // Daha fazla padding
                            borderRadius: '10px', // Yuvarlak köşeler
                            border: '1px solid #ccc', // İnce kenarlık
                            fontSize: '1.05em', // Hafif büyük font
                            boxSizing: 'border-box',
                            transition: 'all 0.3s ease', // Geçiş efekti
                            outline: 'none',
                            backgroundColor: '#f8f8f8', // Hafif gri arka plan
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '0 0 0 3px rgba(161, 8, 82, 0.5)'; // Mavi kenarlık
                            e.target.style.boxShadow = '0 0 0 3px rgba(161, 8, 82, 0.5)'; // Odaklandığında gölge
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#ddd';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            // Modern gradyan ve gölge efekti
                            background: loading ? '#bdc3c7' : 'linear-gradient(to right, #3498db, #b92978ff)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px', // Yuvarlak köşeler
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '1.15em', // Daha büyük font
                            fontWeight: 'bold',
                            letterSpacing: '0.05em', // Harf aralığı
                            boxShadow: loading ? 'none' : '0 8px 15px rgba(0, 0, 0, 0.2)', // Başlangıç gölgesi
                            transition: 'all 0.3s ease', // Geçiş efekti
                            position: 'relative', // Pseudo-elementler için
                            overflow: 'hidden', // Pseudo-elementlerin taşmasını engelle
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.target.style.background = 'linear-gradient(to right, 0 0 0 3px rgba(161, 8, 82, 0.5), 0 0 0 3px rgba(161, 8, 82, 0.5))';
                                e.target.style.transform = 'translateY(-3px)'; // Hafif yukarı hareket
                                e.target.style.boxShadow = '0 12px 20px rgba(0, 0, 0, 0.3)'; // Daha belirgin gölge
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.target.style.background = 'linear-gradient(to right, 0 0 0 3px rgba(161, 8, 82, 0.5), 0 0 0 3px rgba(161, 8, 82, 0.5))';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.2)';
                            }
                        }}
                    >
                        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </button>

                    {error && (
                        <div
                            style={{
                                color: '#e74c3c',
                                marginTop: '1.5rem',
                                padding: '1rem',
                                borderRadius: '10px',
                                backgroundColor: '#fdecec',
                                border: '1px solid #e74c3c',
                                whiteSpace: 'pre-line',
                                textAlign: 'left',
                                fontSize: '0.9em', // Daha küçük hata yazısı
                                boxShadow: '0 2px 8px rgba(231, 76, 60, 0.15)', // Hata için hafif gölge
                            }}
                        >
                            {error}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default Login;
