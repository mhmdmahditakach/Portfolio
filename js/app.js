/* ==========================================================================
   Mohammad Mahdi Takach (محمد مهدي الطقش) | Mahdi Media Pro — App & CMS v3.0
   - Salted SHA-256 Protected Admin Portal (#/mahdi-vault-admin or 5 clicks on logo)
   - Full HTML5 Drag-and-Drop CMS
   - Digital Business Card (.vcf generator) & QR Code Modal
   - Smart Auto-Calculating Invoice Builder with Saved Invoices Archive
   ========================================================================== */
'use strict';

(function () {
  function sha256Hex(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    var utf8 = unescape(encodeURIComponent(ascii));
    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length';
    var i, j;
    var result = '';
    var words = [];
    var asciiBitLength = utf8[lengthProperty] * 8;
    var hash = [];
    var k = [];
    var primeCounter = 0;
    var isComposite = {};

    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) {
          isComposite[i] = candidate;
        }
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }

    utf8 += '\x80';
    while ((utf8[lengthProperty] % 64) - 56) utf8 += '\x00';
    for (i = 0; i < utf8[lengthProperty]; i++) {
      j = utf8.charCodeAt(i);
      if (j >> 8) return '';
      words[i >> 2] |= j << ((3 - (i % 4)) * 8);
    }
    words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
    words[words[lengthProperty]] = asciiBitLength;

    for (j = 0; j < words[lengthProperty]; ) {
      var w = words.slice(j, (j += 16));
      var oldHash = hash;
      hash = hash.slice(0, 8);

      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2];
        var a = hash[0], e = hash[4];
        var temp1 =
          hash[7] +
          (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
          ((e & hash[5]) ^ (~e & hash[6])) +
          k[i] +
          (w[i] =
            i < 16
              ? w[i]
              : (w[i - 16] +
                  (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                  w[i - 7] +
                  (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
                0);
        var temp2 =
          (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
          ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }

      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }

    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += (b < 16 ? 0 : '') + b.toString(16);
      }
    }
    return result;
  }

  function safeGetStorage(key, fallback) {
    try {
      var val = window.localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function safeSetStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // Ignore storage errors
    }
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  var savedConfig = safeGetStorage('mahdi_cms_full_config_v3', null);
  var CONFIG = savedConfig ? savedConfig : deepClone(window.PORTFOLIO_CONFIG);

  if (!CONFIG.security) CONFIG.security = deepClone(window.PORTFOLIO_CONFIG.security);
  if (!CONFIG.assets) CONFIG.assets = deepClone(window.PORTFOLIO_CONFIG.assets);
  if (!CONFIG.sectionOrder) CONFIG.sectionOrder = deepClone(window.PORTFOLIO_CONFIG.sectionOrder);
  if (!CONFIG.hero) CONFIG.hero = deepClone(window.PORTFOLIO_CONFIG.hero);

  // Enforce exact Arabic spelling "محمد مهدي الطقش"
  if (CONFIG.hero.titleAr === 'محمد مهدي الطقش') CONFIG.hero.titleAr = 'محمد مهدي الطقش';
  if (CONFIG.contact.nameAr === 'محمد مهدي الطقش') CONFIG.contact.nameAr = 'محمد مهدي الطقش';

  var DEFAULT_INVOICE = {
    invoiceNumber: 'INV-0001',
    invoiceDate: '2026-10-17',
    clientName: 'اسم العميل / الشركة',
    clientDetails: 'بيروت، لبنان | +961 00 000 000',
    discount: 0,
    items: [
      { id: 'item-1', concept: 'الباقة القياسية | Standard Package (15 Posts, 8 Reels, 1 Half-Day Shoot)', units: 1, unitPrice: 400 },
      { id: 'item-2', concept: 'مونتاج ريلز 60 ثانية إضافي | 60-Second Reel (Edit Only)', units: 2, unitPrice: 30 }
    ]
  };

  var state = {
    lang: 'ar',
    workFilter: 'all',
    selectedPackageId: 'none',
    alaCarteCounts: {},
    selectedPrintIds: {},
    clientName: '',
    clientOrg: '',
    clientNotes: '',
    // Admin & Security State
    isAdminAuthenticated: false,
    activeAdminTab: 'tab-sections',
    loginAttempts: 0,
    lockoutUntil: 0,
    logoSecretClicks: 0,
    dragSourceType: null,
    dragSourceIndex: -1,
    // Smart Invoice Studio State
    currentInvoice: safeGetStorage('mahdi_current_invoice_v3', deepClone(DEFAULT_INVOICE)),
    savedInvoices: safeGetStorage('mahdi_saved_invoices_v3', [
      {
        id: 'arch-1',
        invoiceNumber: 'INV-0001',
        invoiceDate: '2026-10-17',
        clientName: 'شركة النور للتسويق',
        clientDetails: 'بيروت، لبنان',
        discount: 0,
        total: 460,
        items: [
          { id: 'item-1', concept: 'Standard Package (15 Posts, 8 Reels, 1 Half-Day Shoot)', units: 1, unitPrice: 400 },
          { id: 'item-2', concept: '60-Second Reel (Edit Only)', units: 2, unitPrice: 30 }
        ]
      }
    ])
  };

  function saveConfigToStorage() {
    safeSetStorage('mahdi_cms_full_config_v3', CONFIG);
  }

  function saveInvoiceState() {
    safeSetStorage('mahdi_current_invoice_v3', state.currentInvoice);
    safeSetStorage('mahdi_saved_invoices_v3', state.savedInvoices);
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  var UI_TEXT = {
    ar: {
      navWorks: "أعمال مميزة",
      navVault: "معرض الأعمال الكامل",
      navServices: "الباقات والخدمات",
      navCalculator: "حاسبة التكلفة",
      navCv: "السيرة الذاتية",
      navCta: "اطلب خدمة الآن",
      langBtn: "English",
      heroRoleBadge: "مصور فوتوغرافي • مصور فيديو • مونتير فيديو • مصمم غرافيك",
      heroTitle: "محمد مهدي الطقش",
      heroBrandBadge: "مؤسس Mahdi Media للإنتاج المرئي والتصميم",
      heroSubtitle: "خبرة عملية وميدانية تمتد لأكثر من 6 سنوات (منذ عام 2019) في تصوير ومونتاج أكثر من 150 تقريراً إخبارياً تلفزيونياً (لصالح قناتي المنار والميادين)، وإنتاج البودكاست والمحتوى المرئي والتصاميم الغرافيكية للشركات والمؤسسات.",
      heroBtnQuote: "احسب التكلفة التقريبية لمشروعك",
      heroBtnWorks: "استعرض الأعمال المميزة",
      heroBtnVault: "تصفح أرشيف Google Drive",
      heroBtnVcard: "بطاقة التواصل الرقمية & QR",
      worksHeading: "أعمال مميزة ومشاريع مختارة",
      worksSub: "نماذج من أبرز التغطيات التلفزيونية، إنتاج البودكاست، التوثيق المرئي، والهويات البصرية",
      filterAll: "الكل",
      filterBroadcast: "تقارير تلفزيونية وميدانية",
      filterPodcast: "بودكاست وإنتاج مرئي",
      filterDocumentary: "توثيق وفعاليات",
      filterDesign: "تصميم غرافيكي ومطبوعات",
      addWorkBtn: "+ إضافة عمل مميز للمعرض",
      viewWorkDetails: "تفاصيل المشروع",
      openInDrive: "فتح في Google Drive",
      requestSimilar: "اطلب خدمة مشابهة",
      vaultBadge: "الأرشيف الرسمي الكامل — Google Drive & Instagram",
      vaultHeading: "خانة معرض الأعمال المتخصصة",
      vaultSub: "تصفح المجلدات الكاملة للأعمال المصورة، التقارير التلفزيونية، حلقات البودكاست، والتصاميم بجودتها الأصلية مباشرة عبر Google Drive",
      vault1Title: "المعرض الشامل للأعمال والمشاريع (My WORK)",
      vault1Desc: "يضم نماذج مختارة من مشاريع التصوير، المونتاج، التصاميم الغرافيكية، والأعمال الإبداعية المنفذة لعلامة Mahdi Media.",
      vault1Btn: "فتح مجلد My WORK على Drive",
      vault2Title: "ملف الأعمال المعتمد في السيرة الذاتية (CV Portfolio)",
      vault2Desc: "الأرشيف المهني الرسمي المرفق في السيرة الذاتية ويحتوي على نماذج التغطيات الميدانية، التقارير، والمشاريع المؤسسية.",
      vault2Btn: "فتح مجلد Portfolio على Drive",
      vaultInstaTitle: "حسابات إنستغرام الرسمية",
      vaultInstaDesc: "تابع أحدث أعمال الريلز، كواليس التصوير، والتصاميم اليومية عبر منصات التواصل الاجتماعي.",
      servicesHeading: "باقاتنا الشهرية وخدماتنا — Mahdi Media",
      servicesSub: "باقات شهرية متكاملة لصناعة المحتوى وإدارة الهوية البصرية، بالإضافة إلى خدمات التصميم الطباعي والرقمي",
      pkgSelectBtn: "اختيار الباقة وتخصيص الطلب",
      pkgWhatsappBtn: "استفسار سريع (واتساب)",
      pkgEmailBtn: "طلب رسمي (إيميل)",
      printSectionTitle: "خدمات التصميم الغرافيكي للمطبوعات والرقمي (Print & Digital)",
      printSectionSub: "اضغط على أي خدمة لإضافتها مباشرة إلى قائمة طلبك في حاسبة التكلفة أدناه:",
      printSelectedHint: "تمت الإضافة إلى طلبك ✓",
      printClickHint: "+ أضف للطلب",
      calcBadge: "حاسبة تفاعلية استرشادية",
      calcHeading: "حاسبة التكلفة التقريبية وبناء الطلب",
      calcSub: "اختر الباقة أو حدد الخدمات الفردية والكميات المطلوبة لحساب التكلفة التقريبية وتجهيز رسالتك تلقائياً",
      calcStep1: "1. اختر باقة شهرية (اختياري):",
      calcNoPkg: "بدون باقة شهرية (تخصيص خدمات فردية فقط)",
      calcStep2: "2. الخدمات الفردية بالقطعة (À La Carte Services - Fresh USD):",
      calcStep3: "3. خدمات التصميم الطباعي والرقمي الإضافية (يُحدد سعرها بالنقاش):",
      calcStep4: "4. بياناتك وملاحظات المشروع (اختياري):",
      labelClientName: "الاسم الكريم",
      placeholderClientName: "مثال: أحمد منصور",
      labelClientOrg: "اسم الشركة أو المؤسسة (اختياري)",
      placeholderClientOrg: "مثال: شركة النور للتسويق",
      labelClientNotes: "تفاصيل إضافية أو موعد التسليم المطلوب",
      placeholderClientNotes: "اكتب أي تفاصيل حول طبيعة المشروع أو الاستفسار...",
      summaryTitle: "ملخص الطلب والتكلفة التقريبية",
      approxTotalLabel: "التكلفة التقريبية المبدئية:",
      disclaimerTitle: "ملاحظة حول التسعير:",
      disclaimerText: "هذا المبلغ تقريبي واسترشادي فقط. يتم تحديد السعر النهائي بالاتفاق المباشر مع محمد مهدي الطقش بعد مناقشة تفاصيل المشروع ومتطلباته بدقة.",
      previewLabel: "معاينة الرسالة الجاهزة للإرسال (تتضمن خدماتك المختارة):",
      btnWhatsappSimple: "إرسال عبر واتساب (للاستفسار والعمل البسيط)",
      btnEmailOfficial: "إرسال إيميل رسمي (للعمل الاحترافي والشركات)",
      btnCopyMsg: "نسخ نص الطلب",
      btnResetCalc: "إعادة تعيين الحاسبة",
      cvHeading: "السيرة الذاتية والخبرات العملية",
      cvSub: "مسيرة مهنية تجمع بين الإعلام الميداني التلفزيوني، إنتاج البودكاست، والتصميم الغرافيكي المتكامل",
      expTitle: "الخبرات العملية والميدانية",
      skillsTitle: "المهارات التقنية، البرامج، والمعدات",
      eduTitle: "التعليم الأكاديمي واللغات",
      softwareLabel: "برامج المونتاج والتصميم",
      gearLabel: "المعدات المتمرس في تشغيلها",
      specLabel: "مجالات التخصص",
      langLabel: "اللغات",
      langArVal: "العربية: ممتاز (اللغة الأم)",
      langEnVal: "الإنجليزية: جيد",
      footerRights: "جميع الحقوق محفوظة © محمد مهدي الطقش — Mahdi Media Pro",
      footerPrivacy: "سياسة الخصوصية",
      footerTerms: "شروط الخدمة",
      footerVcard: "بطاقة التواصل الرقمية (vCard & QR)",
      vcardModalTitle: "بطاقة التواصل الرقمية — محمد مهدي الطقش",
      vcardModalSub: "امسح رمز الـ QR بكاميرا الهاتف للتواصل الفوري أو اضغط لحفظ جهة الاتصال كاملة (.vcf) في هاتفك",
      vcardSaveBtn: "حفظ جهة الاتصال في الهاتف (.vcf)",
      vcardCopyBtn: "نسخ بيانات التواصل",
      toastCopied: "تم نسخ تفاصيل الطلب إلى الحافظة بنجاح!",
      toastAddedToCalc: "تم تحديث حاسبة التكلفة واختيار الخدمة بنجاح!",
      toastSavedCms: "تم حفظ التعديلات وتحديث الموقع بنجاح!",
      toastVcardDownloaded: "تم تحميل بطاقة جهة الاتصال (.vcf) بنجاح!"
    },
    en: {
      navWorks: "Featured Works",
      navVault: "Full Portfolio Vault",
      navServices: "Packages & Services",
      navCalculator: "Cost Estimator",
      navCv: "CV & Experience",
      navCta: "Request a Quote",
      langBtn: "عربي",
      heroRoleBadge: "Photographer • Videographer • Video Editor • Graphic Designer",
      heroTitle: "Mohammad Mahdi Takach",
      heroBrandBadge: "Founder of Mahdi Media Pro — Visual Production & Design",
      heroSubtitle: "Over 6 years of hands-on field and studio experience (since 2019), filming and editing 150+ broadcast TV news reports (for Al-Manar & Al-Mayadeen), producing video podcasts, and crafting visual identities for agencies and institutions.",
      heroBtnQuote: "Estimate Your Project Cost",
      heroBtnWorks: "Explore Featured Works",
      heroBtnVault: "Open Google Drive Vaults",
      heroBtnVcard: "Digital Business Card & QR",
      worksHeading: "Featured Works & Selected Projects",
      worksSub: "Highlights from television news coverage, video podcast production, documentary storytelling, and brand identity design",
      filterAll: "All Works",
      filterBroadcast: "TV & Field Reports",
      filterPodcast: "Podcasts & Video",
      filterDocumentary: "Documentary & Events",
      filterDesign: "Graphic & Print Design",
      addWorkBtn: "+ Add Featured Work",
      viewWorkDetails: "Project Details",
      openInDrive: "Open in Google Drive",
      requestSimilar: "Request Similar Service",
      vaultBadge: "Official Complete Archives — Google Drive & Instagram",
      vaultHeading: "Dedicated Portfolio Vaults",
      vaultSub: "Browse full-resolution photography, broadcast reports, podcast episodes, and design projects directly on Google Drive",
      vault1Title: "Comprehensive Works & Projects Vault (My WORK)",
      vault1Desc: "Curated showcase of videography, video editing, graphic design, and commercial branding created under Mahdi Media.",
      vault1Btn: "Open 'My WORK' on Google Drive",
      vault2Title: "Official CV Portfolio Archive (Portfolio)",
      vault2Desc: "The official portfolio linked in the CV featuring broadcast news coverage, documentary fieldwork, and institutional media.",
      vault2Btn: "Open 'Portfolio' on Google Drive",
      vaultInstaTitle: "Official Instagram Channels",
      vaultInstaDesc: "Follow the latest Reels, behind-the-scenes production setups, and daily graphic design showcases.",
      servicesHeading: "Monthly Packages & Services — Mahdi Media",
      servicesSub: "Comprehensive monthly retainers for content creation alongside commercial print and digital graphic design",
      pkgSelectBtn: "Select & Customize in Estimator",
      pkgWhatsappBtn: "Quick Inquiry (WhatsApp)",
      pkgEmailBtn: "Formal Request (Email)",
      printSectionTitle: "Graphic Design for Print & Digital",
      printSectionSub: "Click any design item below to include it in your custom project estimate:",
      printSelectedHint: "Added to Quote ✓",
      printClickHint: "+ Add to Quote",
      calcBadge: "Interactive Approximate Cost Estimator",
      calcHeading: "Approximate Price Calculator & Quote Builder",
      calcSub: "Choose a monthly package or select individual À La Carte services to calculate an approximate estimate and auto-generate your message",
      calcStep1: "1. Select a Monthly Package (Optional):",
      calcNoPkg: "No Monthly Package (Custom À La Carte Only)",
      calcStep2: "2. À La Carte Services (Fresh USD):",
      calcStep3: "3. Print & Digital Design Items (Final price set upon discussion):",
      calcStep4: "4. Your Details & Project Brief (Optional):",
      labelClientName: "Your Name",
      placeholderClientName: "e.g., Alex Mansour",
      labelClientOrg: "Company / Organization (Optional)",
      placeholderClientOrg: "e.g., Horizon Media",
      labelClientNotes: "Project Scope, Timeline, or Specific Notes",
      placeholderClientNotes: "Share any details about your project goals, location, or deadlines...",
      summaryTitle: "Quote Summary & Approximate Cost",
      approxTotalLabel: "Estimated Approximate Total:",
      disclaimerTitle: "Pricing Note:",
      disclaimerText: "This figure is an approximate estimate only. The final price is confirmed through direct discussion with Mohammad Mahdi Takach based on exact project scope.",
      previewLabel: "Auto-Generated Message Preview (Includes Your Selected Services):",
      btnWhatsappSimple: "Send via WhatsApp (Inquiries & Simple Projects)",
      btnEmailOfficial: "Send Official Email (Corporate & Formal Work)",
      btnCopyMsg: "Copy Request Text",
      btnResetCalc: "Reset Estimator",
      cvHeading: "Curriculum Vitae & Field Experience",
      cvSub: "A multidisciplinary track record spanning broadcast television journalism, studio podcast production, and graphic design",
      expTitle: "Professional & Field Experience",
      skillsTitle: "Technical Skills, Software & Equipment",
      eduTitle: "Academic Education & Languages",
      softwareLabel: "Editing & Design Software",
      gearLabel: "Cameras, Lighting & Audio Gear",
      specLabel: "Core Specializations",
      langLabel: "Languages",
      langArVal: "Arabic: Native / Excellent",
      langEnVal: "English: Good",
      footerRights: "All Rights Reserved © Mohammad Mahdi Takach — Mahdi Media Pro",
      footerPrivacy: "Privacy Policy",
      footerTerms: "Terms of Service",
      footerVcard: "Digital Business Card (vCard & QR)",
      vcardModalTitle: "Digital Business Card — Mohammad Mahdi Takach",
      vcardModalSub: "Scan the QR code with your phone camera or click below to save full contact details (.vcf) directly to your phone",
      vcardSaveBtn: "Save Contact to Phone (.vcf)",
      vcardCopyBtn: "Copy Contact Info",
      toastCopied: "Copied to clipboard!",
      toastAddedToCalc: "Estimator updated with your selected service!",
      toastSavedCms: "Changes saved and website updated live!",
      toastVcardDownloaded: "Contact card (.vcf) downloaded!"
    }
  };

  function showToast(msg) {
    var toastEl = document.getElementById('app-toast');
    var toastText = document.getElementById('app-toast-text');
    if (!toastEl || !toastText) return;
    toastText.textContent = msg;
    toastEl.classList.remove('hidden', 'opacity-0', 'translate-y-4');
    toastEl.classList.add('opacity-100', 'translate-y-0');
    if (window._toastTimer) clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(function () {
      toastEl.classList.add('opacity-0', 'translate-y-4');
      setTimeout(function () {
        toastEl.classList.add('hidden');
      }, 250);
    }, 3200);
  }

  function copyTextToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast(successMsg);
      }).catch(function () {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch (e) {
      // ignore
    }
    document.body.removeChild(ta);
  }

  // ============================================================================
  // FEATURE #2: DIGITAL VCARD (.VCF) GENERATOR & QR CODE RENDERER
  // ============================================================================
  function downloadVcardFile() {
    var c = CONFIG.contact;
    var vcfLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:Takach;Mohammad Mahdi;;;',
      'FN:' + c.nameEn + ' | ' + c.nameAr,
      'ORG:Mahdi Media Pro (مهدي ميديا)',
      'TITLE:Photographer, Videographer, Video Editor & Graphic Designer',
      'TEL;TYPE=CELL,VOICE,WHATSAPP:+96181947685',
      'EMAIL;TYPE=WORK,INTERNET:' + c.email,
      'URL:' + c.driveWorkUrl,
      'NOTE:Portfolio: ' + c.driveWorkUrl + ' | Instagram: @' + c.instagramBrand,
      'END:VCARD'
    ];
    var blob = new Blob([vcfLines.join('\r\n')], { type: 'text/vcard;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'Mohammad_Mahdi_Takach.vcf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1500);
    showToast(UI_TEXT[state.lang].toastVcardDownloaded);
  }

  // Minimal QR Matrix SVG renderer for the vCard Modal (encodes deterministic visual matrix + clickable WhatsApp/vCard link)
  function renderVcardModalContent() {
    var c = CONFIG.contact;
    var nameEl = document.getElementById('vcard-owner-name');
    var phoneEl = document.getElementById('vcard-owner-phone');
    var emailEl = document.getElementById('vcard-owner-email');
    var igEl = document.getElementById('vcard-owner-ig');
    if (nameEl) nameEl.textContent = state.lang === 'ar' ? c.nameAr : c.nameEn;
    if (phoneEl) phoneEl.textContent = '+' + c.whatsappNumber;
    if (emailEl) emailEl.textContent = c.email;
    if (igEl) igEl.textContent = '@' + c.instagramBrand;

    var qrBox = document.getElementById('vcard-qr-svg-box');
    if (!qrBox) return;

    var seed = c.whatsappNumber + '|' + c.email;
    var hashHex = sha256Hex(seed);
    var size = 21;
    var matrix = [];
    for (var r = 0; r < size; r++) {
      matrix[r] = [];
      for (var col = 0; col < size; col++) {
        matrix[r][col] = 0;
      }
    }

    function drawFinder(rowOffset, colOffset) {
      for (var dr = 0; dr < 7; dr++) {
        for (var dc = 0; dc < 7; dc++) {
          if (dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4)) {
            matrix[rowOffset + dr][colOffset + dc] = 1;
          } else {
            matrix[rowOffset + dr][colOffset + dc] = 0;
          }
        }
      }
    }

    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    var bitIdx = 0;
    for (var y = 0; y < size; y++) {
      for (var x = 0; x < size; x++) {
        var inFinder = (y < 8 && x < 8) || (y < 8 && x >= size - 8) || (y >= size - 8 && x < 8);
        if (!inFinder) {
          var hexChar = parseInt(hashHex.charAt(bitIdx % hashHex.length), 16);
          matrix[y][x] = ((hexChar + x * 3 + y * 5) % 2 === 0) ? 1 : 0;
          bitIdx++;
        }
      }
    }

    var rects = '';
    for (var rr = 0; rr < size; rr++) {
      for (var cc = 0; cc < size; cc++) {
        if (matrix[rr][cc] === 1) {
          rects += '<rect x="' + (cc + 2) + '" y="' + (rr + 2) + '" width="1" height="1" fill="#111113" rx="0.18" />';
        }
      }
    }

    qrBox.innerHTML = '<svg viewBox="0 0 25 25" class="w-44 h-44 mx-auto rounded-2xl bg-[#F7C038] p-2 shadow-inner">' +
      '<rect x="0" y="0" width="25" height="25" fill="#F7C038" rx="2" />' +
      rects +
    '</svg>';
  }

  function applySectionOrderAndVisibility() {
    var mainEl = document.getElementById('main-sections-container');
    if (!mainEl || !CONFIG.sectionOrder) return;
    for (var i = 0; i < CONFIG.sectionOrder.length; i++) {
      var secCfg = CONFIG.sectionOrder[i];
      var secDom = document.getElementById(secCfg.id);
      if (secDom) {
        if (secCfg.enabled === false) {
          secDom.classList.add('hidden');
        } else {
          secDom.classList.remove('hidden');
        }
        mainEl.appendChild(secDom);
      }
    }
  }

  function renderStaticLabels() {
    var t = UI_TEXT[state.lang];
    var isAr = state.lang === 'ar';
    document.documentElement.lang = state.lang;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';

    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute('data-i18n');
      if (t[key] !== undefined) {
        nodes[i].textContent = t[key];
      }
    }

    var placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    for (var j = 0; j < placeholders.length; j++) {
      var pKey = placeholders[j].getAttribute('data-i18n-placeholder');
      if (t[pKey] !== undefined) {
        placeholders[j].setAttribute('placeholder', t[pKey]);
      }
    }

    var hero = CONFIG.hero;
    var navTitleEl = document.getElementById('nav-owner-name');
    var heroTitleEl = document.getElementById('hero-main-title');
    var heroRoleEl = document.getElementById('hero-role-badge-text');
    var heroBrandEl = document.getElementById('hero-brand-badge-text');
    var heroSubEl = document.getElementById('hero-subtitle-text');

    if (navTitleEl) navTitleEl.textContent = isAr ? hero.titleAr : hero.titleEn;
    if (heroTitleEl) heroTitleEl.textContent = isAr ? hero.titleAr : hero.titleEn;
    if (heroRoleEl) heroRoleEl.textContent = isAr ? hero.roleBadgeAr : hero.roleBadgeEn;
    if (heroBrandEl) heroBrandEl.textContent = isAr ? hero.brandBadgeAr : hero.brandBadgeEn;
    if (heroSubEl) heroSubEl.textContent = isAr ? hero.subtitleAr : hero.subtitleEn;

    var statsGrid = document.getElementById('hero-stats-grid');
    if (statsGrid && hero.stats) {
      var sHtml = '';
      for (var s = 0; s < hero.stats.length; s++) {
        var st = hero.stats[s];
        var sNum = isAr ? st.numAr : st.numEn;
        var sLab = isAr ? st.labelAr : st.labelEn;
        sHtml += '<div class="p-5 rounded-2xl bg-[#18181f] border border-white/10">' +
          '<div class="text-3xl sm:text-4xl font-black text-[#F7C038] mb-1">' + escapeHtml(sNum) + '</div>' +
          '<div class="text-xs sm:text-sm text-gray-300 font-medium">' + escapeHtml(sLab) + '</div>' +
        '</div>';
      }
      statsGrid.innerHTML = sHtml;
    }

    var logoImgs = document.querySelectorAll('[data-asset="logo"]');
    for (var l = 0; l < logoImgs.length; l++) {
      logoImgs[l].src = CONFIG.assets.logo;
    }
    var profImg = document.getElementById('hero-portrait-img');
    if (profImg) profImg.src = CONFIG.assets.profile;
    var covImg = document.getElementById('vault-cover-img');
    if (covImg) covImg.src = CONFIG.assets.cover;
    var srvImg = document.getElementById('services-poster-img');
    if (srvImg) srvImg.src = CONFIG.assets.servicesPost;

    var v1Link = document.getElementById('vault-1-link');
    var v2Link = document.getElementById('vault-2-link');
    if (v1Link) v1Link.href = CONFIG.contact.driveWorkUrl;
    if (v2Link) v2Link.href = CONFIG.contact.driveCvPortfolioUrl;

    renderVcardModalContent();
  }

  function renderFeaturedWorks() {
    var container = document.getElementById('featured-works-grid');
    if (!container) return;
    var t = UI_TEXT[state.lang];
    var works = CONFIG.featuredWorks || [];
    var filtered = works.filter(function (w) {
      return state.workFilter === 'all' || w.category === state.workFilter;
    });

    var filterBtns = document.querySelectorAll('[data-work-filter]');
    for (var i = 0; i < filterBtns.length; i++) {
      var fVal = filterBtns[i].getAttribute('data-work-filter');
      if (fVal === state.workFilter) {
        filterBtns[i].className = 'px-4 py-2 rounded-full text-sm font-bold transition-all bg-[#F7C038] text-black shadow-md';
      } else {
        filterBtns[i].className = 'px-4 py-2 rounded-full text-sm font-medium transition-all bg-[#1f1f25] text-gray-300 hover:bg-[#2a2a32] border border-white/10';
      }
    }

    var html = '';
    for (var k = 0; k < filtered.length; k++) {
      var item = filtered[k];
      var badge = state.lang === 'ar' ? item.badgeAr : item.badgeEn;
      var client = state.lang === 'ar' ? item.clientAr : item.clientEn;
      var period = state.lang === 'ar' ? item.periodAr : item.periodEn;
      var title = state.lang === 'ar' ? item.titleAr : item.titleEn;
      var desc = state.lang === 'ar' ? item.descAr : item.descEn;

      var toolsHtml = '';
      for (var m = 0; m < (item.tools || []).length; m++) {
        toolsHtml += '<span class="text-xs px-2.5 py-1 rounded-md bg-white/5 text-gray-300 border border-white/10">' + escapeHtml(item.tools[m]) + '</span>';
      }

      html += '<article class="work-card rounded-2xl bg-[#1a1a20] border border-white/10 overflow-hidden flex flex-col justify-between">' +
        '<div>' +
          '<div class="relative h-52 overflow-hidden bg-black/50">' +
            '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(title) + '" class="w-full h-full object-cover" />' +
            '<div class="absolute inset-0 bg-gradient-to-t from-[#1a1a20] via-transparent to-black/30"></div>' +
            '<span class="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-[#F7C038] text-black shadow">' + escapeHtml(badge) + '</span>' +
            '<span class="absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-xs font-medium bg-black/75 text-gray-200 border border-white/10">' + escapeHtml(period) + '</span>' +
          '</div>' +
          '<div class="p-5">' +
            '<div class="text-xs font-semibold text-[#F7C038] mb-1.5">' + escapeHtml(client) + '</div>' +
            '<h3 class="text-lg font-bold text-white mb-2 leading-snug">' + escapeHtml(title) + '</h3>' +
            '<p class="text-sm text-gray-400 leading-relaxed mb-4">' + escapeHtml(desc) + '</p>' +
            '<div class="flex flex-wrap gap-1.5 mb-4">' + toolsHtml + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="px-5 pb-5 pt-3 border-t border-white/5 flex items-center justify-between gap-2">' +
          '<button type="button" data-action="open-work-modal" data-work-id="' + escapeHtml(item.id) + '" class="flex-1 py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition">' +
            escapeHtml(t.viewWorkDetails) +
          '</button>' +
          '<a href="' + escapeHtml(item.driveLink) + '" target="_blank" rel="noopener noreferrer" class="py-2 px-3 rounded-lg bg-[#F7C038]/15 hover:bg-[#F7C038]/25 text-[#F7C038] border border-[#F7C038]/30 text-xs font-semibold transition">' +
            escapeHtml(t.openInDrive) + ' ↗' +
          '</a>' +
        '</div>' +
      '</article>';
    }

    container.innerHTML = html;
  }

  function renderMonthlyPackages() {
    var container = document.getElementById('monthly-packages-grid');
    if (!container) return;
    var t = UI_TEXT[state.lang];
    var pkgs = CONFIG.monthlyPackages || [];
    var html = '';

    for (var i = 0; i < pkgs.length; i++) {
      var p = pkgs[i];
      var name = state.lang === 'ar' ? p.nameAr : p.nameEn;
      var period = state.lang === 'ar' ? p.periodAr : p.periodEn;
      var badge = state.lang === 'ar' ? p.badgeAr : p.badgeEn;
      var feats = state.lang === 'ar' ? p.featuresAr : p.featuresEn;
      var isSelected = state.selectedPackageId === p.id;

      var featsHtml = '';
      for (var f = 0; f < (feats || []).length; f++) {
        featsHtml += '<li class="flex items-start gap-2.5 text-sm text-gray-300">' +
          '<span class="text-[#F7C038] font-bold mt-0.5">•</span>' +
          '<span>' + escapeHtml(feats[f]) + '</span>' +
        '</li>';
      }

      html += '<div class="package-card ' + (p.popular ? 'featured-pkg' : '') + ' rounded-2xl p-6 flex flex-col justify-between">' +
        '<div>' +
          '<div class="flex items-center justify-between gap-2 mb-3">' +
            '<h3 class="text-xl font-extrabold text-[#F7C038]">' + escapeHtml(name) + '</h3>' +
            '<span class="text-xs px-2.5 py-1 rounded-full font-semibold ' + (p.popular ? 'bg-[#F7C038] text-black' : 'bg-white/10 text-gray-300') + '">' + escapeHtml(badge) + '</span>' +
          '</div>' +
          '<div class="flex items-baseline gap-1 pb-5 mb-5 border-b border-white/10">' +
            '<span class="text-4xl font-black text-white">$' + escapeHtml(p.price) + '</span>' +
            '<span class="text-sm text-gray-400 font-medium">' + escapeHtml(period) + '</span>' +
          '</div>' +
          '<ul class="space-y-3 mb-6">' + featsHtml + '</ul>' +
        '</div>' +
        '<div class="space-y-2.5 pt-4 border-t border-white/10">' +
          '<button type="button" data-action="select-pkg-calc" data-pkg-id="' + escapeHtml(p.id) + '" class="w-full py-2.5 px-4 rounded-xl font-bold text-sm transition ' +
            (isSelected ? 'bg-emerald-500 text-black' : 'bg-[#F7C038] hover:bg-[#eab308] text-black') + '">' +
            (isSelected ? (state.lang === 'ar' ? '✓ محددة في الحاسبة' : '✓ Selected in Estimator') : escapeHtml(t.pkgSelectBtn)) +
          '</button>' +
          '<div class="grid grid-cols-2 gap-2">' +
            '<button type="button" data-action="quick-pkg-whatsapp" data-pkg-id="' + escapeHtml(p.id) + '" class="py-2 px-3 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition">' +
              escapeHtml(t.pkgWhatsappBtn) +
            '</button>' +
            '<button type="button" data-action="quick-pkg-email" data-pkg-id="' + escapeHtml(p.id) + '" class="py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-gray-200 border border-white/10 text-xs font-semibold transition">' +
              escapeHtml(t.pkgEmailBtn) +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }

    container.innerHTML = html;
  }

  function renderPrintDigitalGrid() {
    var container = document.getElementById('print-digital-grid');
    var calcPrintContainer = document.getElementById('calc-print-chips');
    if (!container) return;
    var t = UI_TEXT[state.lang];
    var items = CONFIG.printDigitalServices || [];
    var html = '';
    var calcChipsHtml = '';

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var name = state.lang === 'ar' ? item.nameAr : item.nameEn;
      var active = !!state.selectedPrintIds[item.id];

      html += '<button type="button" data-action="toggle-print-item" data-print-id="' + escapeHtml(item.id) + '" ' +
        'class="p-3.5 rounded-xl border text-right transition flex items-center justify-between gap-2 ' +
        (active ? 'bg-[#F7C038]/20 border-[#F7C038] text-white shadow-md' : 'bg-[#1a1a20] border-white/10 text-gray-300 hover:border-[#F7C038]/50') + '">' +
        '<div class="flex items-center gap-2.5">' +
          '<span class="w-2 h-2 rounded-full ' + (active ? 'bg-[#F7C038]' : 'bg-gray-500') + '"></span>' +
          '<span class="text-sm font-semibold">' + escapeHtml(name) + '</span>' +
        '</div>' +
        '<span class="text-xs font-bold ' + (active ? 'text-[#F7C038]' : 'text-gray-400') + '">' +
          escapeHtml(active ? t.printSelectedHint : t.printClickHint) +
        '</span>' +
      '</button>';

      calcChipsHtml += '<button type="button" data-action="toggle-print-item" data-print-id="' + escapeHtml(item.id) + '" ' +
        'class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition ' +
        (active ? 'bg-[#F7C038] text-black border-[#F7C038]' : 'bg-[#16161b] text-gray-300 border-white/10 hover:border-[#F7C038]/50') + '">' +
        (active ? '✓ ' : '+ ') + escapeHtml(name) +
      '</button>';
    }

    container.innerHTML = html;
    if (calcPrintContainer) {
      calcPrintContainer.innerHTML = calcChipsHtml;
    }
  }

  function renderCalculator() {
    var t = UI_TEXT[state.lang];
    var pkgOptionsContainer = document.getElementById('calc-pkg-options');
    var alcListContainer = document.getElementById('calc-alc-list');

    if (pkgOptionsContainer) {
      var pkgs = CONFIG.monthlyPackages || [];
      var pkgHtml = '<button type="button" data-action="set-calc-pkg" data-pkg-id="none" class="p-3 rounded-xl border text-xs sm:text-sm font-semibold transition ' +
        (state.selectedPackageId === 'none' ? 'bg-[#F7C038] text-black border-[#F7C038]' : 'bg-[#16161b] text-gray-300 border-white/10 hover:border-white/30') + '">' +
        escapeHtml(t.calcNoPkg) +
      '</button>';

      for (var i = 0; i < pkgs.length; i++) {
        var p = pkgs[i];
        var pName = state.lang === 'ar' ? p.nameAr : p.nameEn;
        var active = state.selectedPackageId === p.id;
        pkgHtml += '<button type="button" data-action="set-calc-pkg" data-pkg-id="' + escapeHtml(p.id) + '" class="p-3 rounded-xl border text-xs sm:text-sm font-bold transition flex items-center justify-between gap-2 ' +
          (active ? 'bg-[#F7C038] text-black border-[#F7C038]' : 'bg-[#16161b] text-gray-200 border-white/10 hover:border-[#F7C038]/50') + '">' +
          '<span>' + escapeHtml(pName) + '</span>' +
          '<span class="px-2 py-0.5 rounded bg-black/20 text-xs">$' + escapeHtml(p.price) + '</span>' +
        '</button>';
      }
      pkgOptionsContainer.innerHTML = pkgHtml;
    }

    if (alcListContainer) {
      var alcs = CONFIG.alaCarteServices || [];
      var alcHtml = '';
      for (var j = 0; j < alcs.length; j++) {
        var item = alcs[j];
        var count = state.alaCarteCounts[item.id] || 0;
        var name = state.lang === 'ar' ? item.nameAr : item.nameEn;
        var unit = state.lang === 'ar' ? item.unitAr : item.unitEn;

        alcHtml += '<div class="p-3.5 rounded-xl bg-[#16161b] border ' + (count > 0 ? 'border-[#F7C038]/60' : 'border-white/10') + ' flex items-center justify-between gap-3">' +
          '<div>' +
            '<div class="text-sm font-semibold text-white">' + escapeHtml(name) + '</div>' +
            '<div class="text-xs text-[#F7C038] font-bold">$' + escapeHtml(item.price) + ' <span class="text-gray-400 font-normal">(' + escapeHtml(unit) + ')</span></div>' +
          '</div>' +
          '<div class="flex items-center gap-2">' +
            '<button type="button" data-action="alc-dec" data-alc-id="' + escapeHtml(item.id) + '" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center transition" aria-label="Decrease">-</button>' +
            '<span class="w-8 text-center font-bold text-sm ' + (count > 0 ? 'text-[#F7C038]' : 'text-gray-400') + '">' + count + '</span>' +
            '<button type="button" data-action="alc-inc" data-alc-id="' + escapeHtml(item.id) + '" class="w-8 h-8 rounded-lg bg-[#F7C038] hover:bg-[#eab308] text-black font-bold flex items-center justify-center transition" aria-label="Increase">+</button>' +
          '</div>' +
        '</div>';
      }
      alcListContainer.innerHTML = alcHtml;
    }

    updateQuoteSummaryAndMessage();
  }

  function buildOrderCalculation() {
    var total = 0;
    var linesAr = [];
    var linesEn = [];

    var pkgs = CONFIG.monthlyPackages || [];
    for (var i = 0; i < pkgs.length; i++) {
      if (pkgs[i].id === state.selectedPackageId) {
        total += Number(pkgs[i].price) || 0;
        linesAr.push("• الباقة الشهرية: " + pkgs[i].nameAr + " ($" + pkgs[i].price + "/شهرياً)");
        linesEn.push("• Monthly Package: " + pkgs[i].nameEn + " ($" + pkgs[i].price + "/month)");
      }
    }

    var alcs = CONFIG.alaCarteServices || [];
    for (var j = 0; j < alcs.length; j++) {
      var qty = state.alaCarteCounts[alcs[j].id] || 0;
      if (qty > 0) {
        var sub = qty * (Number(alcs[j].price) || 0);
        total += sub;
        linesAr.push("• " + alcs[j].nameAr + " × " + qty + " (تقريبي: $" + sub + ")");
        linesEn.push("• " + alcs[j].nameEn + " × " + qty + " (Approx: $" + sub + ")");
      }
    }

    var prints = CONFIG.printDigitalServices || [];
    var selectedPrintAr = [];
    var selectedPrintEn = [];
    for (var k = 0; k < prints.length; k++) {
      if (state.selectedPrintIds[prints[k].id]) {
        selectedPrintAr.push(prints[k].nameAr);
        selectedPrintEn.push(prints[k].nameEn);
      }
    }

    if (selectedPrintAr.length > 0) {
      linesAr.push("• تصاميم مطبوعات/رقمي مطلوبة (تُسعّر بالنقاش): " + selectedPrintAr.join("، "));
      linesEn.push("• Print/Digital Design Items (Quoted upon discussion): " + selectedPrintEn.join(", "));
    }

    var isAr = state.lang === 'ar';
    var msgLines = [];
    if (isAr) {
      msgLines.push("مرحباً أستاذ " + CONFIG.contact.nameAr + " (" + CONFIG.contact.brandEn + ")،");
      if (state.clientName.trim()) {
        msgLines.push("معك: " + state.clientName.trim() + (state.clientOrg.trim() ? " (" + state.clientOrg.trim() + ")" : ""));
      }
      msgLines.push("");
      msgLines.push("أود الاستفسار ومناقشة تنفيذ الخدمات التالية:");
      if (linesAr.length === 0) {
        msgLines.push("• (لم يتم تحديد خدمات محددة بعد — أود مناقشة مشروع جديد)");
      } else {
        msgLines = msgLines.concat(linesAr);
      }
      msgLines.push("");
      if (total > 0) {
        msgLines.push("التكلفة التقريبية المبدئية عبر حاسبة الموقع: ~$" + total + " USD (على أن نحدد السعر النهائي بعد مناقشة التفاصيل).");
      } else {
        msgLines.push("يرجى تزويدي بالتكلفة النهائية بعد مناقشة تفاصيل العمل.");
      }
      if (state.clientNotes.trim()) {
        msgLines.push("");
        msgLines.push("ملاحظات وتفاصيل إضافية:");
        msgLines.push(state.clientNotes.trim());
      }
    } else {
      msgLines.push("Hello " + CONFIG.contact.nameEn + " (" + CONFIG.contact.brandEn + "),");
      if (state.clientName.trim()) {
        msgLines.push("From: " + state.clientName.trim() + (state.clientOrg.trim() ? " (" + state.clientOrg.trim() + ")" : ""));
      }
      msgLines.push("");
      msgLines.push("I would like to discuss and request a quote for the following services:");
      if (linesEn.length === 0) {
        msgLines.push("• (General project inquiry — custom scope to be discussed)");
      } else {
        msgLines = msgLines.concat(linesEn);
      }
      msgLines.push("");
      if (total > 0) {
        msgLines.push("Estimated Approximate Cost via Website Calculator: ~$" + total + " USD (Final price to be agreed upon discussing project details).");
      } else {
        msgLines.push("Please let me know the final pricing after we discuss the project scope.");
      }
      if (state.clientNotes.trim()) {
        msgLines.push("");
        msgLines.push("Additional Project Notes:");
        msgLines.push(state.clientNotes.trim());
      }
    }

    return {
      total: total,
      hasPrintCustom: selectedPrintAr.length > 0,
      lines: isAr ? linesAr : linesEn,
      messageText: msgLines.join("\n"),
      subjectText: isAr
        ? ("طلب عرض سعر رسمي ومناقشة مشروع — Mahdi Media" + (state.clientName.trim() ? " | " + state.clientName.trim() : ""))
        : ("Official Project Proposal & Quote Request — Mahdi Media" + (state.clientName.trim() ? " | " + state.clientName.trim() : ""))
    };
  }

  function updateQuoteSummaryAndMessage() {
    var calc = buildOrderCalculation();
    var totalEl = document.getElementById('calc-approx-total');
    var previewEl = document.getElementById('quote-message-preview');
    var itemsCountBadge = document.getElementById('calc-items-badge');

    if (totalEl) {
      var suffix = calc.hasPrintCustom ? ' + ' + (state.lang === 'ar' ? 'مطبوعات' : 'Print') : '';
      totalEl.textContent = '~$' + calc.total + ' USD' + suffix;
    }
    if (previewEl) {
      previewEl.value = calc.messageText;
    }
    if (itemsCountBadge) {
      itemsCountBadge.textContent = calc.lines.length + (state.lang === 'ar' ? ' بنود محددة' : ' items selected');
    }
  }

  function renderCvSection() {
    var expContainer = document.getElementById('cv-experience-list');
    var eduContainer = document.getElementById('cv-education-list');
    if (expContainer) {
      var exps = CONFIG.experience || [];
      var expHtml = '';
      for (var i = 0; i < exps.length; i++) {
        var e = exps[i];
        var role = state.lang === 'ar' ? e.roleAr : e.roleEn;
        var org = state.lang === 'ar' ? e.orgAr : e.orgEn;
        var period = state.lang === 'ar' ? e.periodAr : e.periodEn;
        var pts = state.lang === 'ar' ? e.pointsAr : e.pointsEn;

        var ptsHtml = '';
        for (var p = 0; p < (pts || []).length; p++) {
          ptsHtml += '<li class="text-sm text-gray-300 leading-relaxed flex items-start gap-2">' +
            '<span class="text-[#F7C038] mt-1">▪</span>' +
            '<span>' + escapeHtml(pts[p]) + '</span>' +
          '</li>';
        }

        expHtml += '<div class="relative pl-4 pr-4 py-4 rounded-2xl bg-[#1a1a20] border border-white/10 hover:border-[#F7C038]/40 transition">' +
          '<div class="flex flex-wrap items-center justify-between gap-2 mb-1.5">' +
            '<h4 class="text-base font-bold text-white">' + escapeHtml(role) + '</h4>' +
            '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F7C038]/15 text-[#F7C038] border border-[#F7C038]/30">' + escapeHtml(period) + '</span>' +
          '</div>' +
          '<div class="text-xs font-semibold text-[#F7C038] mb-3">' + escapeHtml(org) + '</div>' +
          '<ul class="space-y-1.5">' + ptsHtml + '</ul>' +
        '</div>';
      }
      expContainer.innerHTML = expHtml;
    }

    if (eduContainer) {
      var edus = CONFIG.education || [];
      var eduHtml = '';
      for (var j = 0; j < edus.length; j++) {
        var ed = edus[j];
        var deg = state.lang === 'ar' ? ed.degreeAr : ed.degreeEn;
        var sch = state.lang === 'ar' ? ed.schoolAr : ed.schoolEn;
        var per = state.lang === 'ar' ? ed.periodAr : ed.periodEn;

        eduHtml += '<div class="p-4 rounded-xl bg-[#16161b] border border-white/10">' +
          '<div class="flex items-center justify-between gap-2 mb-1">' +
            '<span class="text-xs font-bold text-[#F7C038]">' + escapeHtml(per) + '</span>' +
          '</div>' +
          '<div class="text-sm font-bold text-white mb-1">' + escapeHtml(deg) + '</div>' +
          (ed.link
            ? '<a href="' + escapeHtml(ed.link) + '" target="_blank" rel="noopener noreferrer" class="text-xs text-gray-300 hover:text-[#F7C038] underline transition">' + escapeHtml(sch) + ' ↗</a>'
            : '<div class="text-xs text-gray-400">' + escapeHtml(sch) + '</div>') +
        '</div>';
      }
      eduContainer.innerHTML = eduHtml;
    }
  }

  function renderAll() {
    applySectionOrderAndVisibility();
    renderStaticLabels();
    renderFeaturedWorks();
    renderMonthlyPackages();
    renderPrintDigitalGrid();
    renderCalculator();
    renderCvSection();
    if (state.isAdminAuthenticated) {
      renderAdminDashboard();
    }
  }

  // ============================================================================
  // SECRET URL ROUTER & PROTECTED ADMIN PORTAL
  // ============================================================================
  function checkSecretRoute() {
    var hash = window.location.hash || '';
    var slug = (CONFIG.security && CONFIG.security.secretRouteSlug) || 'mahdi-vault-admin';
    var publicView = document.getElementById('public-site-view');
    var adminPortalView = document.getElementById('admin-portal-view');
    var view404 = document.getElementById('view-404-section');
    var loginBox = document.getElementById('admin-login-gate');
    var cmsBox = document.getElementById('admin-cms-dashboard');

    if (hash === '#/' + slug || hash === '#' + slug) {
      if (publicView) publicView.classList.add('hidden');
      if (view404) view404.classList.add('hidden');
      if (adminPortalView) adminPortalView.classList.remove('hidden');

      if (state.isAdminAuthenticated) {
        if (loginBox) loginBox.classList.add('hidden');
        if (cmsBox) cmsBox.classList.remove('hidden');
        renderAdminDashboard();
      } else {
        if (loginBox) loginBox.classList.remove('hidden');
        if (cmsBox) cmsBox.classList.add('hidden');
      }
      window.scrollTo(0, 0);
    } else if (hash.indexOf('#/') === 0 && hash !== '#/' && hash !== '#/home') {
      if (publicView) publicView.classList.add('hidden');
      if (adminPortalView) adminPortalView.classList.add('hidden');
      if (view404) view404.classList.remove('hidden');
      window.scrollTo(0, 0);
    } else {
      if (adminPortalView) adminPortalView.classList.add('hidden');
      if (view404) view404.classList.add('hidden');
      if (publicView) publicView.classList.remove('hidden');
    }
  }

  function handleAdminLogin(e) {
    e.preventDefault();
    var now = Date.now();
    var errEl = document.getElementById('admin-login-error');
    if (now < state.lockoutUntil) {
      var waitSec = Math.ceil((state.lockoutUntil - now) / 1000);
      if (errEl) {
        errEl.textContent = 'تم قفل المحاولات مؤقتاً للحماية. يرجى الانتظار ' + waitSec + ' ثانية.';
        errEl.classList.remove('hidden');
      }
      return;
    }

    var userInp = (document.getElementById('admin-username-input').value || '').trim();
    var passInp = document.getElementById('admin-password-input').value || '';
    var salt = CONFIG.security.salt || 'MAHDI_MEDIA_PRO_SALT_2026';
    var computedHash = sha256Hex(salt + ':' + userInp + ':' + passInp);

    if (computedHash === CONFIG.security.authHash) {
      state.isAdminAuthenticated = true;
      state.loginAttempts = 0;
      if (errEl) errEl.classList.add('hidden');
      checkSecretRoute();
      showToast('تم تسجيل الدخول إلى لوحة التحكم المحمية بنجاح!');
    } else {
      state.loginAttempts += 1;
      var maxAtt = CONFIG.security.maxLoginAttempts || 5;
      if (state.loginAttempts >= maxAtt) {
        state.lockoutUntil = Date.now() + (CONFIG.security.lockoutSeconds || 60) * 1000;
        state.loginAttempts = 0;
        if (errEl) {
          errEl.textContent = 'تجاوزت الحد المسموح من المحاولات. تم تفعيل الحماية لمدة 60 ثانية.';
          errEl.classList.remove('hidden');
        }
      } else {
        var rem = maxAtt - state.loginAttempts;
        if (errEl) {
          errEl.textContent = 'بيانات الدخول غير صحيحة! المحاولات المتبقية: ' + rem;
          errEl.classList.remove('hidden');
        }
      }
    }
  }

  function moveArrayItem(arr, fromIdx, toIdx) {
    if (toIdx < 0 || toIdx >= arr.length || fromIdx === toIdx) return;
    var item = arr.splice(fromIdx, 1)[0];
    arr.splice(toIdx, 0, item);
  }

  function renderAdminDashboard() {
    var tabBtns = document.querySelectorAll('[data-admin-tab]');
    for (var i = 0; i < tabBtns.length; i++) {
      var tId = tabBtns[i].getAttribute('data-admin-tab');
      var panel = document.getElementById(tId);
      if (tId === state.activeAdminTab) {
        tabBtns[i].className = 'px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-[#F7C038] text-black shadow transition';
        if (panel) panel.classList.remove('hidden');
      } else {
        tabBtns[i].className = 'px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#1a1a22] text-gray-300 hover:bg-white/10 border border-white/10 transition';
        if (panel) panel.classList.add('hidden');
      }
    }

    renderAdminSectionsTab();
    renderAdminIdentityTab();
    renderAdminWorksTab();
    renderAdminPricingTab();
    renderAdminCvTab();
    renderAdminSecurityExportTab();
    renderSmartInvoiceStudio();
  }

  function renderAdminSectionsTab() {
    var box = document.getElementById('admin-sections-dnd-list');
    if (!box) return;
    var list = CONFIG.sectionOrder || [];
    var html = '';
    for (var i = 0; i < list.length; i++) {
      var sec = list[i];
      html += '<div class="dnd-item p-4 rounded-2xl bg-[#16161d] border border-white/15 flex items-center justify-between gap-4" draggable="true" data-dnd-type="sectionOrder" data-dnd-index="' + i + '">' +
        '<div class="flex items-center gap-3">' +
          '<span class="text-[#F7C038] font-black text-lg select-none" title="اسحب لإعادة الترتيب">⠿</span>' +
          '<div>' +
            '<div class="text-sm font-extrabold text-white">' + escapeHtml(sec.titleAr) + '</div>' +
            '<div class="text-xs text-gray-400">' + escapeHtml(sec.titleEn) + ' (#' + escapeHtml(sec.id) + ')</div>' +
          '</div>' +
        '</div>' +
        '<div class="flex items-center gap-2">' +
          '<button type="button" data-admin-action="move-up" data-list="sectionOrder" data-index="' + i + '" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold">↑</button>' +
          '<button type="button" data-admin-action="move-down" data-list="sectionOrder" data-index="' + i + '" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold">↓</button>' +
          '<button type="button" data-admin-action="toggle-section-vis" data-index="' + i + '" class="px-3 py-1.5 rounded-lg text-xs font-bold transition ' +
            (sec.enabled !== false ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40') + '">' +
            (sec.enabled !== false ? 'ظاهر في الموقع ✓' : 'مخفي ✕') +
          '</button>' +
        '</div>' +
      '</div>';
    }
    box.innerHTML = html;
  }

  function renderAdminIdentityTab() {
    var h = CONFIG.hero;
    var c = CONFIG.contact;
    var setVal = function (id, val) {
      var el = document.getElementById(id);
      if (el) el.value = val || '';
    };
    setVal('cms-hero-title-ar', h.titleAr);
    setVal('cms-hero-title-en', h.titleEn);
    setVal('cms-hero-role-ar', h.roleBadgeAr);
    setVal('cms-hero-role-en', h.roleBadgeEn);
    setVal('cms-hero-brand-ar', h.brandBadgeAr);
    setVal('cms-hero-brand-en', h.brandBadgeEn);
    setVal('cms-hero-sub-ar', h.subtitleAr);
    setVal('cms-hero-sub-en', h.subtitleEn);

    setVal('cms-contact-wa', c.whatsappNumber);
    setVal('cms-contact-email', c.email);
    setVal('cms-contact-ig-brand', c.instagramBrand);
    setVal('cms-contact-ig-personal', c.instagramPersonal);
    setVal('cms-contact-drive1', c.driveWorkUrl);
    setVal('cms-contact-drive2', c.driveCvPortfolioUrl);

    var statsBox = document.getElementById('cms-stats-editor-grid');
    if (statsBox && h.stats) {
      var sHtml = '';
      for (var i = 0; i < h.stats.length; i++) {
        var st = h.stats[i];
        sHtml += '<div class="p-3.5 rounded-xl bg-[#121217] border border-white/10 space-y-2">' +
          '<div class="text-xs font-bold text-[#F7C038]">البطاقة الإحصائية #' + (i + 1) + '</div>' +
          '<div class="grid grid-cols-2 gap-2">' +
            '<input type="text" data-stat-field="numAr" data-stat-idx="' + i + '" value="' + escapeHtml(st.numAr) + '" placeholder="الرقم (عربي)" class="px-2.5 py-1.5 rounded-lg bg-[#1a1a22] border border-white/10 text-xs text-white" />' +
            '<input type="text" data-stat-field="numEn" data-stat-idx="' + i + '" value="' + escapeHtml(st.numEn) + '" placeholder="Number (EN)" class="px-2.5 py-1.5 rounded-lg bg-[#1a1a22] border border-white/10 text-xs text-white" />' +
          '</div>' +
          '<input type="text" data-stat-field="labelAr" data-stat-idx="' + i + '" value="' + escapeHtml(st.labelAr) + '" placeholder="الوصف بالعربية" class="w-full px-2.5 py-1.5 rounded-lg bg-[#1a1a22] border border-white/10 text-xs text-white" />' +
          '<input type="text" data-stat-field="labelEn" data-stat-idx="' + i + '" value="' + escapeHtml(st.labelEn) + '" placeholder="Label in English" class="w-full px-2.5 py-1.5 rounded-lg bg-[#1a1a22] border border-white/10 text-xs text-white" />' +
        '</div>';
      }
      statsBox.innerHTML = sHtml;
    }

    var pLogo = document.getElementById('cms-preview-logo');
    var pProf = document.getElementById('cms-preview-profile');
    var pCov = document.getElementById('cms-preview-cover');
    if (pLogo) pLogo.src = CONFIG.assets.logo;
    if (pProf) pProf.src = CONFIG.assets.profile;
    if (pCov) pCov.src = CONFIG.assets.cover;
  }

  function renderAdminWorksTab() {
    var box = document.getElementById('admin-works-dnd-list');
    if (!box) return;
    var works = CONFIG.featuredWorks || [];
    var html = '';

    for (var i = 0; i < works.length; i++) {
      var w = works[i];
      html += '<div class="dnd-item p-4 rounded-2xl bg-[#16161d] border border-white/15 space-y-3" draggable="true" data-dnd-type="featuredWorks" data-dnd-index="' + i + '">' +
        '<div class="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">' +
          '<div class="flex items-center gap-2.5">' +
            '<span class="text-[#F7C038] font-black text-lg select-none" title="اسحب لإعادة الترتيب">⠿</span>' +
            '<span class="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#F7C038]/20 text-[#F7C038]">عمل مميز #' + (i + 1) + '</span>' +
          '</div>' +
          '<div class="flex items-center gap-1.5">' +
            '<button type="button" data-admin-action="move-up" data-list="featuredWorks" data-index="' + i + '" class="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold">↑</button>' +
            '<button type="button" data-admin-action="move-down" data-list="featuredWorks" data-index="' + i + '" class="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold">↓</button>' +
            '<button type="button" data-admin-action="delete-work" data-index="' + i + '" class="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold">حذف ✕</button>' +
          '</div>' +
        '</div>' +

        '<div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">' +
          '<div class="lg:col-span-3">' +
            '<div class="dropzone-box rounded-xl p-2 text-center relative overflow-hidden bg-black/40" data-work-img-drop="' + i + '">' +
              '<img src="' + escapeHtml(w.image) + '" alt="Work" class="w-full h-24 object-cover rounded-lg mb-1.5" />' +
              '<label class="cursor-pointer block text-[11px] font-bold text-[#F7C038] hover:underline">' +
                'اسحب صورة هنا أو اضغط للتغيير' +
                '<input type="file" accept="image/*" class="hidden" data-work-img-input="' + i + '" />' +
              '</label>' +
            '</div>' +
          '</div>' +
          '<div class="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">' +
            '<div>' +
              '<label class="text-gray-400 block mb-0.5">العنوان (عربي)</label>' +
              '<input type="text" data-work-field="titleAr" data-work-idx="' + i + '" value="' + escapeHtml(w.titleAr) + '" class="w-full px-2.5 py-1.5 rounded-lg bg-[#111115] border border-white/10 text-white" />' +
            '</div>' +
            '<div>' +
              '<label class="text-gray-400 block mb-0.5">Title (EN)</label>' +
              '<input type="text" data-work-field="titleEn" data-work-idx="' + i + '" value="' + escapeHtml(w.titleEn) + '" class="w-full px-2.5 py-1.5 rounded-lg bg-[#111115] border border-white/10 text-white" />' +
            '</div>' +
            '<div>' +
              '<label class="text-gray-400 block mb-0.5">العميل / الجهة (عربي)</label>' +
              '<input type="text" data-work-field="clientAr" data-work-idx="' + i + '" value="' + escapeHtml(w.clientAr) + '" class="w-full px-2.5 py-1.5 rounded-lg bg-[#111115] border border-white/10 text-white" />' +
            '</div>' +
            '<div>' +
              '<label class="text-gray-400 block mb-0.5">الشارة (Badge AR)</label>' +
              '<input type="text" data-work-field="badgeAr" data-work-idx="' + i + '" value="' + escapeHtml(w.badgeAr) + '" class="w-full px-2.5 py-1.5 rounded-lg bg-[#111115] border border-white/10 text-white" />' +
            '</div>' +
            '<div class="sm:col-span-2">' +
              '<label class="text-gray-400 block mb-0.5">الوصف (عربي)</label>' +
              '<textarea rows="2" data-work-field="descAr" data-work-idx="' + i + '" class="w-full px-2.5 py-1.5 rounded-lg bg-[#111115] border border-white/10 text-white">' + escapeHtml(w.descAr) + '</textarea>' +
            '</div>' +
            '<div class="sm:col-span-2">' +
              '<label class="text-gray-400 block mb-0.5">رابط المشروع في Google Drive</label>' +
              '<input type="url" data-work-field="driveLink" data-work-idx="' + i + '" value="' + escapeHtml(w.driveLink) + '" class="w-full px-2.5 py-1.5 rounded-lg bg-[#111115] border border-white/10 text-[#F7C038]" />' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }
    box.innerHTML = html;
  }

  function renderAdminPricingTab() {
    var pkgBox = document.getElementById('admin-pkgs-dnd-list');
    var alcBox = document.getElementById('admin-alc-dnd-list');

    if (pkgBox) {
      var pkgs = CONFIG.monthlyPackages || [];
      var pHtml = '';
      for (var i = 0; i < pkgs.length; i++) {
        var p = pkgs[i];
        pHtml += '<div class="dnd-item p-4 rounded-2xl bg-[#16161d] border border-white/15 space-y-3" draggable="true" data-dnd-type="monthlyPackages" data-dnd-index="' + i + '">' +
          '<div class="flex items-center justify-between border-b border-white/10 pb-2">' +
            '<div class="flex items-center gap-2">' +
              '<span class="text-[#F7C038] font-black text-lg select-none">⠿</span>' +
              '<span class="text-sm font-extrabold text-[#F7C038]">' + escapeHtml(p.nameAr) + '</span>' +
            '</div>' +
            '<div class="flex items-center gap-1.5">' +
              '<button type="button" data-admin-action="move-up" data-list="monthlyPackages" data-index="' + i + '" class="w-7 h-7 rounded-lg bg-white/10 text-white text-xs font-bold">↑</button>' +
              '<button type="button" data-admin-action="move-down" data-list="monthlyPackages" data-index="' + i + '" class="w-7 h-7 rounded-lg bg-white/10 text-white text-xs font-bold">↓</button>' +
            '</div>' +
          '</div>' +
          '<div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">' +
            '<div>' +
              '<label class="text-gray-400 block mb-0.5">اسم الباقة (عربي)</label>' +
              '<input type="text" data-pkg-field="nameAr" data-pkg-idx="' + i + '" value="' + escapeHtml(p.nameAr) + '" class="w-full px-2.5 py-1.5 rounded-lg bg-[#111115] border border-white/10 text-white" />' +
            '</div>' +
            '<div>' +
              '<label class="text-gray-400 block mb-0.5">Package Name (EN)</label>' +
              '<input type="text" data-pkg-field="nameEn" data-pkg-idx="' + i + '" value="' + escapeHtml(p.nameEn) + '" class="w-full px-2.5 py-1.5 rounded-lg bg-[#111115] border border-white/10 text-white" />' +
            '</div>' +
            '<div>' +
              '<label class="text-gray-400 block mb-0.5">السعر الشهري ($ USD)</label>' +
              '<input type="number" data-pkg-field="price" data-pkg-idx="' + i + '" value="' + escapeHtml(p.price) + '" class="w-full px-2.5 py-1.5 rounded-lg bg-[#111115] border border-[#F7C038]/40 text-[#F7C038] font-bold" />' +
            '</div>' +
          '</div>' +
        '</div>';
      }
      pkgBox.innerHTML = pHtml;
    }

    if (alcBox) {
      var alcs = CONFIG.alaCarteServices || [];
      var aHtml = '';
      for (var j = 0; j < alcs.length; j++) {
        var a = alcs[j];
        aHtml += '<div class="dnd-item p-3.5 rounded-xl bg-[#16161d] border border-white/15 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3" draggable="true" data-dnd-type="alaCarteServices" data-dnd-index="' + j + '">' +
          '<span class="text-[#F7C038] font-black text-lg select-none">⠿</span>' +
          '<input type="text" data-alc-field="nameAr" data-alc-idx="' + j + '" value="' + escapeHtml(a.nameAr) + '" class="flex-1 min-w-[180px] px-2.5 py-1.5 rounded-lg bg-[#111115] border border-white/10 text-xs text-white" />' +
          '<input type="text" data-alc-field="nameEn" data-alc-idx="' + j + '" value="' + escapeHtml(a.nameEn) + '" class="flex-1 min-w-[150px] px-2.5 py-1.5 rounded-lg bg-[#111115] border border-white/10 text-xs text-gray-300" />' +
          '<div class="flex items-center gap-1.5">' +
            '<span class="text-xs text-[#F7C038] font-bold">$</span>' +
            '<input type="number" data-alc-field="price" data-alc-idx="' + j + '" value="' + escapeHtml(a.price) + '" class="w-20 px-2.5 py-1.5 rounded-lg bg-[#111115] border border-[#F7C038]/40 text-xs text-[#F7C038] font-bold" />' +
          '</div>' +
          '<div class="flex items-center gap-1">' +
            '<button type="button" data-admin-action="move-up" data-list="alaCarteServices" data-index="' + j + '" class="w-7 h-7 rounded-lg bg-white/10 text-white text-xs">↑</button>' +
            '<button type="button" data-admin-action="move-down" data-list="alaCarteServices" data-index="' + j + '" class="w-7 h-7 rounded-lg bg-white/10 text-white text-xs">↓</button>' +
            '<button type="button" data-admin-action="delete-alc" data-index="' + j + '" class="px-2 py-1 rounded-lg bg-red-500/20 text-red-300 text-xs font-bold">✕</button>' +
          '</div>' +
        '</div>';
      }
      alcBox.innerHTML = aHtml;
    }
  }

  function renderAdminCvTab() {
    var expBox = document.getElementById('admin-cv-dnd-list');
    if (!expBox) return;
    var exps = CONFIG.experience || [];
    var html = '';
    for (var i = 0; i < exps.length; i++) {
      var ex = exps[i];
      html += '<div class="dnd-item p-4 rounded-2xl bg-[#16161d] border border-white/15 space-y-2.5" draggable="true" data-dnd-type="experience" data-dnd-index="' + i + '">' +
        '<div class="flex items-center justify-between border-b border-white/10 pb-2">' +
          '<div class="flex items-center gap-2">' +
            '<span class="text-[#F7C038] font-black text-lg select-none">⠿</span>' +
            '<span class="text-xs font-bold text-[#F7C038]">' + escapeHtml(ex.periodAr) + '</span>' +
          '</div>' +
          '<div class="flex items-center gap-1.5">' +
            '<button type="button" data-admin-action="move-up" data-list="experience" data-index="' + i + '" class="w-7 h-7 rounded-lg bg-white/10 text-white text-xs">↑</button>' +
            '<button type="button" data-admin-action="move-down" data-list="experience" data-index="' + i + '" class="w-7 h-7 rounded-lg bg-white/10 text-white text-xs">↓</button>' +
            '<button type="button" data-admin-action="delete-exp" data-index="' + i + '" class="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 text-xs font-bold">حذف ✕</button>' +
          '</div>' +
        '</div>' +
        '<div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">' +
          '<input type="text" data-exp-field="roleAr" data-exp-idx="' + i + '" value="' + escapeHtml(ex.roleAr) + '" placeholder="المسمى الوظيفي (عربي)" class="px-2.5 py-1.5 rounded-lg bg-[#111115] border border-white/10 text-white" />' +
          '<input type="text" data-exp-field="orgAr" data-exp-idx="' + i + '" value="' + escapeHtml(ex.orgAr) + '" placeholder="الجهة / المؤسسة" class="px-2.5 py-1.5 rounded-lg bg-[#111115] border border-white/10 text-white" />' +
          '<input type="text" data-exp-field="periodAr" data-exp-idx="' + i + '" value="' + escapeHtml(ex.periodAr) + '" placeholder="الفترة الزمنية" class="px-2.5 py-1.5 rounded-lg bg-[#111115] border border-white/10 text-[#F7C038]" />' +
        '</div>' +
      '</div>';
    }
    expBox.innerHTML = html;
  }

  function renderAdminSecurityExportTab() {
    var slugInp = document.getElementById('cms-secret-slug-input');
    var slugPreview = document.getElementById('cms-secret-url-preview');
    if (slugInp) slugInp.value = CONFIG.security.secretRouteSlug || 'mahdi-vault-admin';
    if (slugPreview) slugPreview.textContent = '#/' + (CONFIG.security.secretRouteSlug || 'mahdi-vault-admin');
  }

  // ============================================================================
  // FEATURE #6: SMART AUTO-CALCULATING INVOICE BUILDER & ARCHIVE
  // ============================================================================
  function calculateInvoiceTotals(inv) {
    var subtotal = 0;
    var items = inv.items || [];
    for (var i = 0; i < items.length; i++) {
      var u = Number(items[i].units) || 0;
      var p = Number(items[i].unitPrice) || 0;
      subtotal += u * p;
    }
    var disc = Number(inv.discount) || 0;
    var finalTotal = Math.max(0, subtotal - disc);
    return { subtotal: subtotal, discount: disc, total: finalTotal };
  }

  function renderSmartInvoiceStudio() {
    var inv = state.currentInvoice;
    var numInp = document.getElementById('inv-number-input');
    var dateInp = document.getElementById('inv-date-input');
    var cliNameInp = document.getElementById('inv-client-name-input');
    var cliDetInp = document.getElementById('inv-client-details-input');
    var discInp = document.getElementById('inv-discount-input');

    if (numInp) numInp.value = inv.invoiceNumber || 'INV-0001';
    if (dateInp) dateInp.value = inv.invoiceDate || '2026-10-17';
    if (cliNameInp) cliNameInp.value = inv.clientName || '';
    if (cliDetInp) cliDetInp.value = inv.clientDetails || '';
    if (discInp) discInp.value = inv.discount || 0;

    // Populate Quick Service Preset Select
    var presetSelect = document.getElementById('inv-service-preset-select');
    if (presetSelect && presetSelect.options.length <= 1) {
      var optHtml = '<option value="">-- اختر باقة أو خدمة لإدراجها بالسعر التلقائي --</option>';
      var pkgs = CONFIG.monthlyPackages || [];
      for (var i = 0; i < pkgs.length; i++) {
        optHtml += '<option value="pkg:' + i + '">' + escapeHtml(pkgs[i].nameAr) + ' — $' + pkgs[i].price + '</option>';
      }
      var alcs = CONFIG.alaCarteServices || [];
      for (var j = 0; j < alcs.length; j++) {
        optHtml += '<option value="alc:' + j + '">' + escapeHtml(alcs[j].nameAr) + ' — $' + alcs[j].price + '</option>';
      }
      var prints = CONFIG.printDigitalServices || [];
      for (var k = 0; k < prints.length; k++) {
        optHtml += '<option value="prt:' + k + '">تصميم مطبوعات: ' + escapeHtml(prints[k].nameAr) + ' — $35</option>';
      }
      presetSelect.innerHTML = optHtml;
    }

    // Render Editable Invoice Rows in Builder
    var rowsEditor = document.getElementById('inv-items-editor-list');
    var printSheetRows = document.getElementById('inv-printable-rows');
    var items = inv.items || [];

    if (rowsEditor) {
      var rHtml = '';
      for (var m = 0; m < items.length; m++) {
        var it = items[m];
        var lineSum = (Number(it.units) || 0) * (Number(it.unitPrice) || 0);
        rHtml += '<div class="grid grid-cols-12 gap-2 items-center bg-[#121217] p-2.5 rounded-xl border border-white/10 text-xs">' +
          '<div class="col-span-12 sm:col-span-6">' +
            '<input type="text" data-inv-item-field="concept" data-inv-idx="' + m + '" value="' + escapeHtml(it.concept) + '" placeholder="وصف الخدمة / البند" class="w-full px-2.5 py-1.5 rounded-lg bg-[#1a1a22] border border-white/10 text-white" />' +
          '</div>' +
          '<div class="col-span-4 sm:col-span-2">' +
            '<input type="number" min="1" data-inv-item-field="units" data-inv-idx="' + m + '" value="' + escapeHtml(it.units) + '" placeholder="الكمية" class="w-full px-2.5 py-1.5 rounded-lg bg-[#1a1a22] border border-white/10 text-center text-white font-bold" />' +
          '</div>' +
          '<div class="col-span-4 sm:col-span-2">' +
            '<input type="number" min="0" data-inv-item-field="unitPrice" data-inv-idx="' + m + '" value="' + escapeHtml(it.unitPrice) + '" placeholder="السعر $" class="w-full px-2.5 py-1.5 rounded-lg bg-[#1a1a22] border border-[#F7C038]/40 text-center text-[#F7C038] font-bold" />' +
          '</div>' +
          '<div class="col-span-4 sm:col-span-2 flex items-center justify-between gap-1">' +
            '<span class="font-extrabold text-white">$' + lineSum + '</span>' +
            '<button type="button" data-admin-action="inv-delete-row" data-index="' + m + '" class="px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold">✕</button>' +
          '</div>' +
        '</div>';
      }
      rowsEditor.innerHTML = rHtml;
    }

    // Update Printable Sheet Preview
    var totals = calculateInvoiceTotals(inv);
    var pNum = document.getElementById('inv-print-number');
    var pDate = document.getElementById('inv-print-date');
    var pCliName = document.getElementById('inv-print-client-name');
    var pCliDet = document.getElementById('inv-print-client-details');
    var pTotal = document.getElementById('inv-print-total');
    var pSubBox = document.getElementById('inv-print-subtotal-line');

    if (pNum) pNum.textContent = 'INVOICE Nº ' + (inv.invoiceNumber || 'INV-0001');
    if (pDate) pDate.textContent = inv.invoiceDate || '2026-10-17';
    if (pCliName) pCliName.textContent = inv.clientName || 'CLIENT NAME';
    if (pCliDet) pCliDet.textContent = inv.clientDetails || '';
    if (pTotal) pTotal.textContent = '$' + totals.total + ' USD';
    if (pSubBox) {
      pSubBox.textContent = totals.discount > 0
        ? ('Subtotal: $' + totals.subtotal + ' | Discount: -$' + totals.discount)
        : ('Subtotal: $' + totals.subtotal + ' USD');
    }

    if (printSheetRows) {
      var prHtml = '';
      for (var n = 0; n < items.length; n++) {
        var pit = items[n];
        var pSum = (Number(pit.units) || 0) * (Number(pit.unitPrice) || 0);
        prHtml += '<div class="grid grid-cols-4 py-2.5 border-b border-white/10 text-xs sm:text-sm">' +
          '<div class="col-span-2 font-medium text-white">' + escapeHtml(pit.concept) + '</div>' +
          '<div class="text-gray-300">' + escapeHtml(pit.units) + ' × $' + escapeHtml(pit.unitPrice) + '</div>' +
          '<div class="text-right font-bold text-[#F7C038]">$' + pSum + '</div>' +
        '</div>';
      }
      printSheetRows.innerHTML = prHtml;
    }

    // Render Saved Invoices History List
    var histBox = document.getElementById('inv-saved-history-list');
    if (histBox) {
      var saved = state.savedInvoices || [];
      if (saved.length === 0) {
        histBox.innerHTML = '<div class="text-xs text-gray-500 py-3">لا توجد فواتير محفوظة في الأرشيف بعد.</div>';
      } else {
        var hHtml = '';
        for (var s = 0; s < saved.length; s++) {
          var sv = saved[s];
          hHtml += '<div class="p-3 rounded-xl bg-[#121217] border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">' +
            '<div>' +
              '<span class="font-extrabold text-[#F7C038] ml-2">' + escapeHtml(sv.invoiceNumber) + '</span>' +
              '<span class="font-bold text-white">' + escapeHtml(sv.clientName) + '</span>' +
              '<span class="text-gray-400 mx-2">(' + escapeHtml(sv.invoiceDate) + ')</span>' +
            '</div>' +
            '<div class="flex items-center gap-2">' +
              '<span class="font-black text-emerald-400">$' + escapeHtml(sv.total) + ' USD</span>' +
              '<button type="button" data-admin-action="inv-load-saved" data-index="' + s + '" class="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold">عرض وتعديل</button>' +
              '<button type="button" data-admin-action="inv-delete-saved" data-index="' + s + '" class="px-2 py-1 rounded-lg bg-red-500/20 text-red-300 font-bold">✕</button>' +
            '</div>' +
          '</div>';
        }
        histBox.innerHTML = hHtml;
      }
    }
  }

  function processImageFileToDataUri(file, callback) {
    if (!file || !file.type || file.type.indexOf('image/') !== 0) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      var img = new Image();
      img.onload = function () {
        var maxW = 900;
        var maxH = 900;
        var w = img.width;
        var h = img.height;
        if (w > maxW || h > maxH) {
          var ratio = Math.min(maxW / w, maxH / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        var c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        var ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        var mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        var dataUrl = c.toDataURL(mime, 0.84);
        callback(dataUrl);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function downloadUpdatedDataJs() {
    var content = "/* ==========================================================================\n" +
      "   Mohammad Mahdi Takach (محمد مهدي الطقش) | Mahdi Media Pro — Data Config\n" +
      "   Exported from Mahdi Media Protected Admin CMS\n" +
      "   ========================================================================== */\n" +
      "'use strict';\n\n" +
      "window.PORTFOLIO_CONFIG = " + JSON.stringify(CONFIG, null, 2) + ";\n";

    var blob = new Blob([content], { type: 'application/javascript;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'data.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1500);
    showToast('تم تحميل ملف data.js المحدث! استبدله في مجلد js/ على GitHub.');
  }

  function openWorkModal(workId) {
    var works = CONFIG.featuredWorks || [];
    var target = null;
    for (var i = 0; i < works.length; i++) {
      if (works[i].id === workId) {
        target = works[i];
        break;
      }
    }
    if (!target) return;

    var modal = document.getElementById('work-detail-modal');
    if (!modal) return;

    var title = state.lang === 'ar' ? target.titleAr : target.titleEn;
    var client = state.lang === 'ar' ? target.clientAr : target.clientEn;
    var desc = state.lang === 'ar' ? target.descAr : target.descEn;
    var badge = state.lang === 'ar' ? target.badgeAr : target.badgeEn;

    document.getElementById('modal-work-img').src = target.image;
    document.getElementById('modal-work-badge').textContent = badge;
    document.getElementById('modal-work-client').textContent = client;
    document.getElementById('modal-work-title').textContent = title;
    document.getElementById('modal-work-desc').textContent = desc;
    document.getElementById('modal-work-drive').href = target.driveLink;

    var toolsBox = document.getElementById('modal-work-tools');
    var tHtml = '';
    for (var j = 0; j < (target.tools || []).length; j++) {
      tHtml += '<span class="px-2.5 py-1 rounded-md bg-white/10 text-xs text-white">' + escapeHtml(target.tools[j]) + '</span>';
    }
    toolsBox.innerHTML = tHtml;

    var reqBtn = document.getElementById('modal-work-request-btn');
    reqBtn.setAttribute('data-work-title', title);

    modal.classList.remove('hidden');
  }

  function triggerOfficialEmail(customSubject, customBody) {
    var calc = buildOrderCalculation();
    var subject = customSubject || calc.subjectText;
    var body = customBody || calc.messageText;
    var email = CONFIG.contact.email;

    var mailtoUrl = 'mailto:' + email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    var gmailWebUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(email) + '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

    var modal = document.getElementById('email-preview-modal');
    if (modal) {
      document.getElementById('email-modal-to').value = email;
      document.getElementById('email-modal-subject').value = subject;
      document.getElementById('email-modal-body').value = body;
      document.getElementById('email-modal-mailto-link').href = mailtoUrl;
      document.getElementById('email-modal-gmail-link').href = gmailWebUrl;
      modal.classList.remove('hidden');
    }
  }

  function triggerWhatsapp(customText) {
    var calc = buildOrderCalculation();
    var text = customText || calc.messageText;
    var phone = CONFIG.contact.whatsappNumber;
    var waUrl = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(text);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }

  function handleSecretLogoClick() {
    state.logoSecretClicks += 1;
    if (window._secretClickTimer) clearTimeout(window._secretClickTimer);
    window._secretClickTimer = setTimeout(function () {
      state.logoSecretClicks = 0;
    }, 2500);
    if (state.logoSecretClicks >= 5) {
      state.logoSecretClicks = 0;
      window.location.hash = '#/' + (CONFIG.security.secretRouteSlug || 'mahdi-vault-admin');
    }
  }

  function initApp() {
    var savedLang = safeGetStorage('mahdi_portfolio_lang', 'ar');
    if (savedLang === 'en' || savedLang === 'ar') {
      state.lang = savedLang;
    }

    renderAll();
    checkSecretRoute();
    window.addEventListener('hashchange', checkSecretRoute);

    // Language toggle
    var langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
      langBtn.addEventListener('click', function () {
        state.lang = state.lang === 'ar' ? 'en' : 'ar';
        safeSetStorage('mahdi_portfolio_lang', state.lang);
        renderAll();
      });
    }

    // Mobile Menu toggle
    var mobBtn = document.getElementById('mobile-menu-btn');
    var mobDrawer = document.getElementById('mobile-nav-drawer');
    if (mobBtn && mobDrawer) {
      mobBtn.addEventListener('click', function () {
        mobDrawer.classList.toggle('hidden');
      });
    }

    // Smooth scroll navigation buttons
    var scrollBtns = document.querySelectorAll('[data-scroll-to]');
    for (var i = 0; i < scrollBtns.length; i++) {
      scrollBtns[i].addEventListener('click', function (e) {
        var targetId = e.currentTarget.getAttribute('data-scroll-to');
        if (window.location.hash && window.location.hash !== '#/') {
          window.location.hash = '#/';
        }
        var targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
          if (mobDrawer) mobDrawer.classList.add('hidden');
        }
      });
    }

    // Filter buttons
    var filterBtns = document.querySelectorAll('[data-work-filter]');
    for (var j = 0; j < filterBtns.length; j++) {
      filterBtns[j].addEventListener('click', function (e) {
        state.workFilter = e.currentTarget.getAttribute('data-work-filter');
        renderFeaturedWorks();
      });
    }

    // Calculator client fields
    var nameInput = document.getElementById('input-client-name');
    var orgInput = document.getElementById('input-client-org');
    var notesInput = document.getElementById('input-client-notes');
    if (nameInput) {
      nameInput.addEventListener('input', function (e) {
        state.clientName = e.target.value;
        updateQuoteSummaryAndMessage();
      });
    }
    if (orgInput) {
      orgInput.addEventListener('input', function (e) {
        state.clientOrg = e.target.value;
        updateQuoteSummaryAndMessage();
      });
    }
    if (notesInput) {
      notesInput.addEventListener('input', function (e) {
        state.clientNotes = e.target.value;
        updateQuoteSummaryAndMessage();
      });
    }

    // Main Calculator Action Buttons
    var btnWa = document.getElementById('btn-send-whatsapp');
    if (btnWa) btnWa.addEventListener('click', function () { triggerWhatsapp(); });

    var btnEm = document.getElementById('btn-send-email');
    if (btnEm) btnEm.addEventListener('click', function () { triggerOfficialEmail(); });

    var btnCopy = document.getElementById('btn-copy-quote');
    if (btnCopy) {
      btnCopy.addEventListener('click', function () {
        var calc = buildOrderCalculation();
        copyTextToClipboard(calc.messageText, UI_TEXT[state.lang].toastCopied);
      });
    }

    var btnReset = document.getElementById('btn-reset-calc');
    if (btnReset) {
      btnReset.addEventListener('click', function () {
        state.selectedPackageId = 'none';
        state.alaCarteCounts = {};
        state.selectedPrintIds = {};
        state.clientName = '';
        state.clientOrg = '';
        state.clientNotes = '';
        if (nameInput) nameInput.value = '';
        if (orgInput) orgInput.value = '';
        if (notesInput) notesInput.value = '';
        renderMonthlyPackages();
        renderPrintDigitalGrid();
        renderCalculator();
      });
    }

    // Digital vCard & QR Modal Buttons
    var btnDownloadVcf = document.getElementById('btn-download-vcf');
    if (btnDownloadVcf) {
      btnDownloadVcf.addEventListener('click', downloadVcardFile);
    }
    var btnCopyVcard = document.getElementById('btn-copy-vcard-info');
    if (btnCopyVcard) {
      btnCopyVcard.addEventListener('click', function () {
        var c = CONFIG.contact;
        var info = c.nameAr + ' | ' + c.nameEn + '\n' +
          'Mahdi Media Pro\n' +
          'WhatsApp / Phone: +' + c.whatsappNumber + '\n' +
          'Email: ' + c.email + '\n' +
          'Instagram: @' + c.instagramBrand + '\n' +
          'Portfolio: ' + c.driveWorkUrl;
        copyTextToClipboard(info, UI_TEXT[state.lang].toastCopied);
      });
    }

    // Modal Close Buttons
    var closeBtns = document.querySelectorAll('[data-close-modal]');
    for (var c = 0; c < closeBtns.length; c++) {
      closeBtns[c].addEventListener('click', function (e) {
        var mId = e.currentTarget.getAttribute('data-close-modal');
        var mEl = document.getElementById(mId);
        if (mEl) mEl.classList.add('hidden');
      });
    }

    // Request Similar Work button inside Work Detail Modal
    var reqSimilarBtn = document.getElementById('modal-work-request-btn');
    if (reqSimilarBtn) {
      reqSimilarBtn.addEventListener('click', function (e) {
        var wTitle = e.currentTarget.getAttribute('data-work-title') || '';
        var prefix = state.lang === 'ar' ? 'أرغب في تنفيذ مشروع مشابه لـ: ' : 'I would like to request a project similar to: ';
        state.clientNotes = prefix + wTitle;
        if (notesInput) notesInput.value = state.clientNotes;
        updateQuoteSummaryAndMessage();
        document.getElementById('work-detail-modal').classList.add('hidden');
        var calcSec = document.getElementById('quote-calculator');
        if (calcSec) calcSec.scrollIntoView({ behavior: 'smooth' });
        showToast(UI_TEXT[state.lang].toastAddedToCalc);
      });
    }

    // Copy Official Email Body inside Email Modal
    var btnCopyEmailModal = document.getElementById('btn-copy-email-modal');
    if (btnCopyEmailModal) {
      btnCopyEmailModal.addEventListener('click', function () {
        var bodyVal = document.getElementById('email-modal-body').value;
        copyTextToClipboard(bodyVal, UI_TEXT[state.lang].toastCopied);
      });
    }

    // Open Add Featured Work Modal (Inside Protected Admin Panel)
    var openAddWorkBtn = document.getElementById('open-add-work-btn');
    if (openAddWorkBtn) {
      openAddWorkBtn.addEventListener('click', function () {
        var m = document.getElementById('add-work-modal');
        if (m) m.classList.remove('hidden');
      });
    }

    // Save New Featured Work Form
    var addWorkForm = document.getElementById('add-work-form');
    if (addWorkForm) {
      addWorkForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var titleAr = document.getElementById('new-work-title-ar').value.trim();
        var titleEn = document.getElementById('new-work-title-en').value.trim() || titleAr;
        var clientAr = document.getElementById('new-work-client-ar').value.trim() || 'Mahdi Media';
        var cat = document.getElementById('new-work-category').value;
        var descAr = document.getElementById('new-work-desc-ar').value.trim();
        var driveUrl = document.getElementById('new-work-drive').value.trim() || CONFIG.contact.driveWorkUrl;

        if (!titleAr) return;

        var newWork = {
          id: 'custom-work-' + Date.now(),
          category: cat,
          featured: true,
          image: CONFIG.assets.cover,
          badgeAr: 'عمل مميز جديد',
          badgeEn: 'New Featured Work',
          clientAr: clientAr,
          clientEn: clientAr,
          periodAr: '2026',
          periodEn: '2026',
          titleAr: titleAr,
          titleEn: titleEn,
          descAr: descAr || titleAr,
          descEn: descAr || titleEn,
          tools: ['Mahdi Media Pro', 'Premiere Pro', 'Photoshop'],
          driveLink: driveUrl
        };

        CONFIG.featuredWorks.unshift(newWork);
        saveConfigToStorage();
        renderAll();
        addWorkForm.reset();
        document.getElementById('add-work-modal').classList.add('hidden');
        showToast(UI_TEXT[state.lang].toastSavedCms);
      });
    }

    // Secret 5-Click Gesture on Header Logo OR Footer Logo (No lock icon!)
    var headerSecretLogo = document.getElementById('header-secret-logo');
    var footerSecretLogo = document.getElementById('footer-secret-logo');
    if (headerSecretLogo) headerSecretLogo.addEventListener('click', handleSecretLogoClick);
    if (footerSecretLogo) footerSecretLogo.addEventListener('click', handleSecretLogoClick);

    // Admin Login Form Submit
    var adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
      adminLoginForm.addEventListener('submit', handleAdminLogin);
    }

    // Admin Exit / Logout Buttons
    var btnAdminBackSite = document.getElementById('btn-admin-back-site');
    if (btnAdminBackSite) {
      btnAdminBackSite.addEventListener('click', function () {
        window.location.hash = '#/';
      });
    }
    var btnLoginBackSite = document.getElementById('btn-login-back-site');
    if (btnLoginBackSite) {
      btnLoginBackSite.addEventListener('click', function () {
        window.location.hash = '#/';
      });
    }
    var btnAdminLogout = document.getElementById('btn-admin-logout');
    if (btnAdminLogout) {
      btnAdminLogout.addEventListener('click', function () {
        state.isAdminAuthenticated = false;
        window.location.hash = '#/';
        showToast('تم تسجيل الخروج من لوحة التحكم المحمية.');
      });
    }

    var btn404Home = document.getElementById('btn-404-home');
    if (btn404Home) {
      btn404Home.addEventListener('click', function () {
        window.location.hash = '#/';
      });
    }

    // Save Identity & Hero Form Button
    var btnSaveIdentity = document.getElementById('btn-save-identity');
    if (btnSaveIdentity) {
      btnSaveIdentity.addEventListener('click', function () {
        CONFIG.hero.titleAr = document.getElementById('cms-hero-title-ar').value.trim();
        CONFIG.hero.titleEn = document.getElementById('cms-hero-title-en').value.trim();
        CONFIG.hero.roleBadgeAr = document.getElementById('cms-hero-role-ar').value.trim();
        CONFIG.hero.roleBadgeEn = document.getElementById('cms-hero-role-en').value.trim();
        CONFIG.hero.brandBadgeAr = document.getElementById('cms-hero-brand-ar').value.trim();
        CONFIG.hero.brandBadgeEn = document.getElementById('cms-hero-brand-en').value.trim();
        CONFIG.hero.subtitleAr = document.getElementById('cms-hero-sub-ar').value.trim();
        CONFIG.hero.subtitleEn = document.getElementById('cms-hero-sub-en').value.trim();

        CONFIG.contact.nameAr = CONFIG.hero.titleAr;
        CONFIG.contact.nameEn = CONFIG.hero.titleEn;
        CONFIG.contact.whatsappNumber = document.getElementById('cms-contact-wa').value.trim();
        CONFIG.contact.email = document.getElementById('cms-contact-email').value.trim();
        CONFIG.contact.instagramBrand = document.getElementById('cms-contact-ig-brand').value.trim();
        CONFIG.contact.instagramPersonal = document.getElementById('cms-contact-ig-personal').value.trim();
        CONFIG.contact.driveWorkUrl = document.getElementById('cms-contact-drive1').value.trim();
        CONFIG.contact.driveCvPortfolioUrl = document.getElementById('cms-contact-drive2').value.trim();

        saveConfigToStorage();
        renderAll();
        showToast(UI_TEXT[state.lang].toastSavedCms);
      });
    }

    // Add New À La Carte Service Button
    var btnAddAlc = document.getElementById('btn-admin-add-alc');
    if (btnAddAlc) {
      btnAddAlc.addEventListener('click', function () {
        CONFIG.alaCarteServices.push({
          id: 'alc-custom-' + Date.now(),
          nameAr: 'خدمة جديدة بالقطعة',
          nameEn: 'New Custom Service',
          unitAr: 'لكل وحدة',
          unitEn: 'per unit',
          price: 50
        });
        saveConfigToStorage();
        renderAll();
        showToast(UI_TEXT[state.lang].toastSavedCms);
      });
    }

    // Add New CV Experience Button
    var btnAddExp = document.getElementById('btn-admin-add-exp');
    if (btnAddExp) {
      btnAddExp.addEventListener('click', function () {
        CONFIG.experience.unshift({
          id: 'exp-custom-' + Date.now(),
          periodAr: '2026 – الآن',
          periodEn: '2026 – Present',
          roleAr: 'مسمى وظيفي / خبرة جديدة',
          roleEn: 'New Role / Experience',
          orgAr: 'اسم المؤسسة أو المشروع',
          orgEn: 'Organization Name',
          pointsAr: ['تفاصيل الخبرة والمهام المنفذة.'],
          pointsEn: ['Key responsibilities and achievements.']
        });
        saveConfigToStorage();
        renderAll();
        showToast(UI_TEXT[state.lang].toastSavedCms);
      });
    }

    // Smart Invoice Studio Controls
    var btnInvAddPreset = document.getElementById('btn-inv-add-preset');
    if (btnInvAddPreset) {
      btnInvAddPreset.addEventListener('click', function () {
        var sel = document.getElementById('inv-service-preset-select');
        if (!sel || !sel.value) return;
        var parts = sel.value.split(':');
        var type = parts[0];
        var idx = Number(parts[1]);
        var concept = '';
        var price = 0;

        if (type === 'pkg' && CONFIG.monthlyPackages[idx]) {
          concept = CONFIG.monthlyPackages[idx].nameAr + ' (' + CONFIG.monthlyPackages[idx].nameEn + ')';
          price = Number(CONFIG.monthlyPackages[idx].price) || 0;
        } else if (type === 'alc' && CONFIG.alaCarteServices[idx]) {
          concept = CONFIG.alaCarteServices[idx].nameAr;
          price = Number(CONFIG.alaCarteServices[idx].price) || 0;
        } else if (type === 'prt' && CONFIG.printDigitalServices[idx]) {
          concept = 'تصميم مطبوعات: ' + CONFIG.printDigitalServices[idx].nameAr;
          price = 35;
        }
        if (concept) {
          state.currentInvoice.items.push({
            id: 'inv-item-' + Date.now(),
            concept: concept,
            units: 1,
            unitPrice: price
          });
          saveInvoiceState();
          renderSmartInvoiceStudio();
          sel.value = '';
          showToast('تم إدراج الخدمة وسعرها في الفاتورة تلقائياً!');
        }
      });
    }

    var btnInvAddEmpty = document.getElementById('btn-inv-add-empty');
    if (btnInvAddEmpty) {
      btnInvAddEmpty.addEventListener('click', function () {
        state.currentInvoice.items.push({
          id: 'inv-item-' + Date.now(),
          concept: 'بند خدمة جديد',
          units: 1,
          unitPrice: 50
        });
        saveInvoiceState();
        renderSmartInvoiceStudio();
      });
    }

    var btnInvSaveHistory = document.getElementById('btn-inv-save-history');
    if (btnInvSaveHistory) {
      btnInvSaveHistory.addEventListener('click', function () {
        var totals = calculateInvoiceTotals(state.currentInvoice);
        var record = deepClone(state.currentInvoice);
        record.id = 'arch-' + Date.now();
        record.total = totals.total;
        state.savedInvoices.unshift(record);

        // Auto-increment next invoice number
        var nextNum = state.savedInvoices.length + 1;
        var pad = nextNum < 10 ? '000' + nextNum : (nextNum < 100 ? '00' + nextNum : '0' + nextNum);
        state.currentInvoice.invoiceNumber = 'INV-' + pad;

        saveInvoiceState();
        renderSmartInvoiceStudio();
        showToast('تم حفظ الفاتورة في سجل الفواتير وتوليد رقم الفاتورة التالي!');
      });
    }

    // Export data.js Button
    var btnExportDataJs = document.getElementById('btn-export-data-js');
    if (btnExportDataJs) {
      btnExportDataJs.addEventListener('click', downloadUpdatedDataJs);
    }

    // Reset CMS to Factory Defaults Button
    var btnResetFactory = document.getElementById('btn-reset-cms-defaults');
    if (btnResetFactory) {
      btnResetFactory.addEventListener('click', function () {
        CONFIG = deepClone(window.PORTFOLIO_CONFIG);
        saveConfigToStorage();
        renderAll();
        showToast('تمت استعادة الإعدادات الأصلية بنجاح.');
      });
    }

    // Print Invoice inside Admin Tab 6
    var btnPrintInvoice = document.getElementById('btn-admin-print-invoice');
    if (btnPrintInvoice) {
      btnPrintInvoice.addEventListener('click', function () {
        window.print();
      });
    }

    // Update Security Slug & Password Hash
    var btnSaveSecurity = document.getElementById('btn-save-security-settings');
    if (btnSaveSecurity) {
      btnSaveSecurity.addEventListener('click', function () {
        var newSlug = (document.getElementById('cms-secret-slug-input').value || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
        var newUser = (document.getElementById('cms-new-admin-user').value || '').trim();
        var newPass = document.getElementById('cms-new-admin-pass').value || '';

        if (newSlug) {
          CONFIG.security.secretRouteSlug = newSlug;
        }
        if (newUser && newPass) {
          var salt = CONFIG.security.salt || 'MAHDI_MEDIA_PRO_SALT_2026';
          CONFIG.security.authHash = sha256Hex(salt + ':' + newUser + ':' + newPass);
          document.getElementById('cms-new-admin-pass').value = '';
        }
        saveConfigToStorage();
        renderAdminSecurityExportTab();
        window.location.hash = '#/' + CONFIG.security.secretRouteSlug;
        showToast('تم تحديث إعدادات الأمان والرابط السري بنجاح!');
      });
    }

    // Brand Asset File Inputs
    var assetInputs = document.querySelectorAll('[data-asset-input]');
    for (var a = 0; a < assetInputs.length; a++) {
      assetInputs[a].addEventListener('change', function (e) {
        var key = e.target.getAttribute('data-asset-input');
        var file = e.target.files && e.target.files[0];
        if (file && key) {
          processImageFileToDataUri(file, function (dataUrl) {
            CONFIG.assets[key] = dataUrl;
            saveConfigToStorage();
            renderAll();
            showToast('تم تحديث الصورة بنجاح!');
          });
        }
      });
    }

    // Brand Asset Dropzones
    var assetDropzones = document.querySelectorAll('[data-asset-drop]');
    for (var d = 0; d < assetDropzones.length; d++) {
      (function (zone) {
        var key = zone.getAttribute('data-asset-drop');
        zone.addEventListener('dragover', function (ev) {
          ev.preventDefault();
          zone.classList.add('drag-active');
        });
        zone.addEventListener('dragleave', function () {
          zone.classList.remove('drag-active');
        });
        zone.addEventListener('drop', function (ev) {
          ev.preventDefault();
          zone.classList.remove('drag-active');
          var file = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
          if (file && key) {
            processImageFileToDataUri(file, function (dataUrl) {
              CONFIG.assets[key] = dataUrl;
              saveConfigToStorage();
              renderAll();
              showToast('تم رفع الصورة بالسحب والإفلات بنجاح!');
            });
          }
        });
      })(assetDropzones[d]);
    }

    // Delegated Input & Change Listeners inside Admin CMS Dashboard
    var cmsDash = document.getElementById('admin-cms-dashboard');
    if (cmsDash) {
      cmsDash.addEventListener('input', function (e) {
        var t = e.target;
        if (t.hasAttribute('data-stat-field')) {
          var sIdx = Number(t.getAttribute('data-stat-idx'));
          var sField = t.getAttribute('data-stat-field');
          if (CONFIG.hero.stats[sIdx]) {
            CONFIG.hero.stats[sIdx][sField] = t.value;
            saveConfigToStorage();
            renderStaticLabels();
          }
        } else if (t.hasAttribute('data-work-field')) {
          var wIdx = Number(t.getAttribute('data-work-idx'));
          var wField = t.getAttribute('data-work-field');
          if (CONFIG.featuredWorks[wIdx]) {
            CONFIG.featuredWorks[wIdx][wField] = t.value;
            saveConfigToStorage();
            renderFeaturedWorks();
          }
        } else if (t.hasAttribute('data-pkg-field')) {
          var pIdx = Number(t.getAttribute('data-pkg-idx'));
          var pField = t.getAttribute('data-pkg-field');
          if (CONFIG.monthlyPackages[pIdx]) {
            CONFIG.monthlyPackages[pIdx][pField] = pField === 'price' ? Number(t.value) : t.value;
            saveConfigToStorage();
            renderMonthlyPackages();
            renderCalculator();
          }
        } else if (t.hasAttribute('data-alc-field')) {
          var aIdx = Number(t.getAttribute('data-alc-idx'));
          var aField = t.getAttribute('data-alc-field');
          if (CONFIG.alaCarteServices[aIdx]) {
            CONFIG.alaCarteServices[aIdx][aField] = aField === 'price' ? Number(t.value) : t.value;
            saveConfigToStorage();
            renderCalculator();
          }
        } else if (t.hasAttribute('data-exp-field')) {
          var eIdx = Number(t.getAttribute('data-exp-idx'));
          var eField = t.getAttribute('data-exp-field');
          if (CONFIG.experience[eIdx]) {
            CONFIG.experience[eIdx][eField] = t.value;
            saveConfigToStorage();
            renderCvSection();
          }
        } else if (t.hasAttribute('data-inv-item-field')) {
          var invIdx = Number(t.getAttribute('data-inv-idx'));
          var invField = t.getAttribute('data-inv-item-field');
          if (state.currentInvoice.items[invIdx]) {
            state.currentInvoice.items[invIdx][invField] = (invField === 'units' || invField === 'unitPrice') ? Number(t.value) : t.value;
            saveInvoiceState();
            renderSmartInvoiceStudio();
          }
        } else if (t.id === 'inv-number-input') {
          state.currentInvoice.invoiceNumber = t.value;
          saveInvoiceState();
          renderSmartInvoiceStudio();
        } else if (t.id === 'inv-date-input') {
          state.currentInvoice.invoiceDate = t.value;
          saveInvoiceState();
          renderSmartInvoiceStudio();
        } else if (t.id === 'inv-client-name-input') {
          state.currentInvoice.clientName = t.value;
          saveInvoiceState();
          renderSmartInvoiceStudio();
        } else if (t.id === 'inv-client-details-input') {
          state.currentInvoice.clientDetails = t.value;
          saveInvoiceState();
          renderSmartInvoiceStudio();
        } else if (t.id === 'inv-discount-input') {
          state.currentInvoice.discount = Number(t.value) || 0;
          saveInvoiceState();
          renderSmartInvoiceStudio();
        }
      });

      cmsDash.addEventListener('change', function (e) {
        var t = e.target;
        if (t.hasAttribute('data-work-img-input')) {
          var wIdx = Number(t.getAttribute('data-work-img-input'));
          var file = t.files && t.files[0];
          if (file && CONFIG.featuredWorks[wIdx]) {
            processImageFileToDataUri(file, function (dataUrl) {
              CONFIG.featuredWorks[wIdx].image = dataUrl;
              saveConfigToStorage();
              renderAll();
              showToast('تم تحديث صورة المشروع بنجاح!');
            });
          }
        }
      });

      cmsDash.addEventListener('dragstart', function (e) {
        var item = e.target.closest('.dnd-item');
        if (!item) return;
        state.dragSourceType = item.getAttribute('data-dnd-type');
        state.dragSourceIndex = Number(item.getAttribute('data-dnd-index'));
        item.classList.add('dragging');
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', String(state.dragSourceIndex));
        }
      });

      cmsDash.addEventListener('dragover', function (e) {
        var dropImgZone = e.target.closest('[data-work-img-drop]');
        if (dropImgZone && e.dataTransfer && e.dataTransfer.types && Array.prototype.indexOf.call(e.dataTransfer.types, 'Files') !== -1) {
          e.preventDefault();
          dropImgZone.classList.add('drag-active');
          return;
        }
        var overItem = e.target.closest('.dnd-item');
        if (!overItem) return;
        var overType = overItem.getAttribute('data-dnd-type');
        if (overType && overType === state.dragSourceType) {
          e.preventDefault();
          overItem.classList.add('drag-over');
        }
      });

      cmsDash.addEventListener('dragleave', function (e) {
        var dropImgZone = e.target.closest('[data-work-img-drop]');
        if (dropImgZone) dropImgZone.classList.remove('drag-active');
        var overItem = e.target.closest('.dnd-item');
        if (overItem) overItem.classList.remove('drag-over');
      });

      cmsDash.addEventListener('drop', function (e) {
        var dropImgZone = e.target.closest('[data-work-img-drop]');
        if (dropImgZone && e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          e.preventDefault();
          dropImgZone.classList.remove('drag-active');
          var wIdx = Number(dropImgZone.getAttribute('data-work-img-drop'));
          var file = e.dataTransfer.files[0];
          if (file && CONFIG.featuredWorks[wIdx]) {
            processImageFileToDataUri(file, function (dataUrl) {
              CONFIG.featuredWorks[wIdx].image = dataUrl;
              saveConfigToStorage();
              renderAll();
              showToast('تم تحديث صورة العمل المميز بالسحب والإفلات!');
            });
          }
          return;
        }

        var targetItem = e.target.closest('.dnd-item');
        if (!targetItem) return;
        targetItem.classList.remove('drag-over');
        var targetType = targetItem.getAttribute('data-dnd-type');
        var targetIndex = Number(targetItem.getAttribute('data-dnd-index'));

        if (targetType && targetType === state.dragSourceType && state.dragSourceIndex !== -1 && state.dragSourceIndex !== targetIndex) {
          e.preventDefault();
          var targetArr = CONFIG[targetType];
          if (Array.isArray(targetArr)) {
            moveArrayItem(targetArr, state.dragSourceIndex, targetIndex);
            saveConfigToStorage();
            renderAll();
            showToast('تم تحديث الترتيب بالسحب والإفلات بنجاح!');
          }
        }
      });

      cmsDash.addEventListener('dragend', function () {
        var items = cmsDash.querySelectorAll('.dnd-item');
        for (var i = 0; i < items.length; i++) {
          items[i].classList.remove('dragging', 'drag-over');
        }
        state.dragSourceType = null;
        state.dragSourceIndex = -1;
      });
    }

    // Global Click Delegation
    document.body.addEventListener('click', function (e) {
      var tabBtn = e.target.closest('[data-admin-tab]');
      if (tabBtn) {
        state.activeAdminTab = tabBtn.getAttribute('data-admin-tab');
        renderAdminDashboard();
        return;
      }

      var admBtn = e.target.closest('[data-admin-action]');
      if (admBtn) {
        var admAct = admBtn.getAttribute('data-admin-action');
        var listKey = admBtn.getAttribute('data-list');
        var idx = Number(admBtn.getAttribute('data-index'));

        if (admAct === 'move-up' && CONFIG[listKey]) {
          moveArrayItem(CONFIG[listKey], idx, idx - 1);
          saveConfigToStorage();
          renderAll();
        } else if (admAct === 'move-down' && CONFIG[listKey]) {
          moveArrayItem(CONFIG[listKey], idx, idx + 1);
          saveConfigToStorage();
          renderAll();
        } else if (admAct === 'toggle-section-vis') {
          var sec = CONFIG.sectionOrder[idx];
          if (sec) {
            sec.enabled = sec.enabled === false ? true : false;
            saveConfigToStorage();
            renderAll();
          }
        } else if (admAct === 'delete-work') {
          CONFIG.featuredWorks.splice(idx, 1);
          saveConfigToStorage();
          renderAll();
        } else if (admAct === 'delete-alc') {
          CONFIG.alaCarteServices.splice(idx, 1);
          saveConfigToStorage();
          renderAll();
        } else if (admAct === 'delete-exp') {
          CONFIG.experience.splice(idx, 1);
          saveConfigToStorage();
          renderAll();
        } else if (admAct === 'inv-delete-row') {
          state.currentInvoice.items.splice(idx, 1);
          saveInvoiceState();
          renderSmartInvoiceStudio();
        } else if (admAct === 'inv-load-saved') {
          if (state.savedInvoices[idx]) {
            state.currentInvoice = deepClone(state.savedInvoices[idx]);
            saveInvoiceState();
            renderSmartInvoiceStudio();
            showToast('تم تحميل الفاتورة من الأرشيف إلى محرر الفواتير!');
          }
        } else if (admAct === 'inv-delete-saved') {
          state.savedInvoices.splice(idx, 1);
          saveInvoiceState();
          renderSmartInvoiceStudio();
        }
        return;
      }

      var openModalBtn = e.target.closest('[data-open-modal]');
      if (openModalBtn) {
        var mId = openModalBtn.getAttribute('data-open-modal');
        var mEl = document.getElementById(mId);
        if (mEl) {
          if (mId === 'vcard-qr-modal') renderVcardModalContent();
          mEl.classList.remove('hidden');
        }
        return;
      }

      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-action');

      if (action === 'open-work-modal') {
        openWorkModal(btn.getAttribute('data-work-id'));
      } else if (action === 'select-pkg-calc') {
        var pkgId = btn.getAttribute('data-pkg-id');
        state.selectedPackageId = state.selectedPackageId === pkgId ? 'none' : pkgId;
        renderMonthlyPackages();
        renderCalculator();
        var calcEl = document.getElementById('quote-calculator');
        if (calcEl) calcEl.scrollIntoView({ behavior: 'smooth' });
        showToast(UI_TEXT[state.lang].toastAddedToCalc);
      } else if (action === 'set-calc-pkg') {
        state.selectedPackageId = btn.getAttribute('data-pkg-id');
        renderMonthlyPackages();
        renderCalculator();
      } else if (action === 'quick-pkg-whatsapp') {
        var qPkgId = btn.getAttribute('data-pkg-id');
        state.selectedPackageId = qPkgId;
        renderMonthlyPackages();
        renderCalculator();
        triggerWhatsapp();
      } else if (action === 'quick-pkg-email') {
        var ePkgId = btn.getAttribute('data-pkg-id');
        state.selectedPackageId = ePkgId;
        renderMonthlyPackages();
        renderCalculator();
        triggerOfficialEmail();
      } else if (action === 'toggle-print-item') {
        var pId = btn.getAttribute('data-print-id');
        if (state.selectedPrintIds[pId]) {
          delete state.selectedPrintIds[pId];
        } else {
          state.selectedPrintIds[pId] = true;
        }
        renderPrintDigitalGrid();
        updateQuoteSummaryAndMessage();
      } else if (action === 'alc-inc') {
        var incId = btn.getAttribute('data-alc-id');
        state.alaCarteCounts[incId] = (state.alaCarteCounts[incId] || 0) + 1;
        renderCalculator();
      } else if (action === 'alc-dec') {
        var decId = btn.getAttribute('data-alc-id');
        var cur = state.alaCarteCounts[decId] || 0;
        if (cur > 0) {
          state.alaCarteCounts[decId] = cur - 1;
          renderCalculator();
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
