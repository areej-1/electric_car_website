/** Complete Arabic content layer for the static multi-page site. */
(function (global) {
  const COMMON = {
    'Our Team': 'فريقنا',
    'Mechanic': 'الميكانيكا', 'Safety': 'السلامة', 'Media': 'الإعلام', 'Driver': 'القيادة', 'Innovation': 'الابتكار',
    'Hi! Ask me anything about the Cobras team or electric cars. 🏎️⚡': 'مرحبًا! اسألني عن فريق كوبرا أو السيارات الكهربائية. 🏎️⚡',
    'Message to CarGPT': 'رسالة إلى CarGPT', 'Ask CarGPT…': 'اسأل CarGPT…', 'Send': 'إرسال', 'Close': 'إغلاق',
    'Made by Areej': 'تصميم وتطوير عريج', 'Copyright 2026 SIS Al Jada Cobras': 'حقوق النشر 2026 لفريق كوبرا سيس الجادة',
    'Difficulty': 'الصعوبة', 'F3 difficulty': 'صعوبة F3', 'F2 difficulty': 'صعوبة F2', 'F1 difficulty': 'صعوبة F1',
    'Download specs PDF': 'تنزيل ملف المواصفات بصيغة PDF', 'Sponsor package': 'باقة الرعاية',
    'Back home': 'العودة إلى الرئيسية', 'Our Work': 'مشروعنا'
  };

  const PAGES = {
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
    'members.html': 'الأعضاء | فريق كوبرا سيس الجادة', 'projects.html': 'مشروعنا | فريق كوبرا سيس الجادة', '101.html': 'أساسيات السيارات الكهربائية | فريق كوبرا سيس الجادة', 'specs.html': 'المواصفات | فريق كوبرا سيس الجادة', 'about.html': 'من نحن | فريق كوبرا سيس الجادة', 'sponsors.html': 'رعاية الفريق | فريق كوبرا سيس الجادة', 'news.html': 'الأخبار | فريق كوبرا سيس الجادة', 'checklist.html': 'قائمة السباق | فريق كوبرا سيس الجادة', 'race-day.html': 'يوم السباق | فريق كوبرا سيس الجادة', 'sponsor-package.html': 'باقة الرعاية | فريق كوبرا سيس الجادة', '404.html': 'الصفحة غير موجودة | فريق كوبرا سيس الجادة'
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
  }

  const api = { COMMON, PAGES, TITLES, translateText, apply };
  global.CobrasArabic = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
