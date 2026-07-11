/**
 * Pure helpers for SIS Al Jada Cobras site — testable without a full browser.
 * Loaded before site.js; attaches to globalThis.CobrasLib.
 */
(function (global) {
  const RACE_ISO = '2027-02-13T09:00:00+04:00';
  const NAV_COLLAPSE_THRESHOLD = 48;

  const STRINGS = {
    en: {
      'nav.home': 'Home',
      'nav.members': 'Members',
      'nav.work': 'Our Work',
      'nav.news': 'News',
      'nav.game': 'Game',
      'nav.learn': 'Electric Cars 101',
      'nav.specs': 'Specs',
      'nav.checklist': 'Race Checklist',
      'nav.about': 'About Us',
      'nav.sponsors': 'Sponsor Us',
      'nav.package': 'Sponsor Package',
      'nav.menu': 'Open menu',
      'nav.menuClose': 'Close menu',
      'skip': 'Skip to content',
      'lang.toggle': 'العربية',
      'lang.label': 'Language',
      'footer.brand': 'SIS Al Jada Cobras',
      'footer.tag': 'Student electric race team · SABIS® Al Jada · Sharjah',
      'footer.rights': 'Copyright 2026 SIS Al Jada Cobras',
      'footer.made': 'Made by Areej',
      'footer.specsPdf': 'Specs PDF',
      'footer.packagePdf': 'Package PDF',
      'footer.visits': 'visits',
      'chat.open': 'CarGPT',
      'chat.placeholder': 'Ask CarGPT…',
      'chat.send': 'Send',
      'chat.close': 'Close',
      'chat.offlineNote': '(Works offline with local FAQ answers.)',
      'chat.aria': 'Message to CarGPT',
      'chat.dialog': 'CarGPT assistant',
      'chat.prompt48': 'How does the 48V system work?',
      'chat.promptEVGP': 'What is EVGP?',
      'chat.promptSponsor': 'How can I sponsor the team?',
      'backTop': 'Back to top',
      'share.score': 'Share score',
      'filter.all': 'All',
      'filter.empty': 'No members in this role yet.',
      'filter.aria': 'Filter members by role',
      'analytics.notice': 'Anonymous visit counted locally (privacy-friendly).',
      'game.kicker': 'Arcade test program',
      'game.title': 'Cobra Circuit',
      'game.intro': 'A retro night run through Cobra City. Cut through traffic, evade hazards, collect battery cells, and hold your nerve as the road accelerates.',
      'game.score': 'Score',
      'game.level': 'Level',
      'game.best': 'Best',
      'game.energy': 'Energy',
      'game.sim': 'EVGP training simulation',
      'game.ready': 'Ready to strike?',
      'game.how': 'Use ← → or A / D. On mobile, tap or swipe to change lanes.',
      'game.start': 'Start race',
      'game.restart': 'Restart race',
      'game.difficulty': 'Difficulty',
      'game.charge': 'Charge',
      'game.hazard': 'Hazard',
      'game.speed': 'Speed',
      'game.kmh': 'km/h',
      'game.board': 'Local leaderboard',
      'game.boardTitle': 'Fastest runs on this device.',
      'game.record': 'New track record',
      'game.empty': 'Battery empty',
      'game.over': 'Race over',
      'game.finishCopy': 'Score {score} · {mode}. Best {best}. Race again.',
      'game.shareCopied': 'Score copied — paste anywhere to share',
      'home.eyebrow': 'EVGP · SABIS® Al Jada · Sharjah',
      'home.title1': 'Built to strike.',
      'home.title2': 'Engineered to race.',
      'home.lead': 'We are a Grades 10–11 student team turning classroom knowledge into a competition-ready electric race car—one design, test, and hard-earned improvement at a time.',
      'home.ctaBuild': 'Follow the build',
      'home.ctaCrew': 'Meet the crew',
      'home.builders': 'Student builders',
      'home.system': 'Electric system',
      'home.target': 'Competition target',
      'home.countKicker': 'Target race date · February 13, 2027',
      'home.countTitle': 'The countdown to EVGP is on.',
      'news.title': 'Workshop log',
      'news.lead': 'Short updates from the Cobras build — for families, sponsors, and the team.',
      'checklist.title': 'EVGP race-day checklist',
      'checklist.lead': 'Track readiness beside the homepage countdown (target: 13 February 2027). Progress is saved on this device.',
      'checklist.reset': 'Reset checklist',
      'checklist.back': 'Back to countdown',
      'package.title': 'Sponsor package',
      'package.lead': 'Partnership options for organizations that want to back student EV engineering in Sharjah.',
      'package.download': 'Download sponsor PDF',
      'contact.title': 'Talk to the Cobras sponsorship desk',
      'specs.download': 'Download specs PDF',
      'home.days': 'Days',
      'home.hours': 'Hours',
      'home.minutes': 'Minutes',
      'home.seconds': 'Seconds',
      'home.teamIndex': '01 / The team',
      'home.teamKicker': 'More than a school project',
      'home.teamTitle': 'One car. Many disciplines. A real starting grid.',
      'home.teamBody': 'The Cobras bring mechanics, electrical systems, safety, design, media, and race strategy into one student-led program. Every member owns part of the result—and every decision has to work on the track.',
      'home.teamLink': 'Discover our mission',
      'home.teamCap': 'The Cobras team inside the electric car project room.',
      'home.driveIndex': '02 / What drives us',
      'home.driveKicker': 'The Cobra standard',
      'home.driveTitle': 'Built around real engineering.',
      'home.p1t': 'Design with purpose',
      'home.p1b': 'We translate competition rules, driver needs, and safety constraints into a practical car layout.',
      'home.p2t': 'Build as one team',
      'home.p2b': 'Mechanical, electrical, safety, and media crews work together instead of operating in isolation.',
      'home.p3t': 'Test. Learn. Repeat.',
      'home.p3b': 'Every run gives us data. We troubleshoot, adjust, and return stronger for the next test.',
      'home.machIndex': '03 / The machine',
      'home.machKicker': 'Current build dashboard',
      'home.machTitle': 'The Cobra by the numbers.',
      'home.machBody': 'These figures reflect the current build and will evolve as testing continues.',
      'home.vLabel': 'System voltage',
      'home.wLabel': 'Total weight',
      'home.sLabel': 'Average speed',
      'home.rLabel': 'Estimated runtime',
      'home.vNote': '4 × 12V batteries',
      'home.wNote': 'Current measured build',
      'home.sNote': 'Testing benchmark',
      'home.rNote': 'Depending on load',
      'home.specsLink': 'Open the complete specification sheet',
      'home.buildIndex': '04 / The build',
      'home.buildKicker': 'From sketch to circuit',
      'home.buildTitle': 'We build the car—and the skills behind it.',
      'home.plan': 'Plan',
      'home.planBody': 'Define the targets, rules, layout, parts, and safety requirements.',
      'home.assemble': 'Assemble',
      'home.assembleBody': 'Turn the design into a physical chassis, power system, and controls.',
      'home.prove': 'Prove',
      'home.proveBody': 'Test performance, diagnose problems, and refine the car for EVGP.',
      'home.phases': 'See every phase',
      'home.engIndex': '05 / Engineering',
      'home.engKicker': 'Problems become progress',
      'home.engTitle': 'What we learn when the first idea fails.',
      'home.ch1': 'Weight balance',
      'home.ch1b': 'Uneven weight can change the way the car turns and behaves at speed.',
      'home.ch1r': 'Test component placement and adjust the balance before performance runs.',
      'home.ch2': 'Reliable wiring',
      'home.ch2b': 'Loose or unclear connections make troubleshooting slower and less safe.',
      'home.ch2r': 'Organize, secure, label, and verify the power system one circuit at a time.',
      'home.ch3': 'Driver protection',
      'home.ch3b': 'Performance only matters when the driver and crew can operate safely.',
      'home.ch3r': 'Use a kill switch, seat belt, helmet, and repeatable safety checks.',
      'home.challenge': 'Challenge',
      'home.response': 'Our response',
      'home.logIndex': '06 / Workshop log',
      'home.logKicker': 'What happens next',
      'home.logTitle': 'Current priorities.',
      'home.now': 'Now',
      'home.nowT': 'System testing',
      'home.nowB': 'Verify controls, electrical connections, and safe shutdown behavior.',
      'home.next': 'Next',
      'home.nextT': 'Track refinement',
      'home.nextB': 'Use driving feedback to improve stability, balance, and consistency.',
      'home.race': 'Race target',
      'home.raceT': 'February 13',
      'home.raceB': 'Prepare the car, driver, documentation, and team for competition.',
      'home.ctaKicker': 'Ready for the grid',
      'home.ctaTitle': 'Follow the Cobras from workshop to race day.',
      'home.ctaCheck': 'Race checklist',
      'home.ctaNews': 'Latest news',
      'home.ctaSpecs': 'Explore the car specs',
      'chat.intro': 'Ask me about the team, EVGP, or electric cars.',

    },
    ar: {
      'nav.home': 'الرئيسية',
      'nav.members': 'الأعضاء',
      'nav.work': 'عملنا',
      'nav.news': 'الأخبار',
      'nav.game': 'اللعبة',
      'nav.learn': 'السيارات الكهربائية 101',
      'nav.specs': 'المواصفات',
      'nav.checklist': 'قائمة السباق',
      'nav.about': 'من نحن',
      'nav.sponsors': 'الرعاة',
      'nav.package': 'باقة الرعاية',
      'nav.menu': 'فتح القائمة',
      'nav.menuClose': 'إغلاق القائمة',
      'skip': 'تخطي إلى المحتوى',
      'lang.toggle': 'English',
      'lang.label': 'اللغة',
      'footer.brand': 'فريق كوبرا سيس الجادة',
      'footer.tag': 'فريق سباق كهربائي طلابي · سابيس الجادة · الشارقة',
      'footer.rights': 'حقوق النشر 2026 لفريق كوبرا سيس الجادة',
      'footer.made': 'تصميم وتطوير عريج',
      'footer.specsPdf': 'ملف المواصفات PDF',
      'footer.packagePdf': 'ملف باقة الرعاية PDF',
      'footer.visits': 'الزيارات',
      'chat.open': 'CarGPT',
      'chat.placeholder': 'اسأل CarGPT…',
      'chat.send': 'إرسال',
      'chat.close': 'إغلاق',
      'chat.offlineNote': '(يعمل دون اتصال بإجابات محلية.)',
      'chat.aria': 'رسالة إلى CarGPT',
      'chat.dialog': 'مساعد CarGPT',
      'chat.prompt48': 'كيف يعمل نظام 48 فولت؟',
      'chat.promptEVGP': 'ما هي مسابقة EVGP؟',
      'chat.promptSponsor': 'كيف يمكنني رعاية الفريق؟',
      'backTop': 'العودة للأعلى',
      'share.score': 'مشاركة النتيجة',
      'filter.all': 'الكل',
      'filter.empty': 'لا أعضاء في هذا الدور بعد.',
      'filter.aria': 'تصفية الأعضاء حسب الدور',
      'analytics.notice': 'تُحتسب الزيارة محليًا وبشكل مجهول حفاظًا على الخصوصية.',
      'game.kicker': 'محاكاة سباق بأسلوب ألعاب الآركيد',
      'game.title': 'دائرة الكوبرا',
      'game.intro': 'سباق ليلي بأسلوب قديم عبر مدينة الكوبرا. تجاوز المرور، تجنب المخاطر، اجمع خلايا البطارية، وثبّت أعصابك مع تسارع الطريق.',
      'game.score': 'النتيجة',
      'game.level': 'المستوى',
      'game.best': 'الأفضل',
      'game.energy': 'الطاقة',
      'game.sim': 'محاكاة تدريب EVGP',
      'game.ready': 'هل أنت مستعد للانطلاق؟',
      'game.how': 'استخدم ← → أو A / D. على الجوال: المس أو اسحب لتغيير المسار.',
      'game.start': 'ابدأ السباق',
      'game.restart': 'أعد السباق',
      'game.difficulty': 'الصعوبة',
      'game.charge': 'شحن',
      'game.hazard': 'خطر',
      'game.speed': 'السرعة',
      'game.kmh': 'كم/س',
      'game.board': 'لوحة المتصدرين المحلية',
      'game.boardTitle': 'أسرع الجولات على هذا الجهاز.',
      'game.record': 'رقم قياسي جديد',
      'game.empty': 'البطارية فارغة',
      'game.over': 'انتهى السباق',
      'game.finishCopy': 'النتيجة {score} · {mode}. الأفضل {best}. انطلق مجددًا.',
      'game.shareCopied': 'تم نسخ النتيجة — الصقها في أي مكان',
      'home.eyebrow': 'EVGP · سابيس الجادة · الشارقة',
      'home.title1': 'صُنعت للانقضاض.',
      'home.title2': 'صُممت للسباق.',
      'home.lead': 'نحن فريق طلابي من الصفين 10–11 نحوّل معرفة الصف إلى سيارة سباق كهربائية جاهزة للمنافسة—تصميماً واختباراً وتحسيناً في كل مرة.',
      'home.ctaBuild': 'تابع البناء',
      'home.ctaCrew': 'تعرّف على الفريق',
      'home.builders': 'طلاب مشاركون في البناء',
      'home.system': 'نظام كهربائي',
      'home.target': 'هدف المسابقة',
      'home.countKicker': 'موعد السباق المستهدف · 13 فبراير 2027',
      'home.countTitle': 'العدّ التنازلي لـ EVGP بدأ.',
      'news.title': 'سجل الورشة',
      'news.lead': 'تحديثات قصيرة من بناء الكوبرا — للعائلات والرعاة والفريق.',
      'checklist.title': 'قائمة يوم سباق EVGP',
      'checklist.lead': 'تتبع الجاهزية بجانب عدّاد الصفحة الرئيسية (الهدف: 13 فبراير 2027). يُحفظ التقدم على هذا الجهاز.',
      'checklist.reset': 'إعادة تعيين القائمة',
      'checklist.back': 'العودة إلى العدّ التنازلي',
      'package.title': 'باقة الرعاية',
      'package.lead': 'خيارات شراكة للمؤسسات التي تريد دعم هندسة السيارات الكهربائية الطلابية في الشارقة.',
      'package.download': 'تنزيل ملف الرعاية بصيغة PDF',
      'contact.title': 'تواصل مع مكتب رعاية الكوبرا',
      'specs.download': 'تنزيل مواصفات PDF',
      'home.days': 'أيام',
      'home.hours': 'ساعات',
      'home.minutes': 'دقائق',
      'home.seconds': 'ثوانٍ',
      'home.teamIndex': '01 / الفريق',
      'home.teamKicker': 'أكثر من مشروع مدرسي',
      'home.teamTitle': 'سيارة واحدة. تخصصات كثيرة. خط انطلاق حقيقي.',
      'home.teamBody': 'يجمع فريق الكوبرا الميكانيكا والكهرباء والسلامة والتصميم والإعلام واستراتيجية السباق في برنامج طلابي واحد. كل عضو يملك جزءاً من النتيجة—وكل قرار يجب أن يعمل على المسار.',
      'home.teamLink': 'اكتشف مهمتنا',
      'home.teamCap': 'فريق الكوبرا داخل غرفة مشروع السيارة الكهربائية.',
      'home.driveIndex': '02 / ما يدفعنا',
      'home.driveKicker': 'معيار الكوبرا',
      'home.driveTitle': 'مبني حول هندسة حقيقية.',
      'home.p1t': 'تصميم بهدف',
      'home.p1b': 'نحوّل قوانين المسابقة واحتياجات السائق وقيود السلامة إلى تخطيط عملي للسيارة.',
      'home.p2t': 'نبني كفريق واحد',
      'home.p2b': 'فرق الميكانيكا والكهرباء والسلامة والإعلام تعمل معاً بدل العمل المنفصل.',
      'home.p3t': 'اختبر. تعلّم. كرّر.',
      'home.p3b': 'كل جولة تعطينا بيانات. نصلح ونضبط ونعود أقوى للاختبار التالي.',
      'home.machIndex': '03 / الآلة',
      'home.machKicker': 'لوحة بيانات السيارة الحالية',
      'home.machTitle': 'الكوبرا بالأرقام.',
      'home.machBody': 'هذه الأرقام تعكس البناء الحالي وستتغير مع استمرار الاختبار.',
      'home.vLabel': 'جهد النظام',
      'home.wLabel': 'الوزن الإجمالي',
      'home.sLabel': 'متوسط السرعة',
      'home.rLabel': 'مدة التشغيل التقديرية',
      'home.vNote': '4 × بطاريات 12V',
      'home.wNote': 'القياس الحالي',
      'home.sNote': 'معيار الاختبار',
      'home.rNote': 'حسب الحمل',
      'home.specsLink': 'افتح ورقة المواصفات الكاملة',
      'home.buildIndex': '04 / البناء',
      'home.buildKicker': 'من الرسم إلى الدائرة',
      'home.buildTitle': 'نبني السيارة—والمهارات خلفها.',
      'home.plan': 'خطّط',
      'home.planBody': 'حدد الأهداف والقوانين والتخطيط والقطع ومتطلبات السلامة.',
      'home.assemble': 'ركّب',
      'home.assembleBody': 'حوّل التصميم إلى هيكل ونظام طاقة وتحكم فعلي.',
      'home.prove': 'أثبت',
      'home.proveBody': 'اختبر الأداء، وشخّص الأعطال، وحسّن السيارة لـ EVGP.',
      'home.phases': 'شاهد كل مرحلة',
      'home.engIndex': '05 / الهندسة',
      'home.engKicker': 'المشاكل تصبح تقدماً',
      'home.engTitle': 'ماذا نتعلم عندما تفشل الفكرة الأولى.',
      'home.ch1': 'توازن الوزن',
      'home.ch1b': 'الوزن غير المتساوي يغيّر طريقة الانعطاف والسلوك عند السرعة.',
      'home.ch1r': 'نختبر وضع المكوّنات ونضبط التوازن قبل جولات الأداء.',
      'home.ch2': 'توصيلات كهربائية موثوقة',
      'home.ch2b': 'الوصلات الضعيفة أو غير الواضحة تبطئ الإصلاح وتقلل السلامة.',
      'home.ch2r': 'ننظم ونثبت ونعلّم ونتحقق من نظام الطاقة دائرة بدائرة.',
      'home.ch3': 'حماية السائق',
      'home.ch3b': 'الأداء لا يهم إلا عندما يعمل السائق والفريق بأمان.',
      'home.ch3r': 'نستخدم مفتاح إيقاف، حزام أمان، خوذة، وفحوصات سلامة متكررة.',
      'home.challenge': 'التحدي',
      'home.response': 'حلّنا',
      'home.logIndex': '06 / سجل الورشة',
      'home.logKicker': 'ماذا بعد',
      'home.logTitle': 'الأولويات الحالية.',
      'home.now': 'الآن',
      'home.nowT': 'اختبار الأنظمة',
      'home.nowB': 'التحقق من التحكم والوصلات الكهربائية وإيقاف التشغيل الآمن.',
      'home.next': 'التالي',
      'home.nextT': 'تحسين المسار',
      'home.nextB': 'استخدام ملاحظات القيادة لتحسين الثبات والتوازن والاستقرار.',
      'home.race': 'هدف السباق',
      'home.raceT': '13 فبراير',
      'home.raceB': 'تجهيز السيارة والسائق والوثائق والفريق للمسابقة.',
      'home.ctaKicker': 'جاهزون لخط الانطلاق',
      'home.ctaTitle': 'تابع الكوبرا من الورشة إلى يوم السباق.',
      'home.ctaCheck': 'قائمة السباق',
      'home.ctaNews': 'آخر الأخبار',
      'home.ctaSpecs': 'استكشف مواصفات السيارة',
      'chat.intro': 'اسألني عن الفريق أو EVGP أو السيارات الكهربائية.',

    }
  };

  const NAV_ITEMS = [
    { href: 'index.html', key: 'nav.home', match: ['index.html', '', '/'] },
    { href: 'members.html', key: 'nav.members', match: ['members.html'] },
    { href: 'projects.html', key: 'nav.work', match: ['projects.html'] },
    { href: 'news.html', key: 'nav.news', match: ['news.html'] },
    { href: 'game.html', key: 'nav.game', match: ['game.html'] },
    { href: '101.html', key: 'nav.learn', match: ['101.html'] },
    { href: 'specs.html', key: 'nav.specs', match: ['specs.html'] },
    { href: 'checklist.html', key: 'nav.checklist', match: ['checklist.html'] },
    { href: 'about.html', key: 'nav.about', match: ['about.html'] },
    { href: 'sponsors.html', key: 'nav.sponsors', match: ['sponsors.html'] },
    { href: 'sponsor-package.html', key: 'nav.package', match: ['sponsor-package.html'] }
  ];

  function normalizeLang(lang) {
    const value = String(lang || 'en').toLowerCase();
    return value.startsWith('ar') ? 'ar' : 'en';
  }

  function t(lang, key) {
    const code = normalizeLang(lang);
    return (STRINGS[code] && STRINGS[code][key]) || (STRINGS.en[key]) || key;
  }

  function shouldCollapseNav(scrollY, threshold) {
    const limit = threshold == null ? NAV_COLLAPSE_THRESHOLD : Number(threshold);
    return Number(scrollY) > limit;
  }

  function currentPageName(pathname) {
    const raw = String(pathname || '').split(/[?#]/)[0];
    const base = raw.split('/').pop() || 'index.html';
    if (!base || base === 'index') return 'index.html';
    return base.includes('.') ? base : `${base}.html`;
  }

  function isCurrentNav(item, pageName) {
    return item.match.some(m => m === pageName || (m === 'index.html' && (pageName === '' || pageName === '/')));
  }

  function countdownParts(nowMs, targetMs) {
    const remaining = Math.max(0, Number(targetMs) - Number(nowMs));
    return {
      days: Math.floor(remaining / 86400000),
      hours: Math.floor(remaining / 3600000) % 24,
      minutes: Math.floor(remaining / 60000) % 60,
      seconds: Math.floor(remaining / 1000) % 60,
      remaining,
      done: remaining <= 0
    };
  }

  function buildScoreShareText(payload) {
    const score = Math.max(0, Math.floor(Number(payload && payload.score) || 0));
    const best = Math.max(0, Math.floor(Number(payload && payload.best) || 0));
    const mode = String((payload && payload.mode) || 'f2').toUpperCase();
    const level = Math.max(1, Math.floor(Number(payload && payload.level) || 1));
    return [
      'SIS Al Jada Cobras — Cobra Circuit',
      `Mode: ${mode} · Level ${level}`,
      `Score: ${String(score).padStart(5, '0')}`,
      `Best: ${String(best).padStart(5, '0')}`,
      'Built to strike. Engineered to race.'
    ].join('\n');
  }

  function checklistProgress(items) {
    const list = Array.isArray(items) ? items : [];
    const total = list.length;
    const done = list.filter(item => item && item.done).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, percent, remaining: Math.max(0, total - done) };
  }

  function resolveChatConfig(runtime) {
    const rt = runtime || {};
    const storage = rt.storage || {};
    const endpoint =
      storage.CARGPT_ENDPOINT ||
      rt.CARGPT_ENDPOINT ||
      'https://cobras-chat.areej-dridi.workers.dev';
    const apiKey = storage.CARGPT_API_KEY || rt.CARGPT_API_KEY || '';
    return {
      endpoint: String(endpoint),
      apiKey: String(apiKey || ''),
      hasKey: Boolean(apiKey && String(apiKey).trim())
    };
  }

  function trackPageView(store, path, nowMs) {
    const data = store && typeof store === 'object' ? store : {};
    const page = currentPageName(path);
    const day = new Date(Number(nowMs) || Date.now()).toISOString().slice(0, 10);
    data.total = (Number(data.total) || 0) + 1;
    data.byPage = data.byPage || {};
    data.byPage[page] = (Number(data.byPage[page]) || 0) + 1;
    data.byDay = data.byDay || {};
    data.byDay[day] = (Number(data.byDay[day]) || 0) + 1;
    data.lastPath = page;
    data.lastAt = Number(nowMs) || Date.now();
    return data;
  }

  function localFaqReply(text, requestedLang) {
    const q = String(text || '').toLowerCase();
    if (normalizeLang(requestedLang) === 'ar') {
      const arabicAnswers = [
        { keys: ['رعا', 'دعم', 'تمويل', 'شريك', 'تواصل'], reply: 'يمكنك فتح صفحتي «رعاية الفريق» و«باقة الرعاية» لمعرفة الاحتياجات وخيارات الشراكة والتواصل مع الفريق.' },
        { keys: ['48', 'بطاري', 'جهد', 'كهرب', 'طاقة'], reply: 'تعمل السيارة بنظام كهربائي بجهد 48 فولت مكوّن من أربع بطاريات 12 فولت موصولة على التوالي، مع توصيلات معنونة ومفتاح إيقاف طارئ.' },
        { keys: ['evgp', 'مسابقة', 'سباق', 'فبراير', 'قائمة'], reply: 'موعد EVGP المستهدف هو 13 فبراير 2027. استخدم صفحة «قائمة السباق» لمتابعة جاهزية الفريق بجانب العدّ التنازلي.' },
        { keys: ['خبر', 'تحديث', 'جديد'], reply: 'راجع صفحة «الأخبار» للاطلاع على آخر تحديثات ورشة فريق كوبرا.' },
        { keys: ['فريق', 'عضو', 'طلاب', 'من أنتم', 'عدد'], reply: 'نحن نحو 19 طالبًا وطالبة من سابيس® الجادة في الشارقة. تعرّف إلى الفريق في صفحة «الأعضاء».' },
        { keys: ['وزن', 'سرعة', 'مواصفات', 'تشغيل'], reply: 'تبلغ بيانات البناء الحالية نحو 186 كغ، ومتوسط سرعة اختباري يقارب 30 كم/س، ومدة تشغيل تقديرية من ساعة إلى 3 ساعات بحسب الحمل.' },
        { keys: ['سلامة', 'خوذة', 'إيقاف', 'حزام'], reply: 'السلامة أولوية لا تقبل التنازل: مفتاح إيقاف طارئ وحزام أمان وخوذة وفحوصات متكررة قبل التشغيل.' },
        { keys: ['بناء', 'مشروع', 'ورشة', 'مراحل', 'خطة'], reply: 'نخطط للسيارة ثم نجمعها ونثبت أداءها بالاختبارات. تابع صفحة «مشروعنا» للاطلاع على الرحلة كاملة.' },
        { keys: ['لعبة', 'كوبرا سيركت', 'نتيجة'], reply: 'العب Cobra Circuit في صفحة «اللعبة» واختر مستوى F3 أو F2 أو F1، ثم استخدم زر مشاركة النتيجة.' },
        { keys: ['موعد', 'أربعاء', 'خميس', 'نجتمع'], reply: 'يجتمع فريق كوبرا في غرفة السيارة الكهربائية يومي الأربعاء والخميس.' },
        { keys: ['انستغرام', 'إنستغرام', 'تيك توك', 'تواصل اجتماعي'], reply: 'تابع @sisaljadacobras على إنستغرام وتيك توك؛ ستجد الروابط في تذييل الموقع.' },
        { keys: ['مرحب', 'مساعدة', 'ماذا تستطيع', 'اهلا', 'أهلًا'], reply: 'مرحبًا، أنا CarGPT الخاص بفريق كوبرا سيس الجادة. اسألني عن المواصفات أو EVGP أو الرعاية أو قائمة السباق أو الأخبار أو اللعبة.' }
      ];
      for (const item of arabicAnswers) if (item.keys.some(k => q.includes(k))) return item.reply;
      return 'وضع الأسئلة الشائعة المحلي: اسأل عن الرعاية أو نظام 48 فولت أو EVGP أو الأخبار أو اللعبة، أو افتح صفحتي المواصفات وباقة الرعاية.';
    }
    const answers = [
      { keys: ['sponsor', 'contact', 'email', 'funding', 'partner'], reply: 'Email the Cobras sponsorship desk at cobras.sponsors@sisaljada.example (school channel placeholder) or open Sponsor Us / Sponsor Package on this site.' },
      { keys: ['48v', '48 v', 'battery', 'voltage', 'electrical', 'power system'], reply: 'Our car runs on a 48V electric system built from four 12V batteries in series. We focus on clean wiring, labeled connections, and a kill switch.' },
      { keys: ['evgp', 'checklist', 'grand prix', 'february', 'competition'], reply: 'EVGP target date is 13 Feb 2027. Use the Race Checklist page for race-day readiness next to the homepage countdown.' },
      { keys: ['news', 'update'], reply: 'See the News page for weekly workshop updates from the Cobras team.' },
      { keys: ['team', 'member', 'crew', 'who', 'students', 'how many'], reply: 'We are about 19 student builders at SABIS® Al Jada in Sharjah. Meet people on the Members page.' },
      { keys: ['weight', 'speed', 'spec', 'specs', 'runtime', 'km/h'], reply: 'Current build figures: about 186 kg, roughly 30 km/h average testing speed, and 1–3 hour runtime depending on load. Open Specs or the specs PDF.' },
      { keys: ['safety', 'helmet', 'kill switch', 'seat belt'], reply: 'Safety is non-negotiable: kill switch, seat belt, helmet, and repeatable pre-run checks.' },
      { keys: ['build', 'project', 'workshop', 'process', 'plan'], reply: 'We plan, assemble, then prove the car through testing. Follow Our Work for the full journey.' },
      { keys: ['game', 'cobra circuit', 'play', 'score'], reply: 'Play Cobra Circuit on the Game page (F3/F2/F1 modes) and use Share score to copy your result.' },
      { keys: ['meet', 'wednesday', 'thursday', 'schedule', 'club time'], reply: 'The Cobras meet in the Electric Car Room on Wednesdays and Thursdays.' },
      { keys: ['instagram', 'tiktok', 'social', 'follow'], reply: 'Follow @sisaljadacobras on Instagram and TikTok — links are in the footer.' },
      { keys: ['hello', 'hi', 'hey', 'help', 'what can'], reply: 'Hi—I am CarGPT for the SIS Al Jada Cobras. Ask about specs, EVGP, sponsorship, the checklist, news, or Cobra Circuit.' }
    ];
    for (const item of answers) {
      if (item.keys.some(k => q.includes(k))) return item.reply;
    }
    return 'Local FAQ mode: ask about sponsors, 48V, EVGP checklist, news, or the game—or open Specs and Sponsor Package.';
  }

  const api = {
    RACE_ISO,
    NAV_COLLAPSE_THRESHOLD,
    STRINGS,
    NAV_ITEMS,
    normalizeLang,
    t,
    shouldCollapseNav,
    currentPageName,
    isCurrentNav,
    countdownParts,
    buildScoreShareText,
    checklistProgress,
    resolveChatConfig,
    trackPageView,
    localFaqReply
  };

  global.CobrasLib = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
