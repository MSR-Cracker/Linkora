(() => {
  const phrases = {
    'Linkora home': ['الرئيسية - Linkora', 'Beranda Linkora'],
    '← Linkora home': ['← الصفحة الرئيسية لـ Linkora', '← Beranda Linkora'],
    'Main navigation': ['القائمة الرئيسية', 'Navigasi utama'],
    'Linkora benefits': ['مميزات Linkora', 'Manfaat Linkora'],
    'Linkora — Drop. Share. Simplify.': ['Linkora — أرسل. شارك. ببساطة.', 'Linkora — Taruh. Bagikan. Sederhanakan.'],
    'Share files and notes that disappear when the timer runs out. No account needed.': ['شارك ملفات وملاحظات تختفي عند انتهاء المؤقت، دون الحاجة إلى حساب.', 'Bagikan file dan catatan yang hilang saat waktunya habis, tanpa akun.'],
    'Open navigation': ['فتح القائمة', 'Buka navigasi'],
    'Close navigation': ['إغلاق القائمة', 'Tutup navigasi'],
    'How it works': ['كيف تعمل', 'Cara kerja'],
    'Features': ['المميزات', 'Fitur'],
    'Privacy': ['الخصوصية', 'Privasi'],
    'Try it now': ['جرّبه الآن', 'Coba sekarang'],
    'Choose language': ['اختر اللغة', 'Pilih bahasa'],
    'Small links. Short lives. No account, no clutter.': ['روابط صغيرة، عمرها قصير، بلا حساب أو تعقيد.', 'Tautan kecil, berumur singkat, tanpa akun dan tanpa ribet.'],
    'Privacy-first by design': ['الخصوصية أساس التصميم', 'Privasi sejak awal desain'],
    'Preparing your drop space…': ['نجهّز مساحة المشاركة…', 'Menyiapkan ruang berbagi…'],
    'FILES · NOTES · TEMPORARY LINKS': ['ملفات · ملاحظات · روابط مؤقتة', 'FILE · CATATAN · TAUTAN SEMENTARA'],
    'FILES · NOTES · VANISHING LINKS': ['ملفات · ملاحظات · روابط تختفي', 'FILE · CATATAN · TAUTAN YANG HILANG'],
    'Drop. Share.': ['أرسل. شارك.', 'Taruh. Bagikan.'],
    'Simplify.': ['ببساطة.', 'Simpel.'],
    'Files and notes with a timer built in.': ['ملفات وملاحظات بوقت انتهاء محدد.', 'File dan catatan dengan batas waktu.'],
    'Make a link, pass it along, and let it expire.': ['أنشئ رابطًا، أرسله، واتركه ينتهي تلقائيًا.', 'Buat tautan, bagikan, biarkan kedaluwarsa.'],
    'Create a drop': ['أنشئ مشاركة', 'Buat tautan'],
    'See how it works': ['اعرف كيف تعمل', 'Lihat cara kerjanya'],
    'Drop': ['أرسل', 'Buat'],
    'Link': ['رابط', 'Tautan'],
    'Timer': ['مؤقت', 'Timer'],
    'Drop, link, timer, vanish': ['إرسال، رابط، مؤقت، ثم اختفاء', 'Buat tautan, atur waktu, lalu bagikan'],
    'Private by default': ['خصوصية افتراضية', 'Privat secara default'],
    'Your timer, your call': ['أنت تختار المدة', 'Kamu tentukan waktunya'],
    'No sign-up required': ['لا حاجة لإنشاء حساب', 'Tidak perlu mendaftar'],
    'Three steps. One less thing to worry about.': ['ثلاث خطوات، وشيء أقل يشغلك.', 'Tiga langkah. Satu hal lebih sedikit untuk dipikirkan.'],
    'Sharing should take seconds, not an account setup.': ['المشاركة تأخذ ثواني، مش إعداد حساب.', 'Berbagi cukup beberapa detik, tanpa membuat akun.'],
    '01 / Drop': ['٠١ / أرسل', '01 / Taruh'],
    'Choose a file or write a note': ['اختر ملفًا أو اكتب ملاحظة', 'Pilih file atau tulis catatan'],
    'Upload one file or paste the words you need to share. Start right away — no account, no sign-up form.': ['ارفع ملفًا واحدًا أو اكتب ما تريد مشاركته. ابدأ فورًا دون حساب أو نموذج تسجيل.', 'Unggah satu file atau tulis pesan yang ingin dibagikan. Langsung mulai tanpa akun atau formulir pendaftaran.'],
    '02 / Link': ['٠٢ / رابط', '02 / Tautan'],
    'Get a private share link': ['احصل على رابط مشاركة خاص', 'Dapatkan tautan berbagi privat'],
    'Copy your unique link in a tap. Add a password or make it disappear after its first open.': ['انسخ رابطك بنقرة. أضف كلمة مرور أو اجعله يختفي بعد أول فتح.', 'Salin tautan unik dengan sekali ketuk. Tambahkan kata sandi atau hapus setelah dibuka pertama kali.'],
    '03 / Vanish': ['٠٣ / اختفاء', '03 / Hilang'],
    'Set the timer and move on': ['حدد المدة وانتهى الأمر', 'Atur waktunya lalu lanjutkan'],
    'Pick one hour, one day, or a week. Once it expires, the share page stops serving the content.': ['اختر ساعة أو يومًا أو أسبوعًا. عند انتهاء المدة، تتوقف صفحة المشاركة عن عرض المحتوى.', 'Pilih satu jam, satu hari, atau satu minggu. Setelah kedaluwarsa, halaman berbagi berhenti menampilkan konten.'],
    'A lighter way to share': ['طريقة أسهل للمشاركة', 'Cara berbagi yang lebih ringan'],
    'Made for sharing.': ['للمشاركة فقط.', 'Dibuat untuk berbagi.'],
    'Not for keeping tabs on you.': ['مش لمتابعتك أو تتبعك.', 'Bukan untuk melacak aktivitasmu.'],
    'Linkora works without an account. Your link is the key: only people you share it with can find the drop. Add a password when a link needs another layer.': ['يعمل Linkora دون حساب. الرابط هو المفتاح: من ترسله إليهم هم فقط من يستطيعون فتح المشاركة. أضف كلمة مرور عند الحاجة إلى حماية إضافية.', 'Linkora berfungsi tanpa akun. Tautan adalah kuncinya: hanya orang yang kamu kirimi yang dapat membuka tautan tersebut. Tambahkan kata sandi untuk perlindungan ekstra.'],
    'No email, profile, or sign-in required': ['لا بريد إلكتروني ولا ملف شخصي ولا تسجيل دخول', 'Tanpa email, profil, atau login'],
    'Optional password protection and burn-after-reading': ['حماية اختيارية بكلمة مرور وحذف بعد القراءة', 'Perlindungan kata sandi dan hapus setelah dibaca (opsional)'],
    'Expired links stop showing notes and files': ['الروابط المنتهية تتوقف عن عرض الملاحظات والملفات', 'Tautan kedaluwarsa berhenti menampilkan catatan dan file'],
    'File downloads are checked by the share link before delivery': ['يُتحقق من رابط المشاركة قبل تنزيل الملف', 'Unduhan file diverifikasi melalui tautan berbagi'],
    'Core features': ['المميزات الأساسية', 'Fitur utama'],
    'Everything you need.': ['كل ما تحتاجه.', 'Semua yang kamu butuhkan.'],
    'Nothing to sign into.': ['دون الحاجة لتسجيل الدخول.', 'Tanpa perlu login.'],
    'Simple controls for the moments when a regular attachment is too much.': ['أدوات بسيطة عندما لا يكون إرسال ملف عادي هو الحل.', 'Kontrol sederhana saat lampiran biasa terasa kurang praktis.'],
    'Temporary file links': ['روابط ملفات مؤقتة', 'Tautan file sementara'],
    'Share one file up to 25 MB, with a clear link and expiry timer.': ['شارك ملفًا واحدًا حتى 25 ميغابايت برابط واضح ووقت انتهاء محدد.', 'Bagikan satu file hingga 25 MB dengan tautan dan waktu kedaluwarsa yang jelas.'],
    'Private notes': ['ملاحظات خاصة', 'Catatan privat'],
    'Pass a code snippet, address, or short message that does not need a long home.': ['أرسل مقطع كود أو عنوانًا أو رسالة قصيرة لا تحتاج إلى بقاء طويل.', 'Kirim potongan kode, alamat, atau pesan singkat yang tidak perlu disimpan lama.'],
    'Your expiry window': ['مدة الصلاحية حسب اختيارك', 'Atur masa berlaku'],
    'Choose an hour, a day, or seven days. See the remaining time on the share page.': ['اختر ساعة أو يومًا أو سبعة أيام. راجع الوقت المتبقي في صفحة المشاركة.', 'Pilih satu jam, satu hari, atau tujuh hari. Lihat sisa waktunya di halaman berbagi.'],
    'Burn after reading': ['يختفي بعد القراءة', 'Hapus setelah dibaca'],
    'Let the first successful open use up the link. Handy for one-time handoffs.': ['اجعل أول فتح ناجح يستهلك الرابط. مناسب للمشاركة لمرة واحدة.', 'Jadikan pembukaan pertama sebagai penggunaan terakhir tautan. Cocok untuk berbagi sekali.'],
    'Optional password': ['كلمة مرور اختيارية', 'Kata sandi opsional'],
    'Add a second layer for people who have the link but should not open it alone.': ['أضف طبقة حماية لمن لديهم الرابط لكنهم يحتاجون كلمة مرور.', 'Tambahkan lapisan keamanan bagi pemegang tautan dengan kata sandi.'],
    'Views & QR': ['المشاهدات وQR', 'Jumlah buka & QR'],
    'See the number of opens and show a QR code for sharing face to face.': ['اعرف عدد مرات الفتح وشارك الرابط برمز QR وجهًا لوجه.', 'Lihat jumlah pembukaan dan tampilkan kode QR untuk berbagi langsung.'],
    'Ready when you are': ['جاهز وقت ما تحب', 'Siap kapan saja'],
    'Drop it. Share it. Done.': ['أرسلها. شاركها. وانتهى.', 'Taruh. Bagikan. Selesai.'],
    'Your next temporary link is one click away. No account to make and no inbox to check.': ['رابطك المؤقت التالي على بُعد نقرة. بلا حساب ولا بريد تنتظره.', 'Tautan sementaramu berikutnya hanya satu klik. Tanpa akun dan tanpa email.'],
    'Make your first drop': ['أنشئ أول مشاركة', 'Buat tautan pertamamu'],
    'Linkora / web': ['Linkora / ويب', 'Linkora / web'],
    'Make a drop.': ['أنشئ مشاركة.', 'Buat tautan.'],
    'Pick what you want to share, then set how long it stays around.': ['اختر ما تريد مشاركته، ثم حدد مدة بقائه.', 'Pilih yang ingin dibagikan, lalu atur berapa lama tautannya aktif.'],
    'No account needed': ['لا حاجة لحساب', 'Tidak perlu akun'],
    'What do you want to share?': ['ماذا تريد أن تشارك؟', 'Apa yang ingin kamu bagikan?'],
    'A note': ['ملاحظة', 'Catatan'],
    'A file': ['ملف', 'File'],
    'Your note': ['ملاحظتك', 'Catatanmu'],
    '— only share what you mean to': ['— شارك ما تقصده فقط', '— bagikan hanya yang kamu maksud'],
    'Write something to share…': ['اكتب شيئًا لمشاركته…', 'Tulis sesuatu untuk dibagikan…'],
    'Choose one file': ['اختر ملفًا واحدًا', 'Pilih satu file'],
    '— up to 25 MB': ['— حتى 25 ميغابايت', '— hingga 25 MB'],
    'Drop a file here, or click to browse': ['أسقط الملف هنا، أو اضغط لاختياره', 'Taruh file di sini, atau klik untuk memilih'],
    'One file per link · up to 25 MB': ['ملف واحد لكل رابط · حتى 25 ميغابايت', 'Satu file per tautan · hingga 25 MB'],
    'Choose a file, up to 25 MB': ['اختر ملفًا، حتى 25 ميغابايت', 'Pilih file, hingga 25 MB'],
    'File selected': ['تم اختيار الملف', 'File dipilih'],
    'Your drop is saved without an account.': ['تُحفظ مشاركتك دون حساب.', 'Tautanmu tersimpan tanpa akun.'],
    'Create share link': ['أنشئ رابط المشاركة', 'Buat tautan berbagi'],
    'Drop settings': ['إعدادات المشاركة', 'Pengaturan tautan'],
    'Link expires in': ['تنتهي صلاحية الرابط خلال', 'Tautan kedaluwarsa dalam'],
    '1 hour': ['ساعة واحدة', '1 jam'],
    '24 hours': ['24 ساعة', '24 jam'],
    '7 days': ['7 أيام', '7 hari'],
    'After the timer ends, this share link can no longer open the content.': ['بعد انتهاء الوقت، لن يفتح رابط المشاركة المحتوى.', 'Setelah waktunya habis, tautan ini tidak dapat membuka konten lagi.'],
    'The first successful open uses up this link.': ['أول فتح ناجح يستهلك هذا الرابط.', 'Pembukaan pertama yang berhasil akan menghabiskan tautan ini.'],
    'Add a password': ['أضف كلمة مرور', 'Tambahkan kata sandi'],
    'Only people with the link and password can open it.': ['لا يمكن فتح الرابط إلا لمن يملكونه وكلمة المرور.', 'Hanya orang dengan tautan dan kata sandi yang dapat membukanya.'],
    'At least 4 characters': ['4 أحرف على الأقل', 'Minimal 4 karakter'],
    'Link holders can open a drop.': ['كل من لديه الرابط يمكنه فتح المشاركة.', 'Siapa pun yang memiliki tautan dapat membuka isinya.'],
    'Share your URL carefully. Expired links stop serving content; uploaded file bytes may remain in storage after expiry.': ['شارك الرابط بحذر. تتوقف الروابط المنتهية عن عرض المحتوى، لكن قد يبقى الملف المخزن بعد انتهاء الرابط.', 'Bagikan URL dengan hati-hati. Tautan kedaluwarsa berhenti menampilkan konten; file yang diunggah mungkin tetap tersimpan.'],
    'Your link is ready.': ['رابطك جاهز.', 'Tautanmu siap.'],
    'Share it with someone you trust.': ['شاركه مع شخص تثق به.', 'Bagikan kepada orang yang kamu percaya.'],
    'Copy': ['نسخ', 'Salin'],
    'Open share page': ['افتح صفحة المشاركة', 'Buka halaman berbagi'],
    'QR code for your share link': ['رمز QR لرابط المشاركة', 'Kode QR untuk tautan berbagi'],
    'QR code for this share link': ['رمز QR لرابط المشاركة هذا', 'Kode QR untuk tautan ini'],
    'Want the overview first? Back to Linkora': ['تريد نظرة عامة؟ عُد إلى Linkora', 'Ingin melihat ringkasan? Kembali ke Linkora'],
    'Want the overview first?': ['تريد نظرة عامة؟', 'Ingin melihat ringkasan?'],
    'Back to Linkora ↗': ['عُد إلى Linkora ↗', 'Kembali ke Linkora ↗'],
    'Files must be 25 MB or smaller.': ['يجب ألا يتجاوز حجم الملف 25 ميغابايت.', 'Ukuran file maksimal 25 MB.'],
    'Write a note before creating your link.': ['اكتب ملاحظة قبل إنشاء الرابط.', 'Tulis catatan sebelum membuat tautan.'],
    'Choose a file before creating your link.': ['اختر ملفًا قبل إنشاء الرابط.', 'Pilih file sebelum membuat tautan.'],
    'Use at least 4 characters for the optional password.': ['استخدم 4 أحرف على الأقل لكلمة المرور.', 'Kata sandi harus terdiri dari minimal 4 karakter.'],
    'Creating…': ['جارٍ الإنشاء…', 'Membuat…'],
    'Preparing your drop…': ['جارٍ تجهيز المشاركة…', 'Menyiapkan drop…'],
    'Uploading your file…': ['جارٍ رفع الملف…', 'Mengunggah file…'],
    'Creating your note…': ['جارٍ إنشاء الملاحظة…', 'Membuat catatan…'],
    'Ready to share': ['جاهز للمشاركة', 'Siap dibagikan'],
    'Your drop could not be created. Please try again.': ['تعذر إنشاء المشاركة. حاول مرة أخرى.', 'Drop tidak dapat dibuat. Silakan coba lagi.'],
    'Connection lost. Check your internet and try again.': ['انقطع الاتصال. تحقق من الإنترنت وحاول مرة أخرى.', 'Koneksi terputus. Periksa internet lalu coba lagi.'],
    'Password protected': ['محمي بكلمة مرور', 'Dilindungi kata sandi'],
    'Burns after first open': ['يُستهلك بعد أول فتح', 'Hapus setelah dibuka pertama kali'],
    'Expires': ['ينتهي في', 'Kedaluwarsa'],
    'Share link copied.': ['تم نسخ رابط المشاركة.', 'Tautan berbagi berhasil disalin.'],
    'Could not copy automatically. Select and copy the link.': ['تعذر النسخ تلقائيًا. حدد الرابط وانسخه.', 'Tidak dapat menyalin otomatis. Pilih lalu salin tautannya.'],
    'Opening your drop…': ['جارٍ فتح المشاركة…', 'Membuka drop…'],
    'This link could not be opened.': ['تعذر فتح هذا الرابط.', 'Tautan ini tidak dapat dibuka.'],
    'We could not connect to Linkora. Check your connection and try again.': ['تعذر الاتصال بـ Linkora. تحقق من اتصالك وحاول مرة أخرى.', 'Tidak dapat terhubung ke Linkora. Periksa koneksi lalu coba lagi.'],
    'A private note': ['ملاحظة خاصة', 'Catatan privat'],
    'A note for you': ['ملاحظة لك', 'Catatan untukmu'],
    'Your drop is ready': ['مشاركتك جاهزة', 'Tautanmu siap'],
    'Linkora / private share': ['Linkora / مشاركة خاصة', 'Linkora / tautan pribadi'],
    'This link is ready. Open it when you are ready to view the shared content.': ['الرابط جاهز. افتحه عندما تكون مستعدًا لعرض المحتوى.', 'Tautan siap. Buka saat kamu siap melihat konten yang dibagikan.'],
    'A file is waiting': ['هناك ملف بانتظارك', 'Ada file untukmu'],
    'A note is waiting': ['هناك ملاحظة بانتظارك', 'Ada catatan untukmu'],
    'opens once': ['يفتح مرة واحدة', 'dibuka satu kali'],
    'Open drop': ['افتح المشاركة', 'Buka tautan'],
    'This drop is no longer available.': ['هذه المشاركة لم تعد متاحة.', 'Tautan ini sudah tidak tersedia.'],
    'This drop could not be opened.': ['تعذر فتح هذه المشاركة.', 'Tautan ini tidak dapat dibuka.'],
    'Connection lost. Please try again.': ['انقطع الاتصال. حاول مرة أخرى.', 'Koneksi terputus. Silakan coba lagi.'],
    'Secure drop': ['مشاركة آمنة', 'Tautan aman'],
    'Secure drop opened': ['تم فتح المشاركة الآمنة', 'Tautan aman telah dibuka'],
    'Linkora / protected share': ['Linkora / مشاركة محمية', 'Linkora / tautan terlindungi'],
    'This share needs its password before it can open.': ['تحتاج هذه المشاركة إلى كلمة المرور لفتحها.', 'Masukkan kata sandi untuk membuka tautan ini.'],
    'Ask the person who sent you this link for the password.': ['اطلب كلمة المرور من الشخص الذي أرسل لك الرابط.', 'Minta kata sandi kepada orang yang mengirim tautan ini.'],
    'Password': ['كلمة المرور', 'Kata sandi'],
    'Enter the password': ['أدخل كلمة المرور', 'Masukkan kata sandi'],
    'That password did not work.': ['كلمة المرور غير صحيحة.', 'Kata sandi tidak cocok.'],
    'A private drop': ['مشاركة خاصة', 'Tautan pribadi'],
    'Shared file': ['ملف مشترك', 'File bersama'],
    'Shared with Linkora — no account needed.': ['تمت مشاركته عبر Linkora — دون الحاجة إلى حساب.', 'Dibagikan dengan Linkora — tidak perlu akun.'],
    'File': ['ملف', 'Berkas'],
    'Download': ['تنزيل', 'Unduh'],
    'open': ['فتح', 'dibuka'],
    'opens': ['مرات فتح', 'kali dibuka'],
    'Open once': ['يفتح مرة واحدة', 'Buka satu kali'],
    'Link ends': ['ينتهي الرابط في', 'Tautan berakhir pada'],
    'Copy share link': ['انسخ رابط المشاركة', 'Salin tautan berbagi'],
    'Keep this link private. Expired links stop serving the content. Uploaded file bytes can remain in storage after a link expires.': ['حافظ على خصوصية الرابط. تتوقف الروابط المنتهية عن عرض المحتوى، لكن قد يظل الملف مخزنًا بعد انتهاء الرابط.', 'Jaga kerahasiaan tautan ini. Tautan kedaluwarsa berhenti menampilkan konten, tetapi file mungkin tetap tersimpan.'],
    'Already opened': ['تم فتحها بالفعل', 'Sudah dibuka'],
    'This drop has expired': ['انتهت صلاحية هذه المشاركة', 'Tautan ini sudah kedaluwarsa'],
    'Drop not found': ['المشاركة غير موجودة', 'Tautan tidak ditemukan'],
    'Could not open this drop': ['تعذر فتح المشاركة', 'Tautan tidak dapat dibuka'],
    'Make a new drop': ['أنشئ مشاركة جديدة', 'Buat tautan baru'],
    'The page you are looking for does not exist.': ['الصفحة التي تبحث عنها غير موجودة.', 'Halaman yang kamu cari tidak ditemukan.'],
    'Choose a valid expiry time.': ['اختر مدة صلاحية صحيحة.', 'Pilih masa berlaku yang valid.'],
    'Choose either a note or a file.': ['اختر ملاحظة أو ملفًا فقط.', 'Pilih catatan atau file saja.'],
    'Notes can be up to 20,000 characters.': ['يمكن أن تصل الملاحظة إلى 20,000 حرف.', 'Catatan dapat berisi hingga 20.000 karakter.'],
    'The file could not be uploaded. Please try again.': ['تعذر رفع الملف. حاول مرة أخرى.', 'File tidak dapat diunggah. Silakan coba lagi.'],
    'Share one file at a time.': ['شارك ملفًا واحدًا في كل مرة.', 'Bagikan satu file setiap kali.'],
    'File storage is temporarily unavailable. You can still share a note.': ['التخزين غير متاح مؤقتًا. ما زال بإمكانك مشاركة ملاحظة.', 'Penyimpanan file sementara tidak tersedia. Kamu tetap dapat berbagi catatan.'],
    'File storage is temporarily unavailable.': ['التخزين غير متاح مؤقتًا.', 'Penyimpanan file sementara tidak tersedia.'],
    'Linkora is getting ready. Please try again in a moment.': ['Linkora قيد التجهيز. حاول مرة أخرى بعد قليل.', 'Linkora sedang disiapkan. Coba lagi sebentar.'],
    'This link does not exist.': ['هذا الرابط غير موجود.', 'Tautan ini tidak ditemukan.'],
    'This drop has already been opened.': ['تم فتح هذه المشاركة بالفعل.', 'Tautan ini sudah dibuka.'],
    'Too many password attempts. Please try again in 15 minutes.': ['محاولات كثيرة لكلمة المرور. حاول بعد 15 دقيقة.', 'Terlalu banyak percobaan kata sandi. Coba lagi dalam 15 menit.'],
    'That password is not correct.': ['كلمة المرور غير صحيحة.', 'Kata sandi salah.'],
    'Open the share link again to request a fresh download.': ['افتح رابط المشاركة مجددًا لطلب تنزيل جديد.', 'Buka tautan berbagi lagi untuk meminta unduhan baru.'],
    'This one-time download has already been used.': ['تم استخدام هذا التنزيل لمرة واحدة بالفعل.', 'Unduhan sekali pakai ini sudah digunakan.'],
    'The shared file could not be found.': ['تعذر العثور على الملف المشترك.', 'File yang dibagikan tidak ditemukan.'],
    'The file is temporarily unavailable.': ['الملف غير متاح مؤقتًا.', 'File sementara tidak tersedia.'],
    'The file could not be downloaded.': ['تعذر تنزيل الملف.', 'File tidak dapat diunduh.'],
    'API route not found.': ['مسار API غير موجود.', 'Rute API tidak ditemukan.'],
    'The request could not be processed.': ['تعذر معالجة الطلب.', 'Permintaan tidak dapat diproses.'],
    'Language': ['اللغة', 'Bahasa'],
    'Expired': ['منتهي الصلاحية', 'Kedaluwarsa'],
    'English': ['الإنجليزية', 'English'],
    'العربية': ['العربية', 'العربية'],
    'Bahasa Indonesia': ['الإندونيسية', 'Bahasa Indonesia'],
    'Developed by': ['تطوير', 'Dikembangkan oleh'],
    'Arabic': ['العربية', 'Bahasa Arab'],
    'Indonesian': ['الإندونيسية', 'Bahasa Indonesia'],
    'English language': ['اللغة الإنجليزية', 'Bahasa Inggris'],
    'Arabic language': ['اللغة العربية', 'Bahasa Arab'],
    'Indonesian language': ['اللغة الإندونيسية', 'Bahasa Indonesia'],
    'Choose your language': ['اختر لغة الموقع', 'Pilih bahasa situs'],
    'Choose the language you want to use across Linkora.': ['اختر اللغة التي تريد استخدامها في Linkora.', 'Pilih bahasa yang ingin digunakan di Linkora.'],
    'Your device language is selected automatically on your first visit.': ['تُختار لغة جهازك تلقائيًا عند زيارتك الأولى.', 'Bahasa perangkat dipilih otomatis saat kunjungan pertama.'],
    'LINKORA PREFERENCES': ['تفضيلات LINKORA', 'PREFERENSI LINKORA'],
    'Choose how long this share link stays available.': ['اختر مدة بقاء رابط المشاركة متاحًا.', 'Pilih berapa lama tautan berbagi ini tetap tersedia.'],
    'Link expiration': ['مدة صلاحية الرابط', 'Masa berlaku tautan'],
    'Selected expiry': ['مدة الصلاحية', 'Masa berlaku'],
    'Available for one hour': ['متاح لمدة ساعة واحدة', 'Tersedia selama satu jam'],
    'Available for one day': ['متاح لمدة يوم واحد', 'Tersedia selama satu hari'],
    'Available for seven days': ['متاح لمدة سبعة أيام', 'Tersedia selama tujuh hari'],
    'Close dialog': ['إغلاق النافذة', 'Tutup dialog'],
  };

  const codes = ['en', 'ar', 'id'];
  const locales = { en: 'en-US', ar: 'ar', id: 'id-ID' };
  let language = 'en';
  const textOriginals = new WeakMap();
  const attrOriginals = new WeakMap();

  function validLanguage(value) {
    return codes.includes(value) ? value : null;
  }

  function getDeviceLanguage() {
    const preferences = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language || navigator.userLanguage || 'en'];
    for (const preference of preferences) {
      const baseLanguage = String(preference).trim().toLowerCase().split(/[-_]/)[0];
      const match = validLanguage(baseLanguage);
      if (match) return match;
    }
    return 'en';
  }

  function getInitialLanguage() {
    const queryLanguage = validLanguage(new URLSearchParams(window.location.search).get('lang'));
    if (queryLanguage) {
      try { localStorage.setItem('linkora-language', queryLanguage); } catch { /* private browsing may disable storage */ }
      return queryLanguage;
    }
    try {
      const savedLanguage = validLanguage(localStorage.getItem('linkora-language')) || validLanguage(localStorage.getItem('droplink-language'));
      if (savedLanguage) {
        if (!localStorage.getItem('linkora-language')) localStorage.setItem('linkora-language', savedLanguage);
        return savedLanguage;
      }
    } catch { /* private browsing may disable storage */ }
    return getDeviceLanguage();
  }

  function updateDocument() {
    const html = document.documentElement;
    html.lang = language;
    html.dir = language === 'ar' ? 'rtl' : 'ltr';
    const languageButton = document.getElementById('language-current');
    if (languageButton) languageButton.textContent = { en: 'English', ar: 'العربية', id: 'Bahasa Indonesia' }[language];
    const languageTrigger = document.getElementById('language-trigger');
    if (languageTrigger) languageTrigger.setAttribute('aria-label', translate('Choose language'));
    document.getElementById('picker-close')?.setAttribute('aria-label', translate('Close dialog'));
    const locale = locales[language];
    document.title = translate('Linkora — Drop. Share. Simplify.');
    document.querySelector('meta[name="description"]')?.setAttribute('content', translate('Share files and notes that disappear when the timer runs out. No account needed.'));
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', translate('Share files and notes that disappear when the timer runs out. No account needed.'));
    document.querySelector('meta[name="content-language"]')?.setAttribute('content', language);
    document.documentElement.dataset.locale = locale;
  }

  function translate(value) {
    const entry = phrases[String(value ?? '').trim()];
    if (!entry) return String(value ?? '');
    if (language === 'ar') return entry[0];
    if (language === 'id') return entry[1];
    return String(value ?? '');
  }

  function translateTree(target) {
    if (!target) return;
    const owner = target.nodeType === Node.ELEMENT_NODE ? target : target.parentElement;
    if (owner?.matches?.('textarea, input, #language-switch, #language-current, #picker-dialog, script, style, pre, .brand-wordmark, .note-content, .file-info, #file-name, .result-link, [data-copy-raw]')) return;
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const parent = node.parentElement;
      if (!parent || parent.closest('textarea, input, #language-switch, #language-current, #picker-dialog, script, style, pre, .brand-wordmark, .note-content, .file-info, #file-name, .result-link, [data-copy-raw]')) continue;
      const source = textOriginals.get(node) ?? node.nodeValue;
      textOriginals.set(node, source);
      const trimmed = source.trim();
      const translated = translate(trimmed);
      if (translated !== trimmed) {
        const prefix = source.match(/^\s*/)?.[0] || '';
        const suffix = source.match(/\s*$/)?.[0] || '';
        const next = `${prefix}${translated}${suffix}`;
        if (node.nodeValue !== next) node.nodeValue = next;
      }
    }
    const elements = target.nodeType === Node.ELEMENT_NODE ? [target, ...target.querySelectorAll('*')] : [];
    for (const element of elements) {
      if (element.matches('#language-switch, #language-current, #picker-dialog, script, style, .note-content, .file-info, #file-name, .result-link, [data-copy-raw]')) continue;
      let originals = attrOriginals.get(element);
      if (!originals) { originals = {}; attrOriginals.set(element, originals); }
      for (const attribute of ['aria-label', 'placeholder', 'alt', 'title']) {
        if (!element.hasAttribute(attribute)) continue;
        if (!(attribute in originals)) originals[attribute] = element.getAttribute(attribute);
        const source = originals[attribute];
        const result = translate(source);
        if (element.getAttribute(attribute) !== result) element.setAttribute(attribute, result);
      }
    }
  }

  function setLanguage(value) {
    const next = validLanguage(value) || 'en';
    language = next;
    try { localStorage.setItem('linkora-language', next); } catch { /* private browsing may disable storage */ }
    updateDocument();
    translateTree(document.body);
    document.dispatchEvent(new CustomEvent('linkora-language-change', { detail: { language: next } }));
  }

  language = getInitialLanguage();
  updateDocument();
  document.addEventListener('DOMContentLoaded', () => {
    translateTree(document.body);
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) translateTree(node);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }, { once: true });

  window.LinkoraI18n = {
    translate,
    translateTree,
    setLanguage,
    getLanguage: () => language,
    getLocale: () => locales[language],
    formatNumber: (value) => new Intl.NumberFormat(locales[language]).format(value),
  };
})();
