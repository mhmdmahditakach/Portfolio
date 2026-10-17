/* ==========================================================================
   Mohammad Mahdi Takach | Mahdi Media Pro — Main Interactive Application
   Security-hardened: strict mode, DOM text sanitization, safe storage wrapper
   ========================================================================== */
'use strict';

(function () {
  var state = {
    lang: 'ar',
    workFilter: 'all',
    selectedPackageId: 'none',
    alaCarteCounts: {},
    selectedPrintIds: {},
    clientName: '',
    clientOrg: '',
    clientNotes: '',
    customWorks: []
  };

  // Safe localStorage wrapper
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
      // Ignore storage errors in sandboxed iframes
    }
  }

  // HTML Escaping to prevent XSS vulnerabilities
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
      heroTitle: "محمد مهدي طقش",
      heroBrandBadge: "مؤسس Mahdi Media للإنتاج المرئي والتصميم",
      heroSubtitle: "خبرة عملية وميدانية تمتد لأكثر من 6 سنوات (منذ عام 2019) في تصوير ومونتاج أكثر من 150 تقريراً إخبارياً تلفزيونياً (لصالح قناتي المنار والميادين)، وإنتاج البودكاست والمحتوى المرئي والتصاميم الغرافيكية للشركات والمؤسسات.",
      heroBtnQuote: "احسب التكلفة التقريبية لمشروعك",
      heroBtnWorks: "استعرض الأعمال المميزة",
      heroBtnVault: "تصفح أرشيف Google Drive",
      statYearsNum: "+6",
      statYearsLabel: "سنوات خبرة ميدانية واستوديو (منذ 2019)",
      statReportsNum: "+150",
      statReportsLabel: "تقرير إخباري وميداني متلفز (المنار والميادين)",
      statClientsNum: "+10",
      statClientsLabel: "شركات ومؤسسات وحملات إعلامية وبودكاست",
      statPrintNum: "12+",
      statPrintLabel: "خدمة تصميم غرافيكي طباعي ورقمي متكاملة",
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
      disclaimerText: "هذا المبلغ تقريبي واسترشادي فقط. يتم تحديد السعر النهائي بالاتفاق المباشر بعد مناقشة تفاصيل المشروع ومتطلباته بدقة.",
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
      footerRights: "جميع الحقوق محفوظة © محمد مهدي طقش — Mahdi Media Pro",
      toastCopied: "تم نسخ تفاصيل الطلب إلى الحافظة بنجاح!",
      toastAddedToCalc: "تم تحديث حاسبة التكلفة واختيار الخدمة بنجاح!"
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
      statYearsNum: "6+",
      statYearsLabel: "Years of Field & Studio Experience (Since 2019)",
      statReportsNum: "150+",
      statReportsLabel: "Broadcast TV News & Field Reports",
      statClientsNum: "10+",
      statClientsLabel: "Agencies, NGOs & Podcast Productions",
      statPrintNum: "12+",
      statPrintLabel: "Print & Digital Graphic Design Specialties",
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
      toastCopied: "Order details copied to clipboard!",
      toastAddedToCalc: "Estimator updated with your selected service!"
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

  function getAllWorks() {
    var base = window.PORTFOLIO_CONFIG.featuredWorks || [];
    return state.customWorks.concat(base);
  }

  // Render Static Bilingual Labels
  function renderStaticLabels() {
    var t = UI_TEXT[state.lang];
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';

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
  }

  // Render Featured Works Grid
  function renderFeaturedWorks() {
    var container = document.getElementById('featured-works-grid');
    if (!container) return;
    var t = UI_TEXT[state.lang];
    var works = getAllWorks();
    var filtered = works.filter(function (w) {
      return state.workFilter === 'all' || w.category === state.workFilter;
    });

    // Update filter buttons active state
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

  // Render Monthly Packages
  function renderMonthlyPackages() {
    var container = document.getElementById('monthly-packages-grid');
    if (!container) return;
    var t = UI_TEXT[state.lang];
    var pkgs = window.PORTFOLIO_CONFIG.monthlyPackages;
    var html = '';

    for (var i = 0; i < pkgs.length; i++) {
      var p = pkgs[i];
      var name = state.lang === 'ar' ? p.nameAr : p.nameEn;
      var period = state.lang === 'ar' ? p.periodAr : p.periodEn;
      var badge = state.lang === 'ar' ? p.badgeAr : p.badgeEn;
      var feats = state.lang === 'ar' ? p.featuresAr : p.featuresEn;
      var isSelected = state.selectedPackageId === p.id;

      var featsHtml = '';
      for (var f = 0; f < feats.length; f++) {
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
            (isSelected ? 'bg-green-500 text-black' : 'bg-[#F7C038] hover:bg-[#eab308] text-black') + '">' +
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

  // Render Print & Digital Design Grid
  function renderPrintDigitalGrid() {
    var container = document.getElementById('print-digital-grid');
    var calcPrintContainer = document.getElementById('calc-print-chips');
    if (!container) return;
    var t = UI_TEXT[state.lang];
    var items = window.PORTFOLIO_CONFIG.printDigitalServices;
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

  // Render Calculator Controls & Summary
  function renderCalculator() {
    var t = UI_TEXT[state.lang];
    var pkgOptionsContainer = document.getElementById('calc-pkg-options');
    var alcListContainer = document.getElementById('calc-alc-list');

    if (pkgOptionsContainer) {
      var pkgs = window.PORTFOLIO_CONFIG.monthlyPackages;
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
      var alcs = window.PORTFOLIO_CONFIG.alaCarteServices;
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

    // 1. Package
    var pkgs = window.PORTFOLIO_CONFIG.monthlyPackages;
    for (var i = 0; i < pkgs.length; i++) {
      if (pkgs[i].id === state.selectedPackageId) {
        total += pkgs[i].price;
        linesAr.push("• الباقة الشهرية: " + pkgs[i].nameAr + " ($" + pkgs[i].price + "/شهرياً)");
        linesEn.push("• Monthly Package: " + pkgs[i].nameEn + " ($" + pkgs[i].price + "/month)");
      }
    }

    // 2. À La Carte
    var alcs = window.PORTFOLIO_CONFIG.alaCarteServices;
    for (var j = 0; j < alcs.length; j++) {
      var qty = state.alaCarteCounts[alcs[j].id] || 0;
      if (qty > 0) {
        var sub = qty * alcs[j].price;
        total += sub;
        linesAr.push("• " + alcs[j].nameAr + " × " + qty + " (تقريبي: $" + sub + ")");
        linesEn.push("• " + alcs[j].nameEn + " × " + qty + " (Approx: $" + sub + ")");
      }
    }

    // 3. Print & Digital items
    var prints = window.PORTFOLIO_CONFIG.printDigitalServices;
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
      msgLines.push("مرحباً أستاذ محمد مهدي طقش (Mahdi Media)،");
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
      msgLines.push("Hello Mohammad Mahdi Takach (Mahdi Media),");
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

  // Render CV Timeline & Education
  function renderCvSection() {
    var expContainer = document.getElementById('cv-experience-list');
    var eduContainer = document.getElementById('cv-education-list');
    if (expContainer) {
      var exps = window.PORTFOLIO_CONFIG.experience;
      var expHtml = '';
      for (var i = 0; i < exps.length; i++) {
        var e = exps[i];
        var role = state.lang === 'ar' ? e.roleAr : e.roleEn;
        var org = state.lang === 'ar' ? e.orgAr : e.orgEn;
        var period = state.lang === 'ar' ? e.periodAr : e.periodEn;
        var pts = state.lang === 'ar' ? e.pointsAr : e.pointsEn;

        var ptsHtml = '';
        for (var p = 0; p < pts.length; p++) {
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
      var edus = window.PORTFOLIO_CONFIG.education;
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
    renderStaticLabels();
    renderFeaturedWorks();
    renderMonthlyPackages();
    renderPrintDigitalGrid();
    renderCalculator();
    renderCvSection();
  }

  // Open Work Detail Modal
  function openWorkModal(workId) {
    var works = getAllWorks();
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

  // Open Official Email Modal + Trigger mailto
  function triggerOfficialEmail(customSubject, customBody) {
    var calc = buildOrderCalculation();
    var subject = customSubject || calc.subjectText;
    var body = customBody || calc.messageText;
    var email = window.PORTFOLIO_CONFIG.contact.email;

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
    var phone = window.PORTFOLIO_CONFIG.contact.whatsappNumber;
    var waUrl = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(text);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }

  // Initialize App & Event Delegation
  function initApp() {
    var savedLang = safeGetStorage('mahdi_portfolio_lang', 'ar');
    if (savedLang === 'en' || savedLang === 'ar') {
      state.lang = savedLang;
    }
    state.customWorks = safeGetStorage('mahdi_custom_works', []);

    renderAll();

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

    // Input listeners for calculator client fields
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
    if (btnWa) {
      btnWa.addEventListener('click', function () {
        triggerWhatsapp();
      });
    }

    var btnEm = document.getElementById('btn-send-email');
    if (btnEm) {
      btnEm.addEventListener('click', function () {
        triggerOfficialEmail();
      });
    }

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

    // Open Add Featured Work Modal
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
        var driveUrl = document.getElementById('new-work-drive').value.trim() || window.PORTFOLIO_CONFIG.contact.driveWorkUrl;

        if (!titleAr) return;

        var newWork = {
          id: 'custom-work-' + Date.now(),
          category: cat,
          featured: true,
          image: 'assets/images/cover.jpg',
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

        state.customWorks.unshift(newWork);
        safeSetStorage('mahdi_custom_works', state.customWorks);
        renderFeaturedWorks();
        addWorkForm.reset();
        document.getElementById('add-work-modal').classList.add('hidden');
        showToast(state.lang === 'ar' ? 'تمت إضافة العمل المميز إلى الصفحة الرئيسية!' : 'Featured work added to homepage!');
      });
    }

    // Global Event Delegation for dynamic cards & calculator controls
    document.body.addEventListener('click', function (e) {
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
