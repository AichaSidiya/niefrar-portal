import React, { useMemo, useState } from "react";
import {
  Home,
  Search,
  BookOpen,
  FileText,
  Feather,
  ScrollText,
  CalendarDays,
  Network,
  UserRound,
  GitBranch,
  MapPin,
  HelpCircle,
  FileSearch,
  Bell,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Database,
  Settings,
  Smartphone,
  Layers,
  ArrowRight,
} from "lucide-react";

const sections = [
  {
    id: "library",
    title: "المكتبة",
    subtitle: "المؤلفات، المقالات، مواد الأسبوع الثقافي، والإنتاجات الأدبية",
    accent: "#b77a23",
    icon: BookOpen,
    children: [
      { id: "books", title: "مؤلفات", icon: BookOpen, description: "صفحة الكتب والمؤلفات مع التصنيف والبحث." },
      { id: "articles", title: "مقالات", icon: FileText, description: "صفحة المقالات والمواد المنشورة." },
      { id: "kinnash", title: "الكناش", icon: ScrollText, description: "مدخل للكناش والمختارات العلمية والأدبية." },
      { id: "culture-week", title: "مواد الأسبوع الثقافي", icon: CalendarDays, description: "أرشيف مواد وبرامج الأسبوع الثقافي." },
      { id: "literary", title: "إنتاجات أدبية", icon: Feather, description: "قصائد ونصوص وإنتاجات أدبية مختارة." },
    ],
  },
  {
    id: "ansab",
    title: "الأنساب",
    subtitle: "شجرة الأنساب وسلسلة الأمهات",
    accent: "#006b5b",
    icon: Network,
    children: [
      { id: "tree", title: "شجرة الأنساب", icon: GitBranch, description: "شجرة تفاعلية للبحث، المسار، الفروع، والعلاقات." },
      { id: "mothers", title: "سلسلة الأمهات", icon: UserRound, description: "عرض سلسلة الأمهات وربطها بالأفراد والفروع." },
    ],
  },
  {
    id: "cemeteries",
    title: "المدافن والمراثي",
    subtitle: "المدافن، دفناء كل مدفن، والمراثي المرتبطة",
    accent: "#714116",
    icon: MapPin,
    children: [
      { id: "cemetery-list", title: "المدافن", icon: MapPin, description: "خريطة وقائمة المدافن وأكوادها ومن دُفن فيها." },
      { id: "elegies", title: "المراثي", icon: Feather, description: "أرشيف المراثي وربطها بالأشخاص والمدافن." },
    ],
  },
  {
    id: "quiz",
    title: "اتحاجي / الزرك",
    subtitle: "اختبارات وتحديات معرفية",
    accent: "#672596",
    icon: HelpCircle,
    children: [
      { id: "relationship-quiz", title: "اختبار القرابة", icon: HelpCircle, description: "يسأل عن القرابة أو المسار بين شخصين." },
      { id: "cemetery-quiz", title: "اختبار المدافن", icon: MapPin, description: "أسئلة حول المدافن ودفنائها." },
      { id: "elegy-quiz", title: "اختبار المراثي", icon: Feather, description: "أسئلة حفظ وربط المراثي بأصحابها." },
    ],
  },
  {
    id: "sources",
    title: "المصادر والتدقيق",
    subtitle: "المصادر ومنهج التحقق والمراجعة",
    accent: "#155b75",
    icon: FileSearch,
    children: [
      { id: "references", title: "المصادر", icon: BookOpen, description: "توثيق مصادر البيانات والكتب والمخطوطات." },
      { id: "review-method", title: "منهج التدقيق", icon: ShieldCheck, description: "آلية مراجعة البيانات، الملاحظات، والأولويات." },
    ],
  },
];

const bottomItems = [
  { id: "account", label: "حسابي", icon: UserRound },
  { id: "challenge", label: "تحدي", icon: HelpCircle },
  { id: "favorites", label: "المفضلة", icon: Bookmark },
  { id: "notifications", label: "الإشعارات", icon: Bell },
  { id: "home", label: "الرئيسية", icon: Home },
];

