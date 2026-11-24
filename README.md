# VolleyDesk

VolleyDesk mengelola biodata dan antropometri pemain, kehadiran, kalender, kegiatan latihan, statistik live pertandingan, laporan, backup, serta akses admin, sekolah, pelatih, dan pemain.

## Menjalankan lokal

1. Gunakan Node.js 18 atau lebih baru.
2. Salin `.env.example` menjadi `.env`, lalu ganti `BOOTSTRAP_ADMIN_PASSWORD`.
3. Jalankan:

   ```sh
   npm install
   npm start
   ```

4. Buka `http://localhost:3000`. Akun administrator dibuat dari `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_NAME`, dan `BOOTSTRAP_ADMIN_PASSWORD`. Tanpa `.env`, mode lokal memakai akun awal `admin@volleydesk.demo` / `VoliDesk!2026`.

SQLite disimpan pada `SQLITE_PATH` (default `./data/volleydesk.sqlite`). Direktori database lokal diabaikan Git.

## Database dan sesi

Data aplikasi, akun, dan sesi login disimpan server-side di SQLite. Cookie sesi HttpOnly berlaku 30 hari dan sesi tetap aktif saat server restart atau deploy selama memakai database yang sama. Untuk Railway, pasang persistent volume pada `/data` dan atur `SQLITE_PATH=/data/volleydesk.sqlite`; tanpa volume, filesystem container dapat hilang saat deploy atau restart sehingga akun, data, dan sesi ikut hilang. Sesi juga berakhir setelah logout atau perubahan kata sandi.

Data lama di browser dapat diimpor sekali saat administrator pertama kali masuk ke database baru. Setelah itu database server menjadi sumber data bersama. Admin/pelatih dapat mengimpor daftar pemain dari Excel `.xlsx` atau CSV di menu Data pemain; template `.xlsx` dapat diunduh di halaman tersebut. Ikuti sheet **Petunjuk** dan daftar pilihan/rentang yang tersedia pada template. Kolom vertical jump (cm), jenis kelamin, dan tanggal lahir (format `YYYY-MM-DD`) bersifat opsional, sehingga template lama tetap kompatibel.

Pemain melihat statistik melalui **Portal publik pemain**; akun login dan role pemain tidak tersedia. Akun pemain lama dinonaktifkan dan tidak disertakan dalam daftar akun maupun backup. Profil dan statistik pemain tetap tersimpan.

Di menu Data pemain, pilih satu atau beberapa baris atau gunakan pilih semua untuk menghapus pemain beserta catatan terkait.

Tombol **Statistik pemain** membuka detail kehadiran, statistik teknik per pertandingan, dan riwayat antropometri. Gunakan **Update antropometri** untuk mencatat tanggal pengukuran, tinggi, berat badan, vertical jump, spike reach, dan block reach. Grafik tren vertical jump serta jangkauan lompatan menampilkan riwayat dari waktu ke waktu; data lama tanpa vertical jump tetap dapat dibuka. Halaman statistik pemain menyediakan **Cetak PDF** untuk menyimpan ringkasan serta riwayat pemain. Profil pemain dapat diedit dari tombol **Edit profil**; penghapusan dari halaman detail memerlukan konfirmasi dan ikut menghapus catatan pemain yang terkait.

## Backup, restore, dan Telegram

- Halaman **Pengaturan akses** menyediakan unduhan backup JSON dan pemulihan dari backup JSON.
- Backup berisi data operasional, akun pengguna, hash kata sandi, dan jadwal backup. Sesi login dan token Telegram tidak disertakan. Simpan berkas backup dan chat Telegram secara privat.
- Pada Pengaturan akses, isi **Telegram Bot Token** dan **Telegram Chat ID**, lalu simpan. Token tidak ditampilkan kembali dan tidak dimasukkan ke file backup. Alternatifnya, atur `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID` sebagai Railway Variables/Secrets; variabel lingkungan memiliki prioritas.
- Setelah kredensial tersedia, admin dapat mengaktifkan backup harian dan memilih waktu. Zona waktu default adalah `Asia/Jakarta`.
- **Kirim backup sekarang** mengirim berkas melalui bot Telegram. Bot perlu dapat mengirim pesan ke chat tujuan.

