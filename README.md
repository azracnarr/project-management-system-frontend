# Proje Yönetim Sistemi - Stajyer Projesi 🏢🖥️

## 🎯 Amaç
Bu projenin amacı, bir organizasyon içinde yürütülen projelerin takibini ve yönetimini kolaylaştırmak için kullanılan basit ve kullanışlı bir **Proje Yönetim Sistemi** geliştirmektir.  
Sistem sayesinde yöneticiler projeleri oluşturabilecek, çalışanları sisteme ekleyebilecek ve projelere çalışan atamaları yapılabilecektir.

---

## 🧩 Teknolojiler
- **Backend:** Java 21 + Spring Boot  
- **Frontend:** React.js  
- **Veritabanı:** PostgreSQL  
- **İletişim:** RESTful API (JSON)  
- **Güvenlik:** Spring Security + JWT (son aşamada eklenecek)  
- **API Testi:** Postman  
- **Containerization:** Docker  

---

## 👥 Rollere Göre Yetkilendirme
- **Proje Yöneticisi:**  
  - Tüm projeleri görüntüleyebilir  
  - Yeni proje oluşturabilir  
  - Çalışan ekleyebilir  
  - Projelere çalışan atayabilir  

- **Çalışan:**  
  - Sadece kendisine atanmış projeleri görüntüleyebilir  

---

## 🔧 Yapılacaklar (Aşamalar)
1. **Proje kurulumu:** Spring Boot ve React projelerinin temel yapısı kurulur, PostgreSQL bağlantısı yapılır.  
2. **Proje yönetimi:** Proje ekleme, listeleme, silme, güncelleme.  
3. **Çalışan yönetimi:** Çalışan ekleme, listeleme, silme, güncelleme.  
4. **Çalışan atama:** Projelere çalışan atanabilir, atanmış çalışanlar listelenebilir.  
5. **Proje durumları:** Proje "Yeni", "Devam Ediyor", "Tamamlandı" gibi durumlara sahip olabilir.  
6. **Giriş ve yetkilendirme (Security):** Kullanıcı girişi ve rol bazlı yetki eklenir.  

---

## 🏃‍♂️ Projeyi Çalıştırma

### 1️⃣ Docker ile çalıştırma
```bash
# Backend ve frontend'i Docker ile ayağa kaldır
docker-compose up --build