const adminItems = [
  { title: "Excel كمصدر بيانات", text: "يمكن إبقاء Excel كملف تحرير رئيسي للمدير، ثم تحويله تلقائيًا إلى JSON للواجهة." , icon: Database },
  { title: "لوحة إدارة مبسطة", text: "صفحات إضافة/تعديل/مراجعة بدون تعقيد تقني، مع حماية وصلاحيات." , icon: Settings },
  { title: "جاهز للتطبيقات", text: "نفس الواجهة يمكن تغليفها لاحقًا كتطبيق iPhone وAndroid باستخدام Capacitor." , icon: Smartphone },
];

function classNames(...items) {
  return items.filter(Boolean).join(" ");
}

function findPage(pageId) {
  if (pageId === "home") return { type: "home" };
  for (const section of sections) {
    if (section.id === pageId) return { type: "section", section };
    const child = section.children.find((item) => item.id === pageId);
    if (child) return { type: "child", section, child };
  }
  return { type: "utility", id: pageId };
}

export default function NiefrarPortalPrototype() {
  const [page, setPage] = useState("home");
  const [query, setQuery] = useState("");
  const [openSection, setOpenSection] = useState(null);

  const current = findPage(page);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const rows = [];
    sections.forEach((section) => {
      if (section.title.toLowerCase().includes(q) || section.subtitle.toLowerCase().includes(q)) {
        rows.push({ id: section.id, title: section.title, meta: "قسم رئيسي", accent: section.accent });
      }
      section.children.forEach((child) => {
        if (child.title.toLowerCase().includes(q) || child.description.toLowerCase().includes(q)) {
          rows.push({ id: child.id, title: child.title, meta: section.title, accent: section.accent });
        }
      });
    });
    return rows;
  }, [query]);

  const navigate = (target) => {
    setPage(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#f6efe5] text-[#173a36]">
      <div className="mx-auto min-h-screen max-w-[430px] bg-[radial-gradient(circle_at_top_left,#fff7ea_0,#f6efe5_36%,#efe4d5_100%)] shadow-2xl">
        <div className="sticky top-0 z-40 bg-[#f6efe5]/90 px-5 pb-3 pt-3 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between text-sm font-semibold text-[#063f37]">
            <span>9:41</span>
            <span className="flex items-center gap-1 text-xs">
              <span className="h-2 w-1 rounded bg-[#063f37]" />
              <span className="h-3 w-1 rounded bg-[#063f37]" />
              <span className="h-4 w-1 rounded bg-[#063f37]" />
              <span className="mx-1">⌁</span>
              <span className="h-4 w-7 rounded border-2 border-[#063f37] after:mx-auto after:mt-[3px] after:block after:h-2 after:w-4 after:rounded-sm after:bg-[#063f37]" />
            </span>
          </div>

          {page !== "home" && (
            <div className="mb-3 flex items-center justify-between rounded-full bg-white/80 p-1 shadow-sm ring-1 ring-black/5">
              <button
                onClick={() => navigate("home")}
                className="flex items-center gap-2 rounded-full bg-[#f7f1e8] px-4 py-2 text-sm font-bold text-[#0a5d52]"
              >
                <Home size={18} /> الرئيسية
              </button>
              <button
                onClick={() => navigate(current.type === "child" ? current.section.id : "home")}
                className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-[#6d6b64]"
              >
                رجوع <ChevronLeft size={16} />
              </button>
            </div>
          )}
        </div>

        <main className="px-5 pb-28">
          {page === "home" ? (
            <HomePage
              query={query}
              setQuery={setQuery}
              searchResults={searchResults}
              navigate={navigate}
              openSection={openSection}
              setOpenSection={setOpenSection}
            />
          ) : current.type === "section" ? (
            <SectionPage section={current.section} navigate={navigate} />
          ) : current.type === "child" ? (
            <ChildPage section={current.section} child={current.child} navigate={navigate} />
          ) : (
            <UtilityPage id={page} navigate={navigate} />
          )}
        </main>

        <BottomNav page={page} navigate={navigate} />
      </div>
    </div>
  );
}

function HomePage({ query, setQuery, searchResults, navigate, openSection, setOpenSection }) {
  return (
    <div className="space-y-5">
      <Hero navigate={navigate} />

      <div className="rounded-[1.6rem] bg-white/85 p-4 shadow-lg shadow-[#a8865a]/10 ring-1 ring-black/5">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f4eee5] text-[#263733]">
            <Search size={26} />
          </div>
          <div className="flex-1">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث داخل البوابة..."
              className="w-full bg-transparent text-right text-lg font-semibold outline-none placeholder:text-[#9c9a93]"
            />
            <p className="mt-1 text-xs text-[#8b8378]">اسم، فرع، مؤلف، مدفن، مرثية، أو مصدر</p>
          </div>
        </div>
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-[#eee1cf] pt-3">
            {searchResults.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className="flex w-full items-center justify-between rounded-2xl bg-[#fbf7f1] px-4 py-3 text-right transition hover:scale-[1.01]"
              >
                <span>
                  <span className="block font-bold" style={{ color: item.accent }}>{item.title}</span>
                  <span className="text-xs text-[#8b8378]">{item.meta}</span>
                </span>
                <ChevronLeft size={18} className="text-[#8b8378]" />
              </button>
            ))}
          </div>
        )}
      </div>

      {sections.map((section) => (
        <SectionCard
          key={section.id}
          section={section}
          isOpen={openSection === section.id}
          toggle={() => setOpenSection(openSection === section.id ? null : section.id)}
          navigate={navigate}
        />
      ))}

      <div className="rounded-[1.6rem] bg-white/75 p-4 shadow-sm ring-1 ring-black/5">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-[#0f5149]">
          <Layers size={20} /> بنية مستقبلية مناسبة
        </h3>
        <div className="space-y-3">
          {adminItems.map((item) => (
            <div key={item.title} className="flex gap-3 rounded-2xl bg-[#fbf7f1] p-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#0f6a5c] shadow-sm">
                <item.icon size={20} />
              </div>
              <div>
                <p className="font-bold text-[#173a36]">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-[#7d756b]">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero({ navigate }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-[#073f37] p-7 text-white shadow-xl shadow-[#0f3029]/20">
      <div className="absolute -left-14 -top-16 h-52 w-52 rounded-full bg-white/8" />
      <div className="absolute -right-4 top-8 h-48 w-48 rounded-full bg-white/10" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,0))]" />
      <div className="relative z-10 flex justify-between">
        <div className="h-8 w-28 rounded-full bg-white/95" />
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-2 rounded-full bg-[#fff6e7] px-4 py-2 text-sm font-bold text-[#0a5d52]"
        >
          الرئيسية <Home size={18} />
        </button>
      </div>
      <div className="relative z-10 mt-12 text-left" dir="ltr">
        <h1 className="text-4xl font-black tracking-tight">Niefrar Portal</h1>
        <div className="mt-5 flex items-center gap-3">
          <span className="h-1 w-20 rounded bg-[#d09b3f]" />
          <span className="h-3 w-3 rounded-full bg-[#d09b3f]" />
        </div>
      </div>
      <div className="relative z-10 mt-7 text-right">
        <p className="text-xl font-bold text-white/90">بوابة للمعرفة والأنساب والتراث</p>
        <p className="mt-3 text-sm leading-7 text-white/75">المكتبة، الأنساب، المدافن، التحديات، المصادر.</p>
      </div>
    </section>
  );
}

function SectionCard({ section, isOpen, toggle, navigate }) {
  const Icon = section.icon;
  return (
    <section className="relative overflow-hidden rounded-[1.55rem] bg-white/85 p-4 pr-5 shadow-lg shadow-[#a8865a]/10 ring-1 ring-black/5">
      <button
        onClick={() => navigate(section.id)}
        className="absolute right-0 top-0 h-full w-5 rounded-r-[1.55rem]"
        style={{ backgroundColor: section.accent }}
        aria-label={`فتح ${section.title}`}
      />
      <div className="flex items-center gap-4 pr-4">
        <button
          onClick={() => navigate(section.id)}
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#f5f0e7] transition hover:scale-105"
          style={{ color: section.accent }}
        >
          <Icon size={38} strokeWidth={1.7} />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <button onClick={() => navigate(section.id)}>
            <h2 className="text-3xl font-black tracking-tight" style={{ color: section.accent }}>{section.title}</h2>
          </button>
          <p className="mx-auto mt-1 max-w-[230px] text-sm leading-6 text-[#8b8378]">{section.subtitle}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {section.children.slice(0, 5).map((child) => (
              <button
                key={child.id}
                onClick={() => navigate(child.id)}
                className="flex items-center gap-2 rounded-full bg-[#f7f1e8] px-4 py-2 text-sm font-semibold text-[#34423e] shadow-sm transition hover:bg-white"
              >
                {child.title}
                <child.icon size={16} style={{ color: section.accent }} />
              </button>
            ))}
          </div>
        </div>
      </div>
      {section.children.length > 2 && (
        <button
          onClick={toggle}
          className="mt-4 flex w-full items-center justify-center gap-1 rounded-2xl bg-[#fbf7f1] py-2 text-xs font-bold text-[#7d756b]"
        >
          {isOpen ? "إخفاء التفاصيل" : "عرض كل الصفحات الفرعية"}
          <ChevronLeft className={classNames("transition", isOpen && "-rotate-90")} size={16} />
        </button>
      )}
      {isOpen && (
        <div className="mt-3 grid grid-cols-1 gap-2">
          {section.children.map((child) => (
            <button
              key={child.id}
              onClick={() => navigate(child.id)}
              className="flex items-center justify-between rounded-2xl bg-[#fbf7f1] px-4 py-3 text-right"
            >
              <span>
                <span className="block font-bold" style={{ color: section.accent }}>{child.title}</span>
                <span className="text-xs text-[#8b8378]">{child.description}</span>
              </span>
              <ChevronLeft size={18} className="text-[#8b8378]" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function SectionPage({ section, navigate }) {
  const Icon = section.icon;
  return (
    <div className="space-y-5">
      <div className="rounded-[2rem] p-6 text-white shadow-xl" style={{ backgroundColor: section.accent }}>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
            <Icon size={36} />
          </div>
          <div>
            <p className="text-sm text-white/70">قسم رئيسي</p>
            <h1 className="text-3xl font-black">{section.title}</h1>
          </div>
        </div>
        <p className="mt-5 leading-7 text-white/80">{section.subtitle}</p>
      </div>

      <div className="rounded-[1.7rem] bg-white/85 p-4 shadow-lg shadow-[#a8865a]/10 ring-1 ring-black/5">
        <h2 className="mb-4 text-xl font-black" style={{ color: section.accent }}>صفحات هذا القسم</h2>
        <div className="space-y-3">
          {section.children.map((child) => (
            <button
              key={child.id}
              onClick={() => navigate(child.id)}
              className="flex w-full items-center justify-between rounded-3xl bg-[#fbf7f1] p-4 text-right transition hover:scale-[1.01] hover:bg-white"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm" style={{ color: section.accent }}>
                  <child.icon size={24} />
                </span>
                <span>
                  <span className="block text-lg font-extrabold text-[#173a36]">{child.title}</span>
                  <span className="text-xs leading-5 text-[#8b8378]">{child.description}</span>
                </span>
              </span>
              <ChevronLeft size={20} className="text-[#8b8378]" />
            </button>
          ))}
        </div>
      </div>

      <PrototypeNote accent={section.accent} />
    </div>
  );
}

function ChildPage({ section, child, navigate }) {
  const Icon = child.icon;
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-[#877d71]">
        <button onClick={() => navigate("home")} className="font-bold text-[#0a5d52]">الرئيسية</button>
        <ChevronLeft size={15} />
        <button onClick={() => navigate(section.id)} className="font-bold" style={{ color: section.accent }}>{section.title}</button>
        <ChevronLeft size={15} />
        <span>{child.title}</span>
      </div>

      <section className="rounded-[2rem] bg-white/85 p-6 shadow-lg shadow-[#a8865a]/10 ring-1 ring-black/5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f7f1e8]" style={{ color: section.accent }}>
            <Icon size={34} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: section.accent }}>{section.title}</p>
            <h1 className="text-3xl font-black text-[#173a36]">{child.title}</h1>
          </div>
        </div>
        <p className="mt-5 leading-7 text-[#7d756b]">{child.description}</p>
      </section>

      <section className="rounded-[1.7rem] bg-white/85 p-4 shadow-lg shadow-[#a8865a]/10 ring-1 ring-black/5">
        <h2 className="mb-3 text-xl font-black text-[#173a36]">منطقة المحتوى التفاعلي</h2>
        <div className="space-y-3">
          <div className="rounded-3xl bg-[#fbf7f1] p-4">
            <p className="text-sm font-bold text-[#173a36]">هنا سنضيف لاحقًا محتوى الصفحة:</p>
            <p className="mt-2 text-sm leading-7 text-[#7d756b]">
              جداول، بحث، فلاتر، شجرة تفاعلية، بطاقات، اختبارات، خرائط، أو روابط مصادر حسب نوع الصفحة.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="rounded-2xl bg-[#f7f1e8] px-4 py-3 text-sm font-bold text-[#173a36]">بحث داخل الصفحة</button>
            <button className="rounded-2xl px-4 py-3 text-sm font-bold text-white" style={{ backgroundColor: section.accent }}>إضافة للمفضلة</button>
          </div>
        </div>
      </section>

      <button
        onClick={() => navigate(section.id)}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#173a36] py-4 font-bold text-white shadow-lg"
      >
        <ArrowRight size={18} /> العودة إلى {section.title}
      </button>
    </div>
  );
}

function UtilityPage({ id, navigate }) {
  const labels = {
    account: "حسابي",
    challenge: "تحدي",
    favorites: "المفضلة",
    notifications: "الإشعارات",
  };
  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] bg-white/85 p-6 text-center shadow-lg ring-1 ring-black/5">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f7f1e8] text-[#0a5d52]">
          <Settings size={34} />
        </div>
        <h1 className="mt-4 text-3xl font-black text-[#173a36]">{labels[id] || "صفحة"}</h1>
        <p className="mt-3 leading-7 text-[#7d756b]">هذه صفحة مساعدة من شريط التنقل السفلي، ويمكن ربطها لاحقًا بالحساب، الإشعارات، التحديات، أو المفضلة.</p>
      </section>
      <button onClick={() => navigate("home")} className="w-full rounded-full bg-[#0a5d52] py-4 font-bold text-white">العودة للرئيسية</button>
    </div>
  );
}

function PrototypeNote({ accent }) {
  return (
    <div className="rounded-[1.6rem] bg-white/75 p-4 shadow-sm ring-1 ring-black/5">
      <h3 className="font-black" style={{ color: accent }}>ملاحظة تصميمية</h3>
      <p className="mt-2 text-sm leading-7 text-[#7d756b]">
        هذه الصفحة جاهزة كهيكل أولي. كل بطاقة رئيسية وكل بطاقة فرعية لها صفحة مستقلة الآن، ويمكن لاحقًا ربط كل صفحة بمصدر بيانات Excel أو JSON أو قاعدة بيانات.
      </p>
    </div>
  );
}

function BottomNav({ page, navigate }) {
  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[min(390px,calc(100%-28px))] -translate-x-1/2 rounded-[1.6rem] bg-white/90 px-3 py-2 shadow-2xl shadow-black/15 ring-1 ring-black/5 backdrop-blur-xl">
      <div className="grid grid-cols-5 gap-1">
        {bottomItems.map((item) => {
          const active = page === item.id || (item.id === "home" && page === "home");
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={classNames(
                "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-bold transition",
                active ? "bg-[#e7f3ef] text-[#0a5d52]" : "text-[#3f4743] hover:bg-[#f7f1e8]"
              )}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
