/** Complete Arabic content layer for the static multi-page site. */
(function (global) {
  const COMMON = {
    'Our Team': 'فريقنا',
    'Mechanic': 'الميكانيكا', 'Safety': 'السلامة', 'Media': 'الإعلام', 'Driver': 'القيادة', 'Innovation': 'الابتكار',
    'Hi! Ask me anything about the Cobras team or electric cars. 🏎️⚡': 'مرحبًا! اسألني عن فريق كوبرا أو السيارات الكهربائية. 🏎️⚡',
    'Message to CarGPT': 'رسالة إلى CarGPT', 'Ask CarGPT…': 'اسأل CarGPT…', 'Send': 'إرسال', 'Close': 'إغلاق',
    'Made by Areej and Mirza': 'تصميم وتطوير عريج وميرزا', 'Copyright 2026 SIS Al Jada Cobras': 'حقوق النشر 2026 لفريق كوبرا سيس الجادة',
    'Difficulty': 'الصعوبة', 'F3 difficulty': 'صعوبة F3', 'F2 difficulty': 'صعوبة F2', 'F1 difficulty': 'صعوبة F1',
    'Download specs PDF': 'تنزيل ملف المواصفات بصيغة PDF', 'Sponsor package': 'باقة الرعاية',
    'Back home': 'العودة إلى الرئيسية', 'Our Work': 'مشروعنا'
  };

  const PAGES = {
    // The Track Map prototype, which lives in its own document inside the
    // iframe on trackmap.html. apply() cannot cross a frame boundary and the
    // panel markup is rebuilt on every click, so the prototype looks these up
    // itself. Kept here rather than inlined there so both languages of the same
    // sentence stay in one file.
    'prototype/trackmap': {
      'Design + planning': 'التصميم والتخطيط',
      'Set performance targets, study EVGP requirements, choose parts, and turn constraints into a buildable layout.': 'نحدّد أهداف الأداء، وندرس متطلبات EVGP، ونختار القطع، ثم نحوّل القيود إلى مخطط قابل للتنفيذ.',
      'Competition rules': 'قواعد المسابقة',
      'Component selection': 'اختيار المكوّنات',
      'Safety planning': 'تخطيط السلامة',
      'Cobras students at the project room noticeboard': 'طلاب كوبرا أمام لوحة الإعلانات في غرفة المشروع',
      'Build + assembly': 'البناء والتجميع',
      'Make it physical': 'تحويل الفكرة إلى واقع',
      'Fit the frame, steering, seat, wheels, controls, and mechanical systems into one working machine.': 'نركّب الهيكل والتوجيه والمقعد والعجلات وأدوات التحكم والأنظمة الميكانيكية في سيارة واحدة عاملة.',
      'Chassis assembly': 'تجميع الهيكل',
      'Driver ergonomics': 'ملاءمة مقصورة السائق',
      'Mechanical fit': 'تركيب الأجزاء الميكانيكية',
      'Wiring + controls': 'التوصيلات وأدوات التحكم',
      'Bring it to life': 'تشغيل الأنظمة',
      'Connect batteries, controller, motor, kill switch, and driver inputs into an organized 48V system.': 'نصل البطاريات ووحدة التحكم والمحرك ومفتاح الإيقاف ومدخلات السائق ضمن نظام 48 فولت منظّم.',
      'Power distribution': 'توزيع الطاقة',
      'Control wiring': 'توصيلات التحكم',
      'Safe shutdown': 'الإيقاف الآمن',
      'Testing + troubleshooting': 'الاختبار واستكشاف الأعطال',
      'Find the weak points': 'اكتشاف نقاط الضعف',
      'Run the car, observe its behavior, diagnose failures, and record what must change before the next session.': 'نشغّل السيارة ونراقب سلوكها ونشخّص الأعطال ونسجّل التعديلات المطلوبة قبل الجلسة التالية.',
      'Functional tests': 'اختبارات التشغيل',
      'Driver feedback': 'ملاحظات السائق',
      'Fault diagnosis': 'تشخيص الأعطال',
      'Final adjustments': 'التعديلات النهائية',
      'Prepare to compete': 'الاستعداد للمنافسة',
      'Refine balance, reliability, safety, and presentation so the car and team are ready for EVGP.': 'نحسّن التوازن والموثوقية والسلامة والمظهر حتى تصبح السيارة والفريق جاهزين لـ EVGP.',
      'Weight balance': 'توازن الوزن',
      'Reliability checks': 'فحوصات الموثوقية',
      'Race preparation': 'الاستعداد للسباق',
      'Close': 'إغلاق',
      'Start with the rules': 'ابدأ من القواعد',
      'The grid': 'خط الانطلاق',
      'recorded': 'مسجّلة',
      'in progress': 'قيد التنفيذ',
      'pending': 'قيد الانتظار',
      'Assembly work on the Cobra platform': 'أعمال التجميع على منصة سيارة كوبرا',
      'Students reviewing the car during systems work': 'الطلاب يراجعون السيارة أثناء العمل على الأنظمة',
      'The kart being driven during a test session': 'السيارة أثناء القيادة في جلسة اختبار',
      'Final adjustment work on the kart': 'أعمال التعديلات النهائية على السيارة',
      'Race target': 'هدف السباق',
      'Race target: February 13, 2027. Venue, official timing, driver selection and results remain pending team confirmation.': 'هدف السباق: 13 فبراير 2027. الموقع والتوقيت الرسمي واختيار السائق والنتائج تبقى بانتظار تأكيد الفريق.',
      'Venue pending': 'الموقع قيد التأكيد',
      'Timing pending': 'التوقيت قيد التأكيد',
      'Driver pending': 'السائق قيد التأكيد',
      'Chequered flag': 'علم النهاية',
      'Turn': 'المنعطف',
      'TRACK MAP': 'خريطة المسار',
      'Five turns from first sketch to the grid · SIS Al Jada Cobras': 'خمسة منعطفات من أول رسم إلى خط الانطلاق · فريق كوبرا سيس الجادة',
      'Drag to pan · ctrl or ⌘ + scroll to zoom · click a turn': 'اسحب للتنقّل · ctrl أو ⌘ مع التمرير للتقريب · اضغط منعطفًا',
      'Satellite view of Silverstone Circuit, graded, used as the Cobras build chart': 'صورة بالأقمار الصناعية لحلبة سيلفرستون، معالَجة لونيًا، مستخدَمة كمخطط لمراحل بناء كوبرا',
      'Circuit shown is illustrative — it is not the team\'s race venue, which is not yet confirmed.': 'الحلبة المعروضة للتوضيح فقط، وليست موقع سباق الفريق الذي لم يُؤكَّد بعد.',
      'Kart is a model built from team photographs, not a photograph.': 'السيارة مجسّم مبني من صور الفريق، وليست صورة فوتوغرافية.'
    },
    // The homepage. Most of these are not new translations: the key-based
    // home.* strings in cobras-lib.js already carried Arabic for the old
    // homepage, and where the English is word-for-word identical the Arabic is
    // reused verbatim rather than re-written, so the two systems cannot drift
    // into two different Arabic voices for the same sentence.
    'index.html': {
      'EVGP · SABIS® Al Jada · Sharjah': 'EVGP · سابيس الجادة · الشارقة',
      'Built to strike.': 'صُنعت للانقضاض.',
      'Engineered to race.': 'صُممت للسباق.',
      'We are a Grades 11–12 student team turning classroom knowledge into a competition-ready electric race car—one design, test, and hard-earned improvement at a time.': 'نحن فريق طلابي من الصفين 11–12 نحوّل معرفة الصف إلى سيارة سباق كهربائية جاهزة للمنافسة—تصميماً واختباراً وتحسيناً في كل مرة.',
      'Follow the build': 'تابع البناء',
      'Meet the crew': 'تعرّف على الفريق',
      'Define the mission': 'تحديد المهمة',
      'Design + planning': 'التصميم والتخطيط',
      'Set performance targets, study EVGP requirements, choose parts, and turn constraints into a buildable layout.': 'نحدّد أهداف الأداء، وندرس متطلبات EVGP، ونختار القطع، ثم نحوّل القيود إلى مخطط قابل للتنفيذ.',
      'Competition rules': 'قواعد المسابقة',
      'Component selection': 'اختيار المكوّنات',
      'Safety planning': 'تخطيط السلامة',
      'Make it physical': 'تحويل الفكرة إلى واقع',
      'Build + assembly': 'البناء والتجميع',
      'Fit the frame, steering, seat, wheels, controls, and mechanical systems into one working machine.': 'نركّب الهيكل والتوجيه والمقعد والعجلات وأدوات التحكم والأنظمة الميكانيكية في سيارة واحدة عاملة.',
      'Chassis assembly': 'تجميع الهيكل',
      'Driver ergonomics': 'ملاءمة مقصورة السائق',
      'Mechanical fit': 'تركيب الأجزاء الميكانيكية',
      'Bring it to life': 'تشغيل الأنظمة',
      'Wiring + controls': 'التوصيلات وأدوات التحكم',
      'Connect batteries, controller, motor, kill switch, and driver inputs into an organized 48V system.': 'نصل البطاريات ووحدة التحكم والمحرك ومفتاح الإيقاف ومدخلات السائق ضمن نظام 48 فولت منظّم.',
      'Power distribution': 'توزيع الطاقة',
      'Control wiring': 'توصيلات التحكم',
      'Safe shutdown': 'الإيقاف الآمن',
      'Find the weak points': 'اكتشاف نقاط الضعف',
      'Testing + troubleshooting': 'الاختبار واستكشاف الأعطال',
      'Run the car, observe its behavior, diagnose failures, and record what must change before the next session.': 'نشغّل السيارة ونراقب سلوكها ونشخّص الأعطال ونسجّل التعديلات المطلوبة قبل الجلسة التالية.',
      'Functional tests': 'اختبارات التشغيل',
      'Driver feedback': 'ملاحظات السائق',
      'Fault diagnosis': 'تشخيص الأعطال',
      'Prepare to compete': 'الاستعداد للمنافسة',
      'Final adjustments': 'التعديلات النهائية',
      'Refine balance, reliability, safety, and presentation so the car and team are ready for EVGP.': 'نحسّن التوازن والموثوقية والسلامة والمظهر حتى تصبح السيارة والفريق جاهزين لـ EVGP.',
      'Weight balance': 'توازن الوزن',
      'Reliability checks': 'فحوصات الموثوقية',
      'Race preparation': 'الاستعداد للسباق',
      'Target race date · February 13, 2027': 'موعد السباق المستهدف · 13 فبراير 2027',
      'The countdown to EVGP is on.': 'العدّ التنازلي لـ EVGP بدأ.',
      'Days': 'أيام',
      'Recalculated at each publish — not a live, second-by-second countdown.': 'يُحتسب العدّ مع كل تحديث للموقع، وليس عدًّا تنازليًا لحظيًا بالثواني.',
      'Current / Build status': 'الحالي / حالة البناء',
      'Published workshop snapshot': 'ملخص منشور من الورشة',
      'Current priority: system testing.': 'الأولوية الحالية: اختبار الأنظمة.',
      'This status comes from the latest workshop log, not a live telemetry feed.': 'تعتمد هذه الحالة على أحدث سجل منشور للورشة، وليست بثًا مباشرًا للبيانات.',
      'Completion percentage': 'نسبة الإنجاز',
      'Awaiting team sign-off': 'بانتظار اعتماد الفريق',
      'Current task': 'المهمة الحالية',
      'System testing': 'اختبار الأنظمة',
      'Verify controls, electrical connections, and safe shutdown behavior.': 'التحقق من التحكم والوصلات الكهربائية وإيقاف التشغيل الآمن.',
      'Next milestone': 'المحطة التالية',
      'Track refinement': 'تحسين المسار',
      'Use driving feedback to improve stability, balance, and consistency.': 'استخدام ملاحظات القيادة لتحسين الثبات والتوازن والاستقرار.',
      'Crew assignment': 'توزيع فريق العمل',
      'To be confirmed': 'قيد التأكيد',
      'Latest published update: 1 July 2026': 'آخر تحديث منشور: 1 يوليو 2026',
      'Read the dated workshop log': 'اقرأ سجل الورشة المؤرخ',
      '01 / The team': '01 / الفريق',
      'More than a school project': 'أكثر من مشروع مدرسي',
      'One car. Many disciplines. A real starting grid.': 'سيارة واحدة. تخصصات كثيرة. خط انطلاق حقيقي.',
      'The Cobras bring mechanics, electrical systems, safety, design, media, and race strategy into one student-led program. Every member owns part of the result—and every decision has to work on the track.': 'يجمع فريق الكوبرا الميكانيكا والكهرباء والسلامة والتصميم والإعلام واستراتيجية السباق في برنامج طلابي واحد. كل عضو يملك جزءاً من النتيجة—وكل قرار يجب أن يعمل على المسار.',
      'Discover our mission': 'اكتشف مهمتنا',
      'Student builders': 'طلاب مشاركون في البناء',
      '02 / What drives us': '02 / ما يدفعنا',
      'The Cobra standard': 'معيار الكوبرا',
      'Built around real engineering.': 'مبني حول هندسة حقيقية.',
      'Design with purpose': 'تصميم بهدف',
      'We translate competition rules, driver needs, and safety constraints into a practical car layout.': 'نحوّل قوانين المسابقة واحتياجات السائق وقيود السلامة إلى تخطيط عملي للسيارة.',
      'Build as one team': 'نبني كفريق واحد',
      'Mechanical, electrical, safety, and media crews work together instead of operating in isolation.': 'فرق الميكانيكا والكهرباء والسلامة والإعلام تعمل معاً بدل العمل المنفصل.',
      'Test. Learn. Repeat.': 'اختبر. تعلّم. كرّر.',
      'Every run gives us data. We troubleshoot, adjust, and return stronger for the next test.': 'كل جولة تعطينا بيانات. نصلح ونضبط ونعود أقوى للاختبار التالي.',
      '03 / The machine': '03 / الآلة',
      'Current build dashboard': 'لوحة بيانات السيارة الحالية',
      'The Cobra by the numbers.': 'الكوبرا بالأرقام.',
      'These figures reflect the current build and will evolve as testing continues.': 'هذه الأرقام تعكس البناء الحالي وستتغير مع استمرار الاختبار.',
      'System voltage': 'جهد النظام',
      '4 × 12V batteries': '4 × بطاريات 12V',
      'Total weight': 'الوزن الإجمالي',
      'Current measured build': 'القياس الحالي',
      'Average speed': 'متوسط السرعة',
      'Testing benchmark': 'معيار الاختبار',
      'Estimated runtime': 'مدة التشغيل التقديرية',
      'hrs': 'ساعة',
      'Depending on load': 'حسب الحمل',
      'Open the complete specification sheet': 'افتح ورقة المواصفات الكاملة',
      '04 / The build': '04 / البناء',
      'From sketch to circuit': 'من الرسم إلى الدائرة',
      'We build the car—and the skills behind it.': 'نبني السيارة—والمهارات خلفها.',
      'Plan': 'خطّط',
      'Define the targets, rules, layout, parts, and safety requirements.': 'حدد الأهداف والقوانين والتخطيط والقطع ومتطلبات السلامة.',
      'Assemble': 'ركّب',
      'Turn the design into a physical chassis, power system, and controls.': 'حوّل التصميم إلى هيكل ونظام طاقة وتحكم فعلي.',
      'Prove': 'أثبت',
      'Test performance, diagnose problems, and refine the car for EVGP.': 'اختبر الأداء، وشخّص الأعطال، وحسّن السيارة لـ EVGP.',
      'See every phase': 'شاهد كل مرحلة',
      'Renders of the car on this page are an AI-assisted visualisation built from the team\'s own reference photographs, not photographs of the car.': 'صور السيارة في هذه الصفحة تصوّر تخيّلي أُنتج بمساعدة الذكاء الاصطناعي اعتمادًا على صور الفريق المرجعية، وليست صورًا فوتوغرافية للسيارة.',
      'See the Cobra in 360°': 'شاهد كوبرا بزاوية 360°',
      '05 / Engineering': '05 / الهندسة',
      'Problems become progress': 'المشاكل تصبح تقدماً',
      'What we learn when the first idea fails.': 'ماذا نتعلم عندما تفشل الفكرة الأولى.',
      'Problem': 'المشكلة',
      'Uneven weight can change how the car turns and behaves at speed.': 'قد يغيّر توزيع الوزن غير المتوازن طريقة انعطاف السيارة وسلوكها عند السرعة.',
      'Decision': 'القرار الهندسي',
      'Mechanics shifted battery placement after low-speed runs.': 'عدّل فريق الميكانيكا مواضع البطاريات بعد جولات منخفضة السرعة.',
      'Result / next test': 'النتيجة / الاختبار التالي',
      'Weight remains near 186 kg; a new weigh-in is pending after the next parts change.': 'ما زال الوزن قريبًا من 186 كغ، وستُعاد عملية الوزن بعد تغيير القطع التالي.',
      'Reliable wiring': 'توصيلات كهربائية موثوقة',
      'Loose or unclear connections make troubleshooting slower and less safe.': 'الوصلات الضعيفة أو غير الواضحة تبطئ الإصلاح وتقلل السلامة.',
      'The electrical crew re-checked the 48V layout, secured connectors, and re-labeled critical runs.': 'أعاد فريق الكهرباء فحص نظام 48 فولت وثبّت الموصلات وجدّد تسميات التوصيلات المهمة.',
      'The next test day has a clearer, faster troubleshooting path.': 'أصبح مسار اكتشاف الأعطال في يوم الاختبار التالي أوضح وأسرع.',
      'Driver protection': 'حماية السائق',
      'Performance only matters when the driver and crew can operate safely.': 'الأداء لا يهم إلا عندما يعمل السائق والفريق بأمان.',
      'Use an emergency kill switch, seat belt, helmet, and repeatable pre-run checks.': 'استخدام مفتاح إيقاف طارئ وحزام أمان وخوذة وفحوصات ثابتة قبل كل جولة.',
      'The hardware is documented; final race-day safety sign-off is still tracked in the checklist.': 'المعدات موثقة، وما زال اعتماد السلامة النهائي ليوم السباق ضمن قائمة الجاهزية.',
      '06 / Workshop log': '06 / سجل الورشة',
      'Dated workshop notes': 'ملاحظات ورشة مؤرخة',
      'Latest verified updates.': 'أحدث التحديثات الموثقة.',
      '1 Jul 2026': '1 يوليو 2026',
      'Electrical': 'الكهرباء',
      'Kill switch and critical-run labels checked': 'فحص مفتاح الإيقاف وتسميات التوصيلات المهمة',
      'Connectors were secured and the 48V layout was re-labeled for faster troubleshooting.': 'ثُبّتت الموصلات وأعيدت تسمية توصيلات نظام 48 فولت لتسريع اكتشاف الأعطال.',
      '18 Jun 2026': '18 يونيو 2026',
      'Mechanical': 'الميكانيكا',
      'Battery placement shifted after low-speed runs': 'تعديل مواضع البطاريات بعد جولات منخفضة السرعة',
      'The build remains near 186 kg; the next parts change will be followed by another weigh-in.': 'ما زال وزن السيارة قريبًا من 186 كغ، وستلي عملية تغيير القطع عملية وزن جديدة.',
      '4 Jun 2026': '4 يونيو 2026',
      'Sponsor package prepared': 'إعداد باقة الرعاية',
      'The media crew published the sponsor PDF and refreshed outreach materials.': 'نشر فريق الإعلام ملف الرعاية وحدّث مواد التواصل مع الشركاء.',
      'Open the complete workshop log': 'افتح سجل الورشة الكامل',
      'Ready for the grid': 'جاهزون لخط الانطلاق',
      'Follow the Cobras from workshop to race day.': 'تابع الكوبرا من الورشة إلى يوم السباق.',
      'Race Day': 'يوم السباق',
      'Latest news': 'آخر الأخبار',
      'Track Map': 'خريطة المسار',
      'Cobras students at the project room noticeboard': 'طلاب كوبرا أمام لوحة الإعلانات في غرفة المشروع',
      'Still from the team’s assembly video: a bracket being drilled beside the seat frame, red harness webbing behind it': 'لقطة من فيديو التجميع: ثقب حامل معدني بجوار إطار المقعد، وخلفه أشرطة حزام الأمان الحمراء',
      'The bare chassis indoors with its seat, red four-point harness and one rear wheel fitted, three students sitting beside it': 'الهيكل المجرّد داخل الورشة وقد رُكّب فيه المقعد وحزام الأمان الرباعي الأحمر وعجلة خلفية واحدة، ويجلس بجانبه ثلاثة طلاب',
      'The car stopped on paving beside a running track, a helmeted driver seated in it while one team member rests a hand on the roll bar and another holds a clipboard': 'السيارة متوقفة على أرض مرصوفة بجانب مضمار للجري، يجلس فيها سائق يرتدي الخوذة، بينما يضع أحد أعضاء الفريق يده على قضيب الحماية ويحمل آخر حافظة أوراق',
      'Three team members working around the car’s seat and harness indoors, one holding a helmet, beneath an Al Jada Cobras banner': 'ثلاثة من أعضاء الفريق يعملون حول مقعد السيارة وحزام الأمان داخل الورشة، أحدهم يحمل خوذة، تحت لافتة كوبرا الجادة',
      'Build stages': 'مراحل البناء',
      'The team\'s electric race car seen from the front left, an AI-assisted visualisation built from the team\'s own reference photographs': 'سيارة السباق الكهربائية للفريق من الأمام جهة اليسار، تصوّر تخيّلي أُنتج بمساعدة الذكاء الاصطناعي اعتمادًا على صور الفريق المرجعية'
    },
    // Track Map. The prototype inside the iframe is a separate document and is
    // translated by its own copy of this data — apply() cannot reach across the
    // frame boundary.
    'trackmap.html': {
      'The build / interactive circuit': 'المشروع / حلبة تفاعلية',
      'From sketch to starting grid.': 'من الرسم إلى خط الانطلاق.',
      'The five stages behind the Cobra, laid out as turns on a circuit. Drag to pan, and click a turn to read what happened there.': 'مراحل بناء كوبرا الخمس، معروضة كمنعطفات على حلبة. اسحب للتنقّل، واضغط على أي منعطف لتقرأ ما جرى فيه.',
      'Circuit imagery © Planet Labs PBC,': 'صور الحلبة © Planet Labs PBC،',
      'Racing line traced from OpenStreetMap, © OpenStreetMap contributors,': 'خط السباق مرسوم من بيانات OpenStreetMap، © مساهمو OpenStreetMap،',
      'The circuit shown is illustrative — it is not the team\'s race venue.': 'الحلبة المعروضة للتوضيح فقط، وليست موقع سباق الفريق.',
      '5 stages': '5 مراحل',
      'Design, build, wiring, testing, adjustments': 'التصميم والبناء والتوصيلات والاختبار والتعديلات',
      'Turn markers': 'علامات المنعطفات',
      'Click one to open that stage': 'اضغط إحداها لفتح تلك المرحلة',
      'Racing line': 'خط السباق',
      'Traced from OpenStreetMap circuit data': 'مرسوم من بيانات حلبات OpenStreetMap',
      'Drag to pan': 'اسحب للتنقّل',
      'And zoom to follow the lap': 'وقرّب الصورة لتتابع اللفة',
      'Interactive circuit map of the SIS Al Jada Cobras build stages': 'خريطة حلبة تفاعلية تعرض مراحل بناء فريق كوبرا سيس الجادة',
      'Map facts': 'معلومات الخريطة'
    },
    // The Cobra 360. Same iframe caveat as trackmap.html above.
    'car.html': {
      'The machine / 360° viewer': 'السيارة / عرض 360°',
      'Meet the Cobra.': 'تعرّف إلى كوبرا.',
      'Orbit around the team\'s three-wheeled electric race car from eye level to a true top-down view. Drag to inspect it, ctrl or ⌘ + scroll to zoom, or select a component.': 'درْ حول سيارة الفريق الكهربائية ذات العجلات الثلاث، من مستوى النظر إلى منظر علوي كامل. اسحب لتفحّصها، أو اضغط ctrl أو ⌘ مع التمرير للتقريب، أو اختر أحد المكوّنات.',
      'Rendered visualisation, not photographs of the car. Built to match the team\'s own reference photographs and chassis measurements — the geometry and livery are the real car\'s. Photographs of the actual build are on': 'تصوّر تخيّلي، وليس صورًا فوتوغرافية للسيارة. بُني ليطابق صور الفريق المرجعية وقياسات الهيكل، فالأبعاد والألوان هي أبعاد السيارة الحقيقية وألوانها. صور البناء الفعلي موجودة في',
      '3 wheels': '3 عجلات',
      'Two front, one centered rear': 'اثنتان في المقدمة وواحدة في منتصف المؤخرة',
      '48V system': 'نظام 48 فولت',
      'Current published build configuration': 'تكوين البناء المنشور حاليًا',
      'Open cockpit': 'مقصورة مكشوفة',
      'Handlebars, bucket seat, red harness': 'مقود ومقعد مجوّف وحزام أمان أحمر',
      'Enclosed rear': 'مؤخرة مغلقة',
      'Rear wheel covered by the body shell': 'العجلة الخلفية مغطاة بهيكل السيارة',
      'Interactive 360-degree view of the SIS Al Jada Cobras race car': 'عرض تفاعلي بزاوية 360 درجة لسيارة سباق فريق كوبرا سيس الجادة',
      'Model facts': 'معلومات المجسّم'
    },
    'members.html': {
      'Nineteen student builders across mechanics, safety, innovation, media, and driving—each contributing to the Cobra race car.': 'تسعة عشر طالبًا وطالبة يساهمون في سيارة سباق كوبرا عبر الميكانيكا والسلامة والابتكار والإعلام والقيادة.'
    },
    'projects.html': {
      'From sketch': 'من الرسم', 'to starting grid.': 'إلى خط الانطلاق.',
      'Scroll through the five stages behind the Cobra—each one turning an idea into a safer, faster, more complete electric race car.': 'تعرّف إلى المراحل الخمس لبناء كوبرا، حيث تحوّل كل مرحلة الفكرة إلى سيارة سباق كهربائية أكثر أمانًا وسرعةً واكتمالًا.',
      'Define the mission': 'تحديد المهمة', 'Design + planning': 'التصميم والتخطيط',
      'Set performance targets, study EVGP requirements, choose parts, and turn constraints into a buildable layout.': 'نحدّد أهداف الأداء، وندرس متطلبات EVGP، ونختار القطع، ثم نحوّل القيود إلى مخطط قابل للتنفيذ.',
      'Competition rules': 'قواعد المسابقة', 'Component selection': 'اختيار المكوّنات', 'Safety planning': 'تخطيط السلامة',
      'The project room where plans become tasks.': 'غرفة المشروع حيث تتحول الخطط إلى مهام عملية.',
      'Make it physical': 'تحويل الفكرة إلى واقع', 'Build + assembly': 'البناء والتجميع',
      'Fit the frame, steering, seat, wheels, controls, and mechanical systems into one working machine.': 'نركّب الهيكل والتوجيه والمقعد والعجلات وأدوات التحكم والأنظمة الميكانيكية في سيارة واحدة عاملة.',
      'Chassis assembly': 'تجميع الهيكل', 'Driver ergonomics': 'ملاءمة مقصورة السائق', 'Mechanical fit': 'تركيب الأجزاء الميكانيكية',
      'Assembly work on the Cobra platform.': 'أعمال التجميع على منصة سيارة كوبرا.', 'Cobras car assembly footage': 'لقطات لتجميع سيارة كوبرا',
      'Bring it to life': 'تشغيل الأنظمة', 'Wiring + controls': 'التوصيلات وأدوات التحكم',
      'Connect batteries, controller, motor, kill switch, and driver inputs into an organized 48V system.': 'نصل البطاريات ووحدة التحكم والمحرك ومفتاح الإيقاف ومدخلات السائق ضمن نظام 48 فولت منظّم.',
      'Power distribution': 'توزيع الطاقة', 'Control wiring': 'توصيلات التحكم', 'Safe shutdown': 'الإيقاف الآمن',
      'Students reviewing the car during systems work.': 'الطلاب يراجعون السيارة أثناء العمل على الأنظمة.',
      'Find the weak points': 'اكتشاف نقاط الضعف', 'Testing + troubleshooting': 'الاختبار واستكشاف الأعطال',
      'Run the car, observe its behavior, diagnose failures, and record what must change before the next session.': 'نشغّل السيارة ونراقب سلوكها ونشخّص الأعطال ونسجّل التعديلات المطلوبة قبل الجلسة التالية.',
      'Functional tests': 'اختبارات التشغيل', 'Driver feedback': 'ملاحظات السائق', 'Fault diagnosis': 'تشخيص الأعطال',
      'Every run creates the next improvement list.': 'كل جولة تنتج قائمة التحسينات التالية.',
      'Prepare to compete': 'الاستعداد للمنافسة', 'Final adjustments': 'التعديلات النهائية',
      'Refine balance, reliability, safety, and presentation so the car and team are ready for EVGP.': 'نحسّن التوازن والموثوقية والسلامة والمظهر حتى تصبح السيارة والفريق جاهزين لـ EVGP.',
      'Weight balance': 'توازن الوزن', 'Reliability checks': 'فحوصات الموثوقية', 'Race preparation': 'الاستعداد للسباق',
      'The details that separate a build from a race car. (Lightweight clip for faster loads.)': 'التفاصيل التي تحوّل المشروع إلى سيارة سباق حقيقية.',
      'Next milestone': 'المحطة التالية', 'Race target: February 13, 2027.': 'موعد السباق المستهدف: 13 فبراير 2027.',
      'The timeline does not end here. Testing, learning, and refinement continue until race day.': 'لا ينتهي مسار العمل هنا؛ فالاختبار والتعلّم والتحسين مستمرة حتى يوم السباق.',
      'Help us reach the grid': 'ساعدنا في الوصول إلى خط الانطلاق', 'Ask me about any stage of the Cobra build.': 'اسألني عن أي مرحلة من مراحل بناء كوبرا.', 'Ask about the build…': 'اسأل عن مراحل البناء…'
    },
    '101.html': {
      'Electric Cars 101': 'أساسيات السيارات الكهربائية', 'How electric cars work—and how the Cobras put those ideas into a 48V race car.': 'كيف تعمل السيارات الكهربائية، وكيف يطبّق فريق كوبرا هذه المبادئ في سيارة سباق بنظام 48 فولت.',
      'Battery': 'البطارية', 'The battery stores energy, kind of like a fuel tank but for electricity. Most electric cars use lithium-ion batteries (same as phones, just bigger). You charge it, it holds the charge, and it powers everything in the car.': 'تخزّن البطارية الطاقة كما يخزّن خزان الوقود البنزين، ولكن على شكل كهرباء. تستخدم معظم السيارات الكهربائية بطاريات ليثيوم-أيون شبيهة ببطاريات الهواتف ولكن بحجم أكبر. تُشحن البطارية ثم تغذّي أنظمة السيارة بالطاقة.',
      'Motor': 'المحرك الكهربائي', 'The motor makes the car move. Electricity goes in, the magnets inside spin, and that spins the wheels. Unlike gas engines, electric motors give you full power right away - no waiting for it to build up.': 'يحوّل المحرك الكهربائي الطاقة إلى حركة. يؤدي المجال المغناطيسي داخله إلى دوران المحرك والعجلات، ويوفّر عزمًا سريعًا من اللحظة الأولى بخلاف محركات الوقود.',
      'Controller': 'وحدة التحكم', 'This sits between the battery and motor. When you press the accelerator, the controller decides how much electricity to send to the motor. Press harder, more power. It also converts the electricity into the right form for the motor to use.': 'تقع وحدة التحكم بين البطارية والمحرك. عند الضغط على دواسة التسارع تحدّد مقدار الطاقة المرسلة إلى المحرك، كما تهيّئ الكهرباء بالشكل المناسب لتشغيله.',
      'Regenerative Braking': 'الكبح المتجدد', 'When you slow down, the motor can run in reverse and work like a generator. Instead of wasting energy as heat (like normal brakes), it captures that energy and puts it back in the battery. Free range, basically.': 'عند تخفيف السرعة يمكن للمحرك أن يعمل كمولّد، فيستعيد جزءًا من طاقة الحركة ويعيدها إلى البطارية بدل فقدانها كلها على شكل حرارة.',
      'Charging': 'الشحن', 'You can plug into a regular outlet (slow), a home charger (faster), or a public fast charger (quick stops on road trips). Most EV owners just plug in at home overnight and wake up with a full "tank."': 'يمكن شحن السيارة من مقبس عادي أو شاحن منزلي أسرع أو محطة شحن سريع. يشحن كثير من مالكي السيارات سياراتهم ليلًا في المنزل لتكون جاهزة صباحًا.',
      'Why Electric?': 'لماذا السيارات الكهربائية؟', "No exhaust, no emissions while driving. Electric motors are way simpler than engines - fewer parts means less stuff that can break. They're also quieter and cheaper to run since electricity costs less than gas.": 'لا تنتج السيارة الكهربائية عوادم أثناء القيادة، ومحركها أبسط ويحتوي على أجزاء متحركة أقل، ما يقلّل الأعطال والصيانة. كما أنها أكثر هدوءًا وقد تكون أقل تكلفة في التشغيل.',
      'Our Cobra system': 'نظام سيارة كوبرا', 'The Cobras car runs at 48V from four 12V batteries in series, with a kill switch and labeled wiring for safer testing. Specs evolve as we weigh, drive, and prepare for EVGP—open the Specs page for the current dashboard.': 'تعمل سيارة كوبرا بجهد 48 فولت من أربع بطاريات 12 فولت موصولة على التوالي، مع مفتاح إيقاف طارئ وتوصيلات معنونة لاختبارات أكثر أمانًا. تتطور المواصفات مع الوزن والقيادة والاستعداد لـ EVGP؛ راجع صفحة المواصفات للاطلاع على أحدث البيانات.'
    },
    'specs.html': {
      'Car Specifications': 'مواصفات السيارة', 'Live build figures for the Cobras 48V electric race car. Values evolve as we test, weigh, and prepare for EVGP.': 'أحدث بيانات سيارة سباق كوبرا الكهربائية بنظام 48 فولت. تتغير القيم مع استمرار الاختبار والوزن والاستعداد لـ EVGP.',
      'Car specifications': 'مواصفات السيارة', 'Basic Information': 'المعلومات الأساسية', 'Car Name': 'اسم السيارة', 'Cobra': 'كوبرا', 'School': 'المدرسة', 'SABIS® Aljada (Sharjah, UAE)': 'سابيس® الجادة (الشارقة، الإمارات)', 'Team': 'الفريق', 'Competition': 'المسابقة',
      'Power System': 'نظام الطاقة', 'Motor Type': 'نوع المحرك', 'Brushless DC48V': 'محرك تيار مستمر بدون فُرش، 48 فولت', 'Controller Type': 'نوع وحدة التحكم', 'Kelly KEB Brushless Motor Controller': 'وحدة تحكم Kelly KEB لمحرك بدون فُرش', 'Battery Type': 'نوع البطارية', 'VRLA (Sealed Lead-Acid), 26 Ah': 'رصاص حمضي محكم الإغلاق (VRLA)، سعة 26 أمبير-ساعة', 'Voltage (x4 Batteries)': 'الجهد (أربع بطاريات)', 'Estimated Runtime': 'مدة التشغيل التقديرية', '1-3 hours (depends on load)': 'من ساعة إلى 3 ساعات (بحسب الحمل)',
      'Build & Design': 'البناء والتصميم', 'Chassis / Frame': 'الهيكل', 'Drivetrain': 'نظام نقل الحركة', 'Wheels / Tires': 'العجلات والإطارات', 'Total Weight': 'الوزن الإجمالي',
      'Performance': 'الأداء', 'Average Speed': 'متوسط السرعة', 'Acceleration': 'التسارع', 'Handling / Stability': 'التحكم والثبات', 'Stable at average speed, improved with proper weight balance': 'ثابتة عند السرعة المتوسطة، ويتحسن الأداء مع توزيع الوزن بصورة صحيحة',
      'Safety Features': 'ميزات السلامة', 'Kill Switch': 'مفتاح الإيقاف', 'Emergency Kill Switch': 'مفتاح إيقاف طارئ', 'Braking System': 'نظام المكابح', 'Driver Protection': 'حماية السائق', 'Helmet + seat belt': 'خوذة وحزام أمان', '(TBD)': '(يُحدّد لاحقًا)',
      'Last Updated: May 2026': 'آخر تحديث: مايو 2026', 'Help fund the next test cycle': 'ساهم في تمويل دورة الاختبار التالية'
    },
    'about.html': {
      // These three paragraphs each wrap their key phrases in <strong>, so the
      // page has never held the whole sentences that the keys below this block
      // are written against — only fragments, which matched nothing and left the
      // page 29% English. The fragments are keyed here, and each Arabic piece is
      // cut from the already-approved full-sentence translation rather than
      // written afresh, so joining them back reproduces it word for word.
      'The SIS Al Jada Cobras': 'فريق كوبرا سيس الجادة',
      'are a student-led electric race team at': 'هو فريق سباق كهربائي يقوده طلاب',
      'SABIS® Al Jada': 'سابيس® الجادة',
      '. Students in': '. يصمّم طلاب',
      'Grades 11 and 12': 'الصفين الحادي عشر والثاني عشر',
      'design, build, and test a real race car—combining engineering, safety, media, and teamwork under one black-and-red brand.': 'سيارة سباق حقيقية ويبنونها ويختبرونها، جامعِين الهندسة والسلامة والإعلام والعمل الجماعي تحت هوية واحدة بالأسود والأحمر.',
      'This season we are preparing a competition-ready car for the': 'نستعد هذا الموسم بسيارة جاهزة للمنافسة في',
      'Electric Vehicle Grand Prix (EVGP)': 'سباق المركبات الكهربائية الكبير (EVGP)',
      'on our target date of': '، وموعدنا المستهدف هو',
      'February 13, 2027': '13 فبراير 2027',
      '. Every design choice is judged on performance, safety, and reliability—not just looking good in the workshop.': '. نقيم كل قرار تصميمي وفق الأداء والسلامة والموثوقية، لا وفق المظهر داخل الورشة فقط.',
      'We meet in the': 'نجتمع في',
      'Electric Car Room': 'غرفة السيارة الكهربائية',
      'every': 'كل',
      'Wednesday and Thursday': 'أربعاء وخميس',
      '. Sessions mix build work, electrical checks, safety drills, and media updates so the whole crew stays race-ready.': '. تجمع الجلسات بين أعمال البناء والفحوصات الكهربائية وتدريبات السلامة والتحديثات الإعلامية ليبقى الفريق مستعدًا للسباق.',
      'About SIS Al Jada Cobras': 'عن فريق كوبرا سيس الجادة', 'Our Mission': 'مهمتنا', 'Build a safe, fast, and efficient electric car while developing teamwork, engineering skills, and confidence through real hands-on experience.': 'بناء سيارة كهربائية آمنة وسريعة وفعّالة، مع تنمية العمل الجماعي والمهارات الهندسية والثقة من خلال تجربة عملية حقيقية.',
      'Who We Are': 'من نحن', 'The SIS Al Jada Cobras are a student-led electric race team at SABIS® Al Jada. Students in Grades 11 and 12 design, build, and test a real race car—combining engineering, safety, media, and teamwork under one black-and-red brand.': 'فريق كوبرا سيس الجادة هو فريق سباق كهربائي يقوده طلاب سابيس® الجادة. يصمّم طلاب الصفين الحادي عشر والثاني عشر سيارة سباق حقيقية ويبنونها ويختبرونها، جامعِين الهندسة والسلامة والإعلام والعمل الجماعي تحت هوية واحدة بالأسود والأحمر.',
      'Our Goal': 'هدفنا', 'This season we are preparing a competition-ready car for the Electric Vehicle Grand Prix (EVGP) on our target date of February 13, 2027. Every design choice is judged on performance, safety, and reliability—not just looking good in the workshop.': 'نستعد هذا الموسم بسيارة جاهزة للمنافسة في سباق المركبات الكهربائية الكبير (EVGP)، وموعدنا المستهدف هو 13 فبراير 2027. نقيم كل قرار تصميمي وفق الأداء والسلامة والموثوقية، لا وفق المظهر داخل الورشة فقط.',
      'When We Meet': 'مواعيد اجتماعاتنا', 'We meet in the Electric Car Room every Wednesday and Thursday. Sessions mix build work, electrical checks, safety drills, and media updates so the whole crew stays race-ready.': 'نجتمع في غرفة السيارة الكهربائية كل أربعاء وخميس. تجمع الجلسات بين أعمال البناء والفحوصات الكهربائية وتدريبات السلامة والتحديثات الإعلامية ليبقى الفريق مستعدًا للسباق.',
      'Grades': 'الصفوف', 'Days per week': 'يومان أسبوعيًا', 'Team, One Dream': 'فريق واحد، حلم واحد', 'See the work': 'شاهد عملنا', 'Follow the build, the specs, and the people behind the car.': 'تابع مراحل البناء والمواصفات والطلاب الذين يقفون خلف السيارة.'
    },
    'sponsors.html': {
      'Partner with student engineering': 'شارك في دعم الهندسة الطلابية', 'Put your name behind': 'ضع اسم مؤسستك خلف', 'the next generation.': 'الجيل القادم.',
      'Your support helps Grades 11–12 students turn ideas into a real electric race car—and gives your organization a visible role in hands-on STEM education.': 'يساعد دعمكم طلاب الصفين الحادي عشر والثاني عشر على تحويل الأفكار إلى سيارة سباق كهربائية حقيقية، ويمنح مؤسستكم دورًا بارزًا في دعم تعليم العلوم والتقنية والهندسة والرياضيات بالتجربة العملية.',
      'Start a conversation': 'ابدأ الحوار', 'See what we build': 'شاهد ما نبنيه', '01 / Why partner': '01 / لماذا تشارك؟', 'Visible, practical impact': 'أثر عملي وملموس', 'Support that reaches the workshop and the track.': 'دعم يصل إلى الورشة وحلبة السباق.',
      'Develop real skills': 'تنمية مهارات حقيقية', 'Support students learning mechanics, electrical systems, safety, teamwork, and communication.': 'ساهم في تعليم الطلاب الميكانيكا والأنظمة الكهربائية والسلامة والعمل الجماعي والتواصل.',
      'Reach race day': 'الوصول إلى يوم السباق', 'Help fund the parts, testing, logistics, and safety equipment required for competition.': 'ساهم في تمويل القطع والاختبارات والخدمات اللوجستية ومعدات السلامة اللازمة للمنافسة.',
      'Back local talent': 'دعم المواهب المحلية', 'Be associated with ambitious young engineers representing their school and community.': 'اربط اسم مؤسستك بمهندسين شباب طموحين يمثلون مدرستهم ومجتمعهم.',
      'Where support goes': 'أوجه استخدام الدعم', 'Every contribution solves a real problem.': 'كل مساهمة تساعد في حل تحدٍ حقيقي.',
      'Car components': 'مكوّنات السيارة', 'Electrical, mechanical, drivetrain, control, and replacement parts.': 'قطع كهربائية وميكانيكية وقطع لنظام نقل الحركة والتحكم والاستبدال.',
      'Safety equipment': 'معدات السلامة', 'Driver protection, workshop PPE, fire safety, and inspection equipment.': 'حماية السائق ومعدات الوقاية في الورشة والسلامة من الحريق وأدوات الفحص.',
      'Testing': 'الاختبارات', 'Track access, diagnostic tools, data collection, and consumables.': 'استخدام الحلبة وأدوات التشخيص وجمع البيانات والمواد المستهلكة.',
      'Race logistics': 'الخدمات اللوجستية للسباق', 'Transportation, team materials, documentation, and event preparation.': 'النقل ومواد الفريق والوثائق والاستعداد للفعالية.',
      '03 / Partnership': '03 / الشراكة', 'Ways to take part': 'طرق المشاركة', 'Choose the support that fits.': 'اختر نوع الدعم الأنسب.',
      'Equipment partner': 'شريك المعدات', 'Provide what the team uses': 'وفّر ما يحتاجه الفريق', 'Contribute parts, tools, safety gear, workshop services, or technical expertise.': 'قدّم قطعًا أو أدوات أو معدات سلامة أو خدمات ورش أو خبرة تقنية.',
      'Recognition on the website': 'إبراز الشريك على الموقع', 'Workshop acknowledgement': 'تقدير الشريك في الورشة', 'Impact update from the team': 'تقرير من الفريق عن أثر الدعم',
      'Race partner': 'شريك السباق', 'Help take the Cobra to EVGP': 'ساعد كوبرا في الوصول إلى EVGP', 'Support testing, preparation, transport, and the costs of getting the complete team to competition.': 'ادعم الاختبارات والاستعداد والنقل وتكاليف مشاركة الفريق كاملًا في المسابقة.',
      'Prominent website placement': 'ظهور بارز على الموقع', 'Race-day team recognition': 'تقدير الشريك في يوم السباق', 'Logo placement subject to competition rules': 'وضع الشعار وفق قواعد المسابقة',
      'Learning partner': 'شريك التعلّم', 'Invest in student development': 'استثمر في تنمية الطلاب', 'Offer mentoring, technical talks, engineering visits, media support, or specialist advice.': 'قدّم إرشادًا أو محاضرات تقنية أو زيارات هندسية أو دعمًا إعلاميًا أو استشارات متخصصة.',
      'Partner profile on the website': 'ملف تعريفي للشريك على الموقع', 'Student learning session': 'جلسة تعليمية للطلاب', 'Team thank-you feature': 'فقرة شكر خاصة من الفريق',
      'Want to sponsor us?': 'هل ترغب في رعايتنا؟', 'Tell CarGPT you want to partner with the Cobras.': 'أخبر CarGPT بأنك ترغب في الشراكة مع فريق كوبرا.', 'Open the assistant and choose the sponsorship prompt, or message the team on Instagram/TikTok. We will connect you with the right school contact for equipment, race, or learning partnerships.': 'افتح المساعد واختر سؤال الرعاية، أو راسل الفريق عبر إنستغرام أو تيك توك. سنوصلك بجهة التواصل المناسبة في المدرسة لشراكات المعدات أو السباق أو التعلّم.',
      'Open CarGPT': 'افتح CarGPT', 'Ask how your organization can support the Cobras.': 'اسأل كيف يمكن لمؤسستك دعم فريق كوبرا.', 'How can I sponsor the team?': 'كيف يمكنني رعاية الفريق؟', 'What support does the team need?': 'ما نوع الدعم الذي يحتاجه الفريق؟', 'Ask about sponsorship…': 'اسأل عن الرعاية…',
      'Real contact': 'التواصل المباشر', 'Email the sponsorship desk': 'راسل فريق الرعاية', 'Open sponsor package': 'افتح باقة الرعاية', 'Download package PDF': 'نزّل باقة الرعاية بصيغة PDF'
    },
    'checklist.html': {
      'Shared race clock': 'ساعة السباق المشتركة', 'Same countdown as the home page.': 'العدّ التنازلي نفسه الظاهر في الصفحة الرئيسية.', 'EVGP countdown': 'العدّ التنازلي لـ EVGP', 'Days': 'أيام', 'Hours': 'ساعات', 'Minutes': 'دقائق', 'Seconds': 'ثوانٍ',
      '01 / Progress': '01 / التقدم', 'Completion': 'نسبة الإنجاز',
      'Documentation pack': 'حزمة الوثائق', 'Rules summary, inspection forms, and emergency contacts printed and digital.': 'ملخص القواعد ونماذج الفحص وجهات اتصال الطوارئ بنسختين مطبوعة ورقمية.',
      'Safety gear': 'معدات السلامة', 'Helmet, belts, PPE, fire extinguisher check, kill-switch drill completed.': 'التأكد من الخوذة والأحزمة ومعدات الوقاية وفحص مطفأة الحريق والتدرّب على مفتاح الإيقاف.',
      'Electrical sign-off': 'اعتماد النظام الكهربائي', '48V continuity, labels, insulation, and shutdown procedure verified.': 'التحقق من استمرارية دائرة 48 فولت والتسميات والعزل وإجراء الإيقاف.',
      'Mechanical sign-off': 'اعتماد النظام الميكانيكي', 'Steering, brakes, wheels, seat, and fasteners torque-checked.': 'فحص التوجيه والمكابح والعجلات والمقعد وعزم ربط المثبتات.',
      'Driver readiness': 'جاهزية السائق', 'Ergonomics, communication plan, and practice runs logged.': 'توثيق ملاءمة المقصورة وخطة التواصل والجولات التدريبية.',
      'Logistics': 'الخدمات اللوجستية', 'Transport, tools kit, spares, and arrival timeline confirmed.': 'تأكيد النقل وحقيبة الأدوات والقطع الاحتياطية وجدول الوصول.',
      'Media kit': 'الحزمة الإعلامية', 'Photos, logo pack, and social posts scheduled for race week.': 'إعداد الصور وحزمة الشعارات ومنشورات التواصل لأسبوع السباق.',
      'Sponsor recognition': 'تقدير الرعاة', 'Logo placement rules reviewed; thank-you plan ready.': 'مراجعة قواعد وضع الشعارات وتجهيز خطة شكر الرعاة.'
    },
    'sponsor-package.html': {
      'One-pager': 'ملخص من صفحة واحدة', 'Download the package PDF': 'نزّل باقة الرعاية بصيغة PDF', 'Share with your CSR or marketing team in one click.': 'شاركها بسهولة مع فريق المسؤولية المجتمعية أو التسويق.', 'Partnership tiers': 'فئات الشراكة',
      'Tier 01': 'الفئة 01', 'Tier 02': 'الفئة 02', 'Tier 03': 'الفئة 03', 'Equipment partner': 'شريك المعدات', 'Race partner': 'شريك السباق', 'Learning partner': 'شريك التعلّم',
      'Parts, tools, safety gear, workshop services, or technical expertise.': 'قطع وأدوات ومعدات سلامة وخدمات ورش أو خبرة تقنية.', 'Support testing, transport, and competition logistics for EVGP.': 'دعم الاختبارات والنقل والخدمات اللوجستية لمسابقة EVGP.', 'Mentoring, technical talks, lab visits, or media support.': 'إرشاد ومحاضرات تقنية وزيارات مختبرية أو دعم إعلامي.',
      'Website recognition': 'إبراز الشريك على الموقع', 'Workshop acknowledgement': 'تقدير الشريك في الورشة', 'Impact update from the team': 'تقرير عن أثر الدعم', 'Prominent website placement': 'ظهور بارز على الموقع', 'Race-day team recognition': 'تقدير في يوم السباق', 'Logo placement subject to rules': 'وضع الشعار وفق القواعد', 'Partner profile on the website': 'ملف للشريك على الموقع', 'Student learning session': 'جلسة تعليمية للطلاب', 'Team thank-you feature': 'فقرة شكر من الفريق',
      'Real contact': 'التواصل المباشر', 'Talk to the Cobras sponsorship desk': 'تواصل مع فريق رعاية كوبرا', 'This is a school-channel placeholder — replace with your official address when ready. You can also message @sisaljadacobras on Instagram or TikTok.': 'هذا عنوان مؤقت لقناة المدرسة؛ استبدله بالعنوان الرسمي عند اعتماده. ويمكنك أيضًا مراسلة @sisaljadacobras عبر إنستغرام أو تيك توك.',
      'Organization': 'المؤسسة', 'Company or foundation': 'شركة أو مؤسسة', 'Your email': 'بريدك الإلكتروني', 'How you can help': 'كيف يمكنك المساعدة', 'Parts, funding, mentoring…': 'قطع أو تمويل أو إرشاد…', 'Send via email app': 'إرسال عبر تطبيق البريد'
    },
    'news.html': {
      'Team news': 'أخبار الفريق', 'Systems week: kill switch & labels': 'أسبوع الأنظمة: مفتاح الإيقاف والتسميات', 'Electrical crew re-checked the 48V layout, secured connectors, and re-labeled critical runs so troubleshooting is faster on test day.': 'أعاد فريق الكهرباء فحص نظام 48 فولت وثبّت الموصلات وجدّد تسميات التوصيلات المهمة لتسريع اكتشاف الأعطال في يوم الاختبار.',
      'Balance passes on the current chassis': 'اختبارات التوازن على الهيكل الحالي', 'Mechanics shifted battery placement after low-speed runs. Weight is still near 186 kg — we will re-weigh after the next parts drop.': 'عدّل فريق الميكانيكا مواضع البطاريات بعد جولات منخفضة السرعة. ما زال الوزن قريبًا من 186 كغ، وسنعيد الوزن بعد تركيب القطع التالية.',
      'Media pack + sponsor one-pager': 'الحزمة الإعلامية وملخص الرعاية', 'Media crew published a clean sponsor package PDF and refreshed social stills for race partner outreach.': 'نشر فريق الإعلام ملف رعاية مختصرًا بصيغة PDF وحدّث الصور المخصصة للتواصل مع شركاء السباق.',
      'EVGP countdown is live': 'بدأ العدّ التنازلي لـ EVGP', 'Target race date locked for planning: 13 February 2027. The Race Checklist page tracks gear, docs, and safety items.': 'اعتمدنا 13 فبراير 2027 موعدًا مستهدفًا للتخطيط. تتابع صفحة قائمة السباق المعدات والوثائق ومتطلبات السلامة.'
    },
    '404.html': {
      '404 · Off course': '404 · خارج المسار', 'This page': 'هذه الصفحة', 'missed the grid.': 'لم تصل إلى خط الانطلاق.', 'That URL is not on the Cobras site. Head back home or jump into the build.': 'هذا الرابط غير موجود في موقع كوبرا. عُد إلى الرئيسية أو انتقل إلى مراحل البناء.'
    }
  };

  const TITLES = {
    'members.html': 'الأعضاء | فريق كوبرا سيس الجادة', 'projects.html': 'مشروعنا | فريق كوبرا سيس الجادة', '101.html': 'أساسيات السيارات الكهربائية | فريق كوبرا سيس الجادة', 'specs.html': 'المواصفات | فريق كوبرا سيس الجادة', 'about.html': 'من نحن | فريق كوبرا سيس الجادة', 'sponsors.html': 'رعاية الفريق | فريق كوبرا سيس الجادة', 'news.html': 'الأخبار | فريق كوبرا سيس الجادة', 'checklist.html': 'قائمة السباق | فريق كوبرا سيس الجادة', 'race-day.html': 'يوم السباق | فريق كوبرا سيس الجادة', 'sponsor-package.html': 'باقة الرعاية | فريق كوبرا سيس الجادة', '404.html': 'الصفحة غير موجودة | فريق كوبرا سيس الجادة',
    'index.html': 'فريق كوبرا سيس الجادة | سيارة سباق كهربائية من صنع الطلاب', 'trackmap.html': 'خريطة المسار | فريق كوبرا سيس الجادة', 'car.html': 'الكوبرا | فريق كوبرا سيس الجادة'
  };

  function translateText(page, text) {
    return (PAGES[page] && PAGES[page][text]) || COMMON[text] || text;
  }

  function apply(root, page, lang) {
    if (!root || lang !== 'ar') return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      if (node.parentElement && node.parentElement.closest('script,style')) return;
      const original = node.nodeValue.trim();
      if (!original) return;
      const translated = translateText(page, original);
      if (translated !== original) node.nodeValue = node.nodeValue.replace(original, translated);
    });
    root.querySelectorAll('[placeholder],[aria-label],[alt],[title]').forEach(node => {
      ['placeholder', 'aria-label', 'alt', 'title'].forEach(attribute => {
        const value = node.getAttribute(attribute);
        if (!value) return;
        const translated = translateText(page, value);
        if (translated !== value) node.setAttribute(attribute, translated);
      });
    });
    if (TITLES[page]) document.title = TITLES[page];
    isolateLatin(root);
  }

  /* Whatever is still in English after the pass above has to survive being laid
     out inside dir="rtl", and by default it does not. Bidi resolves a run of
     Latin left-to-right but treats trailing punctuation as neutral, so it takes
     the direction of the paragraph instead of the sentence: "Meet the Cobra."
     renders as ".Meet the Cobra", with the full stop thrown to the far left. The
     text is intact and the reader sees it broken.

     dir="auto" resolves each element from its own first strong character, which
     is exactly the right rule here — a Latin element lays out LTR and keeps its
     punctuation, an Arabic one is untouched.

     Only elements that are wholly Latin qualify. An Arabic sentence containing
     "EVGP" or "Planet Labs PBC" is already correct: bidi nests those runs inside
     an RTL paragraph properly, and forcing a direction on the parent would be
     the thing that broke them. Leaf elements only, for the same reason — setting
     this on a container would re-align its Arabic descendants too.

     This is a safety net, not the fix. The fix is translating the string; the
     net is for proper nouns, licence names and anything added later that has not
     been through the dictionary yet. */
  function isolateLatin(root) {
    const ARABIC = /[؀-ۿ]/;
    const LATIN = /[A-Za-z]/;
    root.querySelectorAll('h1, h2, h3, h4, p, li, figcaption, td, th, dt, dd, strong, em, small, blockquote, button, a').forEach(el => {
      if (el.querySelector('h1, h2, h3, h4, p, li, figcaption, td, th, dt, dd, blockquote')) return;
      if (el.hasAttribute('dir')) return;
      const text = el.textContent;
      if (!LATIN.test(text) || ARABIC.test(text)) return;
      el.setAttribute('dir', 'auto');
    });
  }

  const api = { COMMON, PAGES, TITLES, translateText, apply };
  global.CobrasArabic = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
