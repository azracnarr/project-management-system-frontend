import { confirmAlert } from 'react-confirm-alert'; // Ana fonksiyon
import 'react-confirm-alert/src/react-confirm-alert.css'; // Varsayılan stil dosyası

confirmAlert({
    title: 'Başlık', // String: Onay penceresinin başlığı
    message: 'Mesajınız...', // String veya JSX: Onay penceresinin gövde metni
    buttons: [ // Dizi: Butonların konfigürasyonu
        {
            label: 'Evet', // String: Buton üzerindeki metin
            onClick: () => alert('Evet tıklandı!'), // Fonksiyon: Tıklandığında çalışacak kod
        },
        {
            label: 'Hayır', // String: Buton üzerindeki metin
            onClick: () => alert('Hayır tıklandı!') // Fonksiyon: Tıklandığında çalışacak kod
        }
    ],
    closeOnEscape: true, // Boolean: 'ESC' tuşu ile kapatılabilir mi?
    closeOnClickOutside: true, // Boolean: Dışarıya tıklayarak kapatılabilir mi?
    keyCodeForClose: [8, 32], // Dizi: Hangi tuşlar ile kapatılabileceği
    overlayClassName: "overlay-custom-class-name" // String: Kaplama için özel CSS sınıfı
});