Menu **Latihan** menampilkan daftar sesi beserta status absensi dan materi latihan serta aksi **Pratinjau**, **Edit**, dan **Hapus** dengan konfirmasi. Materi latihan wajib diisi saat membuat atau menyimpan sesi; status sesi tetap **Belum Terisi** selama materi atau absensinya belum lengkap. Saat menambah sesi, pilih semua pemain, pilih tim, atau tentukan pemain secara manual; mode manual juga menyediakan **Pilih semua pemain**. **Tambah Sesi** membuka pengisian absensi hanya untuk roster sesi; evaluasi individu hanya tersedia untuk pemain berstatus Hadir. Kalender menampilkan grid bulanan atau tahunan dengan penanda tanggal berwarna sesuai jenis kegiatan. Pilih tanggal berkegiatan untuk melihat tombol **Detail**, **Edit**, dan **Hapus**; daftar seluruh kegiatan juga menyediakan tombol **Detail** beserta aksi yang tersedia. Kalender juga menyediakan **Tambah sesi** dan **Tambah pertandingan** pada tanggal yang dipilih. Setelah penambahan dari Kalender, aplikasi kembali ke Kalender; sesi dan pertandingan dapat diedit dari Kalender atau menu masing-masing. Kegiatan latihan terjadwal menjadi sesi latihan, sedangkan pertandingan, sparring, dan turnamen terjadwal masuk ke daftar pertandingan. Menu **Tim** digunakan untuk mengelompokkan pemain. Saat membuat atau mengedit pertandingan, pilih tim lalu roster pemain yang hadir dan bertanding. Menu **Pertandingan** menampilkan persentase menang, total ace, poin serangan, receive, dan blok serta daftar laga dengan aksi **Pratinjau**, **Edit**, **Catat live**, dan **Hapus**. Catat live dibuka dari daftar pertandingan untuk mengisi statistik pemain dan skor hingga lima set, lalu menyimpan evaluasi umum dan individu.

Admin juga dapat memilih maksimal lima item navigasi bawah serta highlight-nya untuk setiap role. Aksi **Edit** dan **Hapus** dari Kalender mengikuti hak menu asal kegiatan: sesi latihan memakai menu **Latihan**, pertandingan memakai menu **Pertandingan**, dan agenda umum memakai menu **Kalender**.

Pada Pengaturan, admin dapat mengatur visibilitas setiap menu dan batas tindakan per role: **Lihat saja**, **Edit/tambah**, atau **Termasuk hapus**. Admin selalu memiliki akses penuh. Batas perubahan juga diperiksa server, bukan hanya dengan menyembunyikan tombol.

Menu **Log aktivitas** khusus admin menampilkan hingga 200 aktivitas terbaru, termasuk login/logout, perubahan data, profil, kata sandi, dan akun pengguna. Log disimpan di SQLite dan tidak memuat kata sandi atau token.

Pengaturan **Identitas aplikasi & kop dokumen** mengatur nama dan subjudul aplikasi, judul tab browser, logo/favicon, serta kop cetak laporan dan statistik pemain. Ukuran logo, teks, font, ukuran font, tebal/miring, dan garis pembatas kop dapat diubah; pratinjau tersedia sebelum disimpan. Pengaturan tanda tangan PDF menyediakan sakelar untuk menampilkan blok tanda tangan dan nama kepala sekolah, serta kolom keterangan, jabatan, nama kepala sekolah, tempat, jabatan pelatih, dan nama pelatih. Tanggal pada sisi pelatih mengikuti tanggal cetak.

Admin dapat mengaktifkan **Portal publik pemain** di Pengaturan untuk membuat tautan acak dan QR code lokal. Pengunjung mengetik sedikitnya tiga huruf nama dan memasukkan tanggal lahir yang terdaftar untuk melihat statistik pertandingan. Tautan dapat diputar atau dinonaktifkan; data kelas, kehadiran, antropometri, evaluasi, dan tanggal lahir tidak ditampilkan. Siapa pun yang memperoleh tautan dapat membuka formulir, sehingga tanggal lahir merupakan pemeriksaan dasar, bukan autentikasi kuat.

Menu **Laporan** memiliki filter mingguan, bulanan, tahunan, dan rentang tanggal khusus. Rentang aktif diterapkan pada laporan kehadiran per sesi dan pemain, riwayat pengukuran antropometri seluruh pemain, serta rekap statistik tiap pemain pada setiap pertandingan. Masing-masing laporan dapat diunduh sebagai CSV atau dicetak menjadi PDF.

Dashboard menampilkan grafik efisiensi rata-rata tiap pemain untuk Ace, serangan, receive, dan blok serta grafik total sukses teknik tersebut di seluruh pertandingan. Menu **Papan Strategi** tersedia untuk admin dan pelatih: buat beberapa papan per lawan, susun starting six di posisi 1–6 dengan drag-and-drop atau pemilih nama, gunakan tombol rotasi servis, pilih formasi receive, catat set-play dan taktik khusus lawan, lalu simpan.

Jangan menyimpan token bot atau kata sandi produksi di Git atau mengirimkannya melalui chat. Simpan salinan backup di lokasi aman lain; Telegram bukan satu-satunya salinan yang disarankan.

## Railway

Service menggunakan `npm start` dan port dinamis `PORT`. GitHub auto-deploy tetap diarahkan ke branch `main`. Atur variabel berikut pada Railway:

- `SQLITE_PATH=/data/volleydesk.sqlite`
- `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_NAME`, `BOOTSTRAP_ADMIN_PASSWORD`
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (untuk backup Telegram)
- `BACKUP_TIMEZONE=Asia/Jakarta` (opsional)

Persistent volume dan pemakaian service dapat menimbulkan biaya. Periksa paket dan pemakaian Railway; biaya nol tidak dijamin.
