/* ==========================================================================
   Mohammad Mahdi Takach | Mahdi Media Pro — Centralized Data & CMS Config
   All site content, section ordering, and hashed admin security settings.
   Zero API keys or plaintext passwords are stored in this file.
   ========================================================================== */
'use strict';

window.PORTFOLIO_CONFIG = {
  security: {
    secretRouteSlug: "mahdi-vault-admin",
    salt: "MAHDI_MEDIA_PRO_SALT_2026",
    // Salted SHA-256 hash of "MAHDI_MEDIA_PRO_SALT_2026:mahdi.admin:MahdiMedia@2026!"
    authHash: "ee0743d480dc393e1c9a22f53795efad8d9564c171ddfb33661ae526de6a8279",
    maxLoginAttempts: 5,
    lockoutSeconds: 60
  },

  assets: {
    logo: "assets/images/logo.png",
    profile: "assets/images/profile.jpg",
    cover: "assets/images/cover.jpg",
    servicesPost: "assets/images/services-post.jpg"
  },

  sectionOrder: [
    { id: "featured-works", titleAr: "الأعمال المميزة (Featured Works)", titleEn: "Featured Works", enabled: true },
    { id: "portfolio-vault", titleAr: "خانة معرض الأعمال الكامل (Google Drive Vaults)", titleEn: "Google Drive Portfolio Vaults", enabled: true },
    { id: "services-pricing", titleAr: "الباقات الشهرية والتصميم الطباعي (Packages & Print)", titleEn: "Monthly Packages & Print Design", enabled: true },
    { id: "quote-calculator", titleAr: "حاسبة التكلفة التقريبية (Approximate Calculator)", titleEn: "Approximate Cost Calculator", enabled: true },
    { id: "cv-section", titleAr: "السيرة الذاتية والخبرات (CV & Experience)", titleEn: "CV, Experience & Education", enabled: true }
  ],

  hero: {
    roleBadgeAr: "مصور فوتوغرافي • مصور فيديو • مونتير فيديو • مصمم غرافيك",
    roleBadgeEn: "Photographer • Videographer • Video Editor • Graphic Designer",
    titleAr: "محمد مهدي الطقش",
    titleEn: "Mohammad Mahdi Takach",
    brandBadgeAr: "مؤسس Mahdi Media للإنتاج المرئي والتصميم",
    brandBadgeEn: "Founder of Mahdi Media Pro — Visual Production & Design",
    subtitleAr: "خبرة عملية وميدانية تمتد لأكثر من 6 سنوات (منذ عام 2019) في تصوير ومونتاج أكثر من 150 تقريراً إخبارياً تلفزيونياً (لصالح قناتي المنار والميادين)، وإنتاج البودكاست والمحتوى المرئي والتصاميم الغرافيكية للشركات والمؤسسات.",
    subtitleEn: "Over 6 years of hands-on field and studio experience (since 2019), filming and editing 150+ broadcast TV news reports (for Al-Manar & Al-Mayadeen), producing video podcasts, and crafting visual identities for agencies and institutions.",
    stats: [
      { id: "stat-1", numAr: "+6", numEn: "6+", labelAr: "سنوات خبرة ميدانية واستوديو (منذ 2019)", labelEn: "Years of Field & Studio Experience (Since 2019)" },
      { id: "stat-2", numAr: "+150", numEn: "150+", labelAr: "تقرير إخباري وميداني متلفز (المنار والميادين)", labelEn: "Broadcast TV News & Field Reports" },
      { id: "stat-3", numAr: "+10", numEn: "10+", labelAr: "شركات ومؤسسات وحملات إعلامية وبودكاست", labelEn: "Agencies, NGOs & Podcast Productions" },
      { id: "stat-4", numAr: "12+", numEn: "12+", labelAr: "خدمة تصميم غرافيكي طباعي ورقمي متكاملة", labelEn: "Print & Digital Graphic Design Specialties" }
    ]
  },

  contact: {
    nameAr: "محمد مهدي الطقش",
    nameEn: "Mohammad Mahdi Takach",
    brandAr: "مهدي ميديا | Mahdi Media",
    brandEn: "Mahdi Media Pro",
    phoneDisplay: "+961 81 947 685",
    whatsappNumber: "96181947685",
    email: "mhmdmahditakach@gmail.com",
    telegram: "mhmdmahditakach",
    instagramPersonal: "mhmdmahditakach",
    instagramBrand: "mahdi.media.pro",
    locationAr: "بيروت والبقاع، لبنان",
    locationEn: "Beirut & Bekaa, Lebanon",
    driveWorkUrl: "https://drive.google.com/drive/folders/1vRzDhx01ktw4y4p_fqv-AcFg-RI4ekvu?usp=drive_link",
    driveCvPortfolioUrl: "https://drive.google.com/drive/folders/16FWoGru920L5Le86opUpWNt2pXbPH2Zd?usp=sharing",
    universityUrl: "https://www.mu.edu.lb/en/faculties/fba/study-programs/department-of-information-technology-and-management-systems/?id=accor-11924"
  },

  featuredWorks: [
    {
      id: "work-broadcast-reports",
      category: "broadcast",
      featured: true,
      image: "assets/images/broadcast-thumb.jpg",
      badgeAr: "+150 تقرير متلفز",
      badgeEn: "150+ TV Reports",
      clientAr: "لصالح قناتي المنار والميادين",
      clientEn: "For Al-Manar TV & Al-Mayadeen TV",
      periodAr: "2024 – الآن",
      periodEn: "2024 – Present",
      titleAr: "تصوير ومونتاج التقارير الإخبارية والميدانية التلفزيونية",
      titleEn: "Broadcast News & Field Report Filming and Editing",
      descAr: "تصوير ومونتاج أكثر من 150 تقريراً إخبارياً وميدانياً وتغطية الأحداث بالصورة والفيديو في مواقع الحدث بالتنسيق المباشر مع المراسلين ومعدّي التقارير، مع مونتاج سريع وعالي الدقة للبث التلفزيوني.",
      descEn: "Filmed and edited over 150 broadcast news and field reports, covering live events on location in direct coordination with correspondents and producers with rapid turnaround for television broadcast.",
      tools: ["Sony & Canon Cinema", "Adobe Premiere Pro", "Field Audio & Lighting"],
      driveLink: "https://drive.google.com/drive/folders/1vRzDhx01ktw4y4p_fqv-AcFg-RI4ekvu?usp=drive_link"
    },
    {
      id: "work-sawtak-podcast",
      category: "podcast",
      featured: true,
      image: "assets/images/podcast-thumb.jpg",
      badgeAr: "إنتاج بودكاست ومحتوى مرئي",
      badgeEn: "Podcast & Video Production",
      clientAr: "شركة ماركيتك (Marketech) — قناة صوتك",
      clientEn: "Marketech Agency — Sawtak Channel",
      periodAr: "2023 – 2024",
      periodEn: "2023 – 2024",
      titleAr: "تصوير وإضاءة ومونتاج حلقات بودكاست «قناة صوتك» و10+ عملاء",
      titleEn: "Multi-Cam Filming, Lighting & Editing for 'Sawtak' Podcast & 10+ Clients",
      descAr: "إعداد وتوزيع الإضاءة والتسجيل الصوتي الاحترافي في مواقع التصوير، ومونتاج الحلقات الكاملة والمقاطع الترويجية (Reels) وتنفيذ التصاميم الغرافيكية لحوالي 10 عملاء.",
      descEn: "Full studio lighting setup, multi-channel audio recording, episode editing, short-form Reels cutdowns, and graphic design execution for around 10 agency clients including Sawtak Podcast.",
      tools: ["Premiere Pro", "After Effects", "Studio Lighting", "Multi-Mic Audio"],
      driveLink: "https://drive.google.com/drive/folders/16FWoGru920L5Le86opUpWNt2pXbPH2Zd?usp=sharing"
    },
    {
      id: "work-paradigm-documentary",
      category: "documentary",
      featured: true,
      image: "assets/images/editing-thumb.jpg",
      badgeAr: "توثيق مرئي ومطبوعات",
      badgeEn: "Documentary & Print",
      clientAr: "جمعية بارادايم (Paradigm - تحت رعاية سيميا)",
      clientEn: "Paradigm Association (Under Simia Sponsorship)",
      periodAr: "2023 – 2025",
      periodEn: "2023 – 2025",
      titleAr: "إنتاج الفيديوهات التوثيقية والتوعوية وتصميم المطبوعات",
      titleEn: "Documentary & Awareness Video Production and Print Design",
      descAr: "توثيق الأنشطة والبرامج المجتمعية والمقابلات الميدانية عبر التصوير الفوتوغرافي والفيديو، ومونتاج الأفلام القصيرة وتصميم المطبوعات والمنشورات البصرية بالتعاون مع مسؤولي البرامج.",
      descEn: "Documented community programs, field interviews, and institutional events through photography and video, alongside editing awareness videos and designing print/digital publications.",
      tools: ["Adobe Premiere Pro", "After Effects", "Adobe Photoshop", "Canon / Sony"],
      driveLink: "https://drive.google.com/drive/folders/16FWoGru920L5Le86opUpWNt2pXbPH2Zd?usp=sharing"
    },
    {
      id: "work-mahdi-media-design",
      category: "design",
      featured: true,
      image: "assets/images/services-post.jpg",
      badgeAr: "هوية بصرية ومطبوعات",
      badgeEn: "Brand & Print Design",
      clientAr: "مهدي ميديا (Mahdi Media Pro)",
      clientEn: "Mahdi Media Pro",
      periodAr: "2025 – الآن",
      periodEn: "2025 – Present",
      titleAr: "تصميم الهويات البصرية والمطبوعات التجارية ومنشورات التواصل",
      titleEn: "Visual Identity, Commercial Print & Social Media Graphic Design",
      descAr: "تنفيذ تصاميم المطبوعات الاحترافية (بطاقات عمل، قوائم طعام، بروشورات، هويات، شهادات، بنرات) وتصاميم السوشيال ميديا وتصحيح الألوان لأكثر من 10 مشاريع ومؤسسات متنوعة.",
      descEn: "Comprehensive print and digital design solutions including business cards, restaurant menus, brochures, ID cards, certificates, flex/web banners, and social media visuals.",
      tools: ["Adobe Photoshop", "After Effects", "Print Pre-Press", "Visual Branding"],
      driveLink: "https://drive.google.com/drive/folders/1vRzDhx01ktw4y4p_fqv-AcFg-RI4ekvu?usp=drive_link"
    },
    {
      id: "work-bekaa-media-coverage",
      category: "broadcast",
      featured: true,
      image: "assets/images/cover.jpg",
      badgeAr: "+6 سنوات خبرة ميدانية",
      badgeEn: "6+ Years Field Coverage",
      clientAr: "الفرع الإعلامي في القطاع الأول — البقاع الأوسط",
      clientEn: "Media Branch, First Sector — Central Bekaa",
      periodAr: "2019 – الآن",
      periodEn: "2019 – Present",
      titleAr: "التغطية الميدانية الشاملة للفعاليات وإنتاج التقارير المرئية",
      titleEn: "Comprehensive Event Field Coverage & Visual Report Production",
      descAr: "العمل ضمن فريق العمل الإعلامي في التغطية الفوتوغرافية والمرئية للفعاليات والأنشطة الكبرى وإعداد ومونتاج التقارير المرئية وتصاميم المناسبات.",
      descEn: "Long-standing field photography, videography, visual report editing, and event graphic design across the Central Bekaa region.",
      tools: ["Field Photography", "Videography", "Premiere Pro", "Photoshop"],
      driveLink: "https://drive.google.com/drive/folders/1vRzDhx01ktw4y4p_fqv-AcFg-RI4ekvu?usp=drive_link"
    }
  ],

  monthlyPackages: [
    {
      id: "pkg-starter",
      nameAr: "باقة البداية | Starter",
      nameEn: "Starter Package",
      price: 150,
      periodAr: "/ شهرياً",
      periodEn: "/ Month",
      badgeAr: "مناسبة للانطلاق",
      badgeEn: "Essential Start",
      popular: false,
      featuresAr: [
        "8 تصاميم غرافيك / منشورات ثابتة (Graphic / Static Posts)",
        "4 فيديوهات ريلز مع مونتاج احترافي (Edited Reels)",
        "تسليم بجودة عالية متوافقة مع منصات التواصل"
      ],
      featuresEn: [
        "8 Graphic / Static Posts",
        "4 Professionally Edited Reels",
        "High-resolution delivery optimized for social platforms"
      ]
    },
    {
      id: "pkg-standard",
      nameAr: "الباقة القياسية | Standard",
      nameEn: "Standard Package",
      price: 400,
      periodAr: "/ شهرياً",
      periodEn: "/ Month",
      badgeAr: "الأكثر طلباً",
      badgeEn: "Most Popular",
      popular: true,
      featuresAr: [
        "15 تصميم غرافيك / منشور ثابت (Graphic / Static Posts)",
        "8 فيديوهات ريلز مع مونتاج احترافي (Edited Reels)",
        "جلسة تصوير ميداني لنصف يوم (1 Half-Day Shoot)"
      ],
      featuresEn: [
        "15 Graphic / Static Posts",
        "8 Professionally Edited Reels",
        "1 Half-Day On-Location Shoot (Photo/Video)"
      ]
    },
    {
      id: "pkg-growth",
      nameAr: "باقة النمو | Growth",
      nameEn: "Growth Package",
      price: 700,
      periodAr: "/ شهرياً",
      periodEn: "/ Month",
      badgeAr: "تغطية شاملة للشركات",
      badgeEn: "Full Brand Scale",
      popular: false,
      featuresAr: [
        "20 تصميم غرافيك / منشور ثابت (Graphic / Static Posts)",
        "12 فيديو ريلز مع مونتاج احترافي (Edited Reels)",
        "جلستا تصوير نصف يوم أو جلسة يوم كامل (2 Half-Day or 1 Full-Day Shoot)"
      ],
      featuresEn: [
        "20 Graphic / Static Posts",
        "12 Professionally Edited Reels",
        "2 Half-Day Shoots (or 1 Full-Day Shoot)"
      ]
    }
  ],

  alaCarteServices: [
    {
      id: "alc-static-post",
      nameAr: "تصميم منشور غرافيك ثابت (1 Graphic / Static Post)",
      nameEn: "1 Graphic / Static Post",
      unitAr: "لكل تصميم",
      unitEn: "per post",
      price: 20
    },
    {
      id: "alc-reel-30s",
      nameAr: "مونتاج ريلز 30 ثانية (Edit Only)",
      nameEn: "30-Second Reel (Edit Only)",
      unitAr: "لكل فيديو",
      unitEn: "per reel",
      price: 20
    },
    {
      id: "alc-reel-60s",
      nameAr: "مونتاج ريلز 60 ثانية (Edit Only)",
      nameEn: "60-Second Reel (Edit Only)",
      unitAr: "لكل فيديو",
      unitEn: "per reel",
      price: 30
    },
    {
      id: "alc-reel-90s",
      nameAr: "مونتاج ريلز 90 ثانية (Edit Only)",
      nameEn: "90-Second Reel (Edit Only)",
      unitAr: "لكل فيديو",
      unitEn: "per reel",
      price: 50
    },
    {
      id: "alc-reel-120s",
      nameAr: "مونتاج ريلز دقيقتين (2-Minute Reel Edit Only)",
      nameEn: "2-Minute Reel (Edit Only)",
      unitAr: "لكل فيديو",
      unitEn: "per reel",
      price: 70
    },
    {
      id: "alc-half-day-shoot",
      nameAr: "تصوير نصف يوم — فيديو / فوتوغرافي (Half-Day Shoot)",
      nameEn: "Half-Day Shoot (Videography / Photography)",
      unitAr: "لكل جلسة",
      unitEn: "per session",
      price: 150
    },
    {
      id: "alc-full-day-shoot",
      nameAr: "تصوير يوم كامل — فيديو / فوتوغرافي (Full-Day Shoot)",
      nameEn: "Full-Day Shoot (Videography / Photography)",
      unitAr: "لكل جلسة",
      unitEn: "per session",
      price: 250
    }
  ],

  printDigitalServices: [
    { id: "pd-business-cards", nameAr: "بطاقات عمل (Business Cards)", nameEn: "Business Cards" },
    { id: "pd-menu-cards", nameAr: "قوائم طعام للمطاعم (Menu Cards)", nameEn: "Menu Cards" },
    { id: "pd-brochure", nameAr: "بروشورات تعريفية (Brochure)", nameEn: "Brochure" },
    { id: "pd-invitation", nameAr: "بطاقات دعوة (Invitation Cards)", nameEn: "Invitation Cards" },
    { id: "pd-letterhead", nameAr: "ورق رسمي مروس (Letterhead)", nameEn: "Letterhead" },
    { id: "pd-id-cards", nameAr: "بطاقات تعريفية (ID Cards)", nameEn: "ID Cards" },
    { id: "pd-posters", nameAr: "ملصقات وبوسترات (Posters)", nameEn: "Posters" },
    { id: "pd-pamphlet", nameAr: "مطويات وكتيبات (Pamphlet)", nameEn: "Pamphlet" },
    { id: "pd-certificates", nameAr: "شهادات تقدير وتخرج (Certificates)", nameEn: "Certificates" },
    { id: "pd-wedding-cards", nameAr: "بطاقات زفاف ومناسبات (Wedding Cards)", nameEn: "Wedding Cards" },
    { id: "pd-flex-banners", nameAr: "لافتات فليكس خارجية (Flex Banners)", nameEn: "Flex Banners" },
    { id: "pd-web-banners", nameAr: "بنرات مواقع وإعلانات (Web Banners)", nameEn: "Web Banners" }
  ],

  experience: [
    {
      id: "exp-1",
      periodAr: "2025 – الآن",
      periodEn: "2025 – Present",
      roleAr: "مصور فوتوغرافي وفيديو ومونتير ومصمم غرافيك مستقل",
      roleEn: "Freelance Photographer, Videographer, Video Editor & Graphic Designer",
      orgAr: "عمل حر ومؤسسات خيرية واجتماعية ودينية (Mahdi Media)",
      orgEn: "Freelance & Social, Charitable and Religious Institutions (Mahdi Media)",
      pointsAr: [
        "تنفيذ أعمال التصوير الفوتوغرافي والفيديو الميداني وفي الاستوديو لأكثر من 10 مشاريع متنوعة بالتنسيق المباشر مع منظمي الفعاليات.",
        "مونتاج الفيديوهات والتغطيات الإعلامية وتصحيح الألوان ومعالجة الصوت عبر Premiere Pro وAfter Effects، وتصميم المطبوعات والمنشورات عبر Photoshop."
      ],
      pointsEn: [
        "Executed field and studio photography and videography for 10+ diverse projects and institutional events in direct coordination with organizers.",
        "Edited media coverage, performed color grading and audio mastering via Premiere Pro and After Effects, and designed print/digital assets via Photoshop."
      ]
    },
    {
      id: "exp-2",
      periodAr: "2024 – الآن",
      periodEn: "2024 – Present",
      roleAr: "مصور ومونتير تقارير إخبارية",
      roleEn: "Broadcast News Cameraman & Video Editor",
      orgAr: "لصالح قناة المنار وقناة الميادين",
      orgEn: "For Al-Manar TV & Al-Mayadeen TV",
      pointsAr: [
        "تصوير ومونتاج أكثر من 150 تقريراً إخبارياً وميدانياً إجمالاً تقريباً، وتغطية الأحداث بالصورة والفيديو في مواقع الحدث بالتنسيق الميداني المباشر مع المراسلين ومعدّي التقارير.",
        "مونتاج فيديو التقارير الإخبارية وإرسالها إلى معدّ التقارير لاستكمال تجهيزها للبث."
      ],
      pointsEn: [
        "Filmed and edited over 150 broadcast news and field reports, covering live events on location in direct coordination with field correspondents and producers.",
        "Edited news packages under tight broadcast deadlines for Al-Manar TV primarily and Al-Mayadeen TV."
      ]
    },
    {
      id: "exp-3",
      periodAr: "2023 – 2025",
      periodEn: "2023 – 2025",
      roleAr: "مصور وفيديوغرافر ومونتير محتوى توثيقي ومصمم غرافيك",
      roleEn: "Photographer, Videographer, Documentary Editor & Graphic Designer",
      orgAr: "جمعية بارادايم (Paradigm - تحت رعاية سيميا)، لبنان",
      orgEn: "Paradigm Association (Under Simia Sponsorship), Lebanon",
      pointsAr: [
        "توثيق الأنشطة والبرامج والفعاليات المجتمعية والمقابلات الميدانية عبر التصوير الفوتوغرافي وتصوير الفيديوهات.",
        "مونتاج الفيديوهات التوثيقية والتوعوية عبر بريمير برو وأفتر إفكتس، وتصميم المطبوعات والمنشورات البصرية عبر فوتوشوب."
      ],
      pointsEn: [
        "Documented community activities, programs, and field interviews through photography and videography.",
        "Edited documentary and awareness videos using Premiere Pro and After Effects, and designed print and digital publications in Photoshop."
      ]
    },
    {
      id: "exp-4",
      periodAr: "2023 – 2024",
      periodEn: "2023 – 2024",
      roleAr: "مصور ومونتير محتوى مرئي وبودكاست ومصمم غرافيك",
      roleEn: "Visual Content & Podcast Videographer/Editor & Graphic Designer",
      orgAr: "شركة ماركيتك (Marketech)، لبنان",
      orgEn: "Marketech Agency, Lebanon",
      pointsAr: [
        "متابعة وتنفيذ الأعمال البصرية لحوالي 10 عملاء، من أهمهم «قناة صوتك» حيث تم تصوير ومونتاج العديد من حلقات البودكاست مع إعداد وتوزيع الإضاءة والتسجيل الصوتي.",
        "مونتاج الفيديوهات والمقاطع المرئية عبر بريمير برو وأفتر إفكتس، وإعداد التصاميم الغرافيكية عبر فوتوشوب وتنفيذ التعديلات المطلوبة من العملاء."
      ],
      pointsEn: [
        "Managed and executed visual production for ~10 clients, most notably 'Sawtak' channel, filming and editing podcast episodes with full lighting and audio setup.",
        "Edited promotional videos and reels via Premiere Pro and After Effects, and created social media graphics in Photoshop."
      ]
    },
    {
      id: "exp-5",
      periodAr: "2019 – الآن",
      periodEn: "2019 – Present",
      roleAr: "مصور فوتوغرافي وفيديو ومونتير ومصمم غرافيك (دوام جزئي)",
      roleEn: "Photographer, Videographer, Editor & Graphic Designer (Part-Time)",
      orgAr: "الفرع الإعلامي في القطاع الأول، منطقة البقاع الأوسط",
      orgEn: "Media Branch in First Sector, Central Bekaa Region",
      pointsAr: [
        "العمل بدوام جزئي في التغطية الميدانية للفعاليات والأنشطة والبرامج الإعلامية في منطقة البقاع الأوسط.",
        "إعداد ومونتاج التقارير المرئية والمواد المصورة وإنجاز التصاميم الغرافيكية للمناسبات والأنشطة."
      ],
      pointsEn: [
        "Part-time field photography and video coverage for regional events, activities, and media programs in Central Bekaa.",
        "Produced and edited visual reports and graphic designs for community events and institutional occasions."
      ]
    }
  ],

  education: [
    {
      id: "edu-1",
      periodAr: "2024 – الآن",
      periodEn: "2024 – Present",
      degreeAr: "طالب إجازة في تكنولوجيا المعلومات وأنظمة الإدارة (MIT) – قيد الدراسة",
      degreeEn: "Bachelor of Information Technology & Management Information Systems (MIT) – In Progress",
      schoolAr: "جامعة المعارف، بيروت، لبنان",
      schoolEn: "Al Maaref University, Beirut, Lebanon",
      link: "https://www.mu.edu.lb/en/faculties/fba/study-programs/department-of-information-technology-and-management-systems/?id=accor-11924"
    },
    {
      id: "edu-2",
      periodAr: "2023 – 2024",
      periodEn: "2023 – 2024",
      degreeAr: "البكالوريا الفنية (BT3) في المحاسبة والمعلوماتية",
      degreeEn: "Technical Baccalaureate (BT3) in Accounting & Informatics",
      schoolAr: "معهد الآفاق، لبنان",
      schoolEn: "Al-Afaq Institute, Lebanon",
      link: ""
    }
  ]
};
