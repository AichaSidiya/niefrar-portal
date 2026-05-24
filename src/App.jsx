import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BookOpen,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Database,
  Download,
  Eye,
  Feather,
  FileSearch,
  FileSpreadsheet,
  FileText,
  GitBranch,
  HelpCircle,
  Home,
  ImagePlus,
  KeyRound,
  Layers,
  Loader2,
  LockKeyhole,
  LogOut,
  MapPin,
  Network,
  Plus,
  Save,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Table2,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";

const GH_API = "https://api.github.com";
const ADMIN_STORAGE_KEY = "niefrar_admin_settings";
const ADMIN_TOKEN_KEY = "niefrar_admin_token_session";

const defaultRepoSettings = {
  owner: "AichaSidiya",
  repo: "niefrar-portal",
  branch: "main",
  excelPath: "data-source/Final Clean Dataset.xlsx",
  jsonPath: "public/data/ansab_database.json",
  imageFolder: "public/images/uploads",
};

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

const adminBenefits = [
  { title: "Excel هو المصدر الرئيسي", text: "المدير يرفع ملف Excel، والواجهة تحوله إلى JSON خفيف للعرض داخل التطبيق.", icon: FileSpreadsheet },
  { title: "تحرير مشابه للجداول", text: "يمكن تعديل الخلايا، إضافة صفوف، والبحث داخل البيانات قبل النشر.", icon: Table2 },
  { title: "رفع صور", text: "الصور تحفظ في GitHub داخل public/images، وتظهر في التطبيق بعد النشر.", icon: ImagePlus },
  { title: "نشر إلى GitHub", text: "زر النشر يحدث ملفات JSON و Excel والصور، ثم GitHub Actions يعيد نشر الموقع.", icon: GitBranch },
];

function classNames(...items) {
  return items.filter(Boolean).join(" ");
}

function clean(value) {
  return String(value ?? "").replace(/\u200f/g, "").trim();
}

function normalize(value) {
  return clean(value).toLowerCase();
}

function firstValue(row, keys) {
  for (const key of keys) {
    const value = clean(row?.[key]);
    if (value) return value;
  }
  return "";
}

function getPersonCode(row) {
  return firstValue(row, [
    "Code",
    "NewCode",
    "PersonCode",
    "PersonID",
    "ID",
  ]);
}

function getPersonName(row) {
  return firstValue(row, [
    "DisplayName",
    "Name",
    "PersonName",
    "FullName",
    "الاسم",
  ]);
}

function getFatherCode(row) {
  return firstValue(row, [
    "FatherCode",
    "NewFatherCode",
    "FatherID",
    "Father",
  ]);
}

function getMotherCode(row) {
  return firstValue(row, [
    "MotherCode",
    "NewMotherCode",
    "MotherID",
    "Mother",
  ]);
}

function getBranchName(row) {
  return firstValue(row, [
    "BranchName",
    "Branch",
    "MainBranch",
    "Family",
  ]);
}

function getPathText(row) {
  return firstValue(row, [
    "Path",
    "PersonPath",
    "Path_Names",
    "NamesPath",
  ]);
}

function buildAnsabIndex(database) {
  const people =
    database?.people ||
    database?.sheets?.Dataset ||
    database?.sheets?.["Tribe Members"] ||
    [];

  const media = database?.media || database?.sheets?.Media || [];

  const peopleByCode = {};
  const childrenByFatherCode = {};
  const childrenByMotherCode = {};
  const mediaByPersonCode = {};
  const searchIndex = [];

  people.forEach((person, rowIndex) => {
    const code = getPersonCode(person);
    if (!code) return;

    peopleByCode[code] = person;

    const fatherCode = getFatherCode(person);
    const motherCode = getMotherCode(person);

    if (fatherCode) {
      if (!childrenByFatherCode[fatherCode]) childrenByFatherCode[fatherCode] = [];
      childrenByFatherCode[fatherCode].push(person);
    }

    if (motherCode) {
      if (!childrenByMotherCode[motherCode]) childrenByMotherCode[motherCode] = [];
      childrenByMotherCode[motherCode].push(person);
    }

    const searchableText = [
      code,
      getPersonName(person),
      firstValue(person, ["Name"]),
      firstValue(person, ["DisplayName"]),
      firstValue(person, ["PersonType"]),
      getBranchName(person),
      getPathText(person),
      fatherCode,
      motherCode,
      firstValue(person, ["FatherName", "Father"]),
      firstValue(person, ["MotherName", "Mother"]),
    ]
      .join(" ")
      .toLowerCase();

    searchIndex.push({
      type: "person",
      code,
      title: getPersonName(person) || code,
      subtitle: getBranchName(person) || getPathText(person) || code,
      rowIndex,
      searchableText,
      person,
    });
  });

  media.forEach((item) => {
    const relatedCode = firstValue(item, [
      "RelatedCode",
      "RelatedPersonCode",
      "PersonCode",
      "Code",
    ]);

    if (!relatedCode) return;

    if (!mediaByPersonCode[relatedCode]) mediaByPersonCode[relatedCode] = [];
    mediaByPersonCode[relatedCode].push(item);
  });

  return {
    people,
    media,
    peopleByCode,
    childrenByFatherCode,
    childrenByMotherCode,
    mediaByPersonCode,
    searchIndex,
  };
}

function buildFatherPath(person, ansabIndex) {
  const path = [];
  const seen = new Set();

  let current = person;

  while (current) {
    const code = getPersonCode(current);
    if (!code || seen.has(code)) break;

    seen.add(code);
    path.push(current);

    const fatherCode = getFatherCode(current);
    if (!fatherCode) break;

    current = ansabIndex.peopleByCode[fatherCode];
  }

  return path;
}


function findPage(pageId) {
  if (pageId === "home") return { type: "home" };
  if (pageId === "admin") return { type: "admin" };
  if (pageId === "person") return { type: "person" };
  for (const section of sections) {
    if (section.id === pageId) return { type: "section", section };
    const child = section.children.find((item) => item.id === pageId);
    if (child) return { type: "child", section, child };
  }
  return { type: "utility", id: pageId };
}

function encodePath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function bytesToBase64(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function textToBase64(text) {
  return bytesToBase64(new TextEncoder().encode(text));
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function safeFileName(name) {
  return clean(name)
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._\-\u0600-\u06FF]/g, "")
    .replace(/-+/g, "-");
}

async function githubRequest({ token, settings, method = "GET", path, body }) {
  const res = await fetch(`${GH_API}${path}`, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const json = await res.json();
      message = json.message || message;
    } catch {
      // Keep default message.
    }
    throw new Error(message);
  }

  return res.json();
}

async function putGitHubFile({ token, settings, path, contentBase64, message }) {
  const encoded = encodePath(path);
  let sha;

  try {
    const existing = await githubRequest({
      token,
      settings,
      path: `/repos/${settings.owner}/${settings.repo}/contents/${encoded}?ref=${encodeURIComponent(settings.branch)}`,
    });
    sha = existing.sha;
  } catch (error) {
    if (!String(error.message).includes("Not Found")) throw error;
  }

  return githubRequest({
    token,
    settings,
    method: "PUT",
    path: `/repos/${settings.owner}/${settings.repo}/contents/${encoded}`,
    body: {
      message,
      content: contentBase64,
      branch: settings.branch,
      ...(sha ? { sha } : {}),
    },
  });
}

function loadSavedSettings() {
  try {
    return { ...defaultRepoSettings, ...JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) || "{}") };
  } catch {
    return defaultRepoSettings;
  }
}

export default function NiefrarPortalPrototype() {
  const [page, setPage] = useState("home");
  const [query, setQuery] = useState("");
  const [openSection, setOpenSection] = useState(null);
  const [database, setDatabase] = useState(null);
  const [dataStatus, setDataStatus] = useState("loading");
  const [selectedPersonCode, setSelectedPersonCode] = useState("");
  const ansabIndex = useMemo(() => buildAnsabIndex(database), [database]);

  useEffect(() => {
    let active = true;
    fetch(`${import.meta.env.BASE_URL}data/ansab_database.json`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!active) return;
        setDatabase(json);
        setDataStatus(json ? "ready" : "empty");
      })
      .catch(() => {
        if (!active) return;
        setDataStatus("empty");
      });
    return () => {
      active = false;
    };
  }, []);

  const current = findPage(page);

const searchResults = useMemo(() => {
  const q = normalize(query);
  if (!q) return [];

  const rows = [];

  // 1. Search main homepage sections and sub-pages
  sections.forEach((section) => {
    if (
      normalize(section.title).includes(q) ||
      normalize(section.subtitle).includes(q)
    ) {
      rows.push({
        id: section.id,
        type: "page",
        title: section.title,
        meta: "قسم رئيسي",
        accent: section.accent,
      });
    }

    section.children.forEach((child) => {
      if (
        normalize(child.title).includes(q) ||
        normalize(child.description).includes(q)
      ) {
        rows.push({
          id: child.id,
          type: "page",
          title: child.title,
          meta: section.title,
          accent: section.accent,
        });
      }
    });
  });

  // 2. Search people from Ansab dataset using the smart index
  ansabIndex.searchIndex
    .filter((item) => item.searchableText.includes(q))
    .slice(0, 20)
    .forEach((item) => {
      rows.push({
        id: "person",
        type: "person",
        code: item.code,
        title: item.title,
        meta: item.subtitle,
        accent: "#006b5b",
      });
    });

  return rows.slice(0, 25);
}, [query, ansabIndex]);

  const navigate = (target, options = {}) => {
  if (target === "person" && options.personCode) {
    setSelectedPersonCode(options.personCode);
  }
  
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
              database={database}
              dataStatus={dataStatus}
            />
          ) : current.type === "admin" ? (
            <AdminPage navigate={navigate} onDataPublished={() => setDataStatus("ready")} />
          ) : current.type === "person" ? (
            <PersonProfilePage
            code={selectedPersonCode}
            ansabIndex={ansabIndex}
            navigate={navigate}
          />
          ) : current.type === "section" ? (
            <SectionPage
              section={current.section}
              navigate={navigate}
              ansabIndex={ansabIndex}
            />
          ) : current.type === "child" ? (
              <ChildPage
              section={current.section}
              child={current.child}
              navigate={navigate}
              ansabIndex={ansabIndex}
            />
          ) : (
            <UtilityPage id={page} navigate={navigate} />
          )}
        </main>

        <BottomNav page={page} navigate={navigate} />
      </div>
    </div>
  );
}

function HomePage({ query, setQuery, searchResults, navigate, openSection, setOpenSection, database, dataStatus }) {
  const people = database?.people || database?.sheets?.Dataset || [];
  const media = database?.media || [];

  return (
    <div className="space-y-5">
      <Hero navigate={navigate} />

      <div className="grid grid-cols-3 gap-2">
        <StatusCard label="الأفراد" value={people.length || "—"} status={dataStatus} />
        <StatusCard label="الصور" value={media.length || "—"} status={dataStatus} />
        <button
          onClick={() => navigate("admin")}
          className="rounded-3xl bg-[#173a36] p-3 text-center text-white shadow-lg shadow-black/10"
        >
          <Settings className="mx-auto mb-1" size={22} />
          <span className="text-xs font-bold">إدارة</span>
        </button>
      </div>

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
            {searchResults.map((item, index) => (
              <button
                key={`${item.type}-${item.code || item.id}-${index}`}
                onClick={() =>
                  item.type === "person"
                    ? navigate("person", { personCode: item.code })
                    : navigate(item.id)
                }
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
          <Layers size={20} /> بنية Phase 2
        </h3>
        <div className="space-y-3">
          {adminBenefits.map((item) => (
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

function StatusCard({ label, value, status }) {
  return (
    <div className="rounded-3xl bg-white/80 p-3 text-center shadow-sm ring-1 ring-black/5">
      <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#f7f1e8] text-[#0a5d52]">
        {status === "loading" ? <Loader2 className="animate-spin" size={16} /> : <Database size={16} />}
      </div>
      <p className="text-lg font-black text-[#173a36]">{value}</p>
      <p className="text-[11px] font-bold text-[#8b8378]">{label}</p>
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
        <button onClick={() => navigate("admin")} className="h-8 rounded-full bg-white/95 px-4 text-xs font-black text-[#0a5d52]">Admin</button>
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

function SectionPage({ section, navigate, ansabIndex }) {
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

      {section.id === "ansab" && (
        <DataPreview
          ansabIndex={ansabIndex}
          accent={section.accent}
          mode="people"
          navigate={navigate}
        />
      )}
      <PrototypeNote accent={section.accent} />
    </div>
  );
}

function ChildPage({ section, child, navigate, ansabIndex }) {
  const Icon = child.icon;
  const showData = ["tree", "mothers"].includes(child.id);

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

      {showData ? (
        <DataPreview
          ansabIndex={ansabIndex}
          accent={section.accent}
          mode={child.id === "mothers" ? "mothers" : "people"}
          navigate={navigate}
        />
      ) : (
        <section className="rounded-[1.7rem] bg-white/85 p-4 shadow-lg shadow-[#a8865a]/10 ring-1 ring-black/5">
          <h2 className="mb-3 text-xl font-black text-[#173a36]">منطقة المحتوى التفاعلي</h2>
          <div className="space-y-3">
            <div className="rounded-3xl bg-[#fbf7f1] p-4">
              <p className="text-sm font-bold text-[#173a36]">هنا سنضيف لاحقًا محتوى الصفحة:</p>
              <p className="mt-2 text-sm leading-7 text-[#7d756b]">جداول، بحث، فلاتر، بطاقات، اختبارات، خرائط، أو روابط مصادر حسب نوع الصفحة.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="rounded-2xl bg-[#f7f1e8] px-4 py-3 text-sm font-bold text-[#173a36]">بحث داخل الصفحة</button>
              <button className="rounded-2xl px-4 py-3 text-sm font-bold text-white" style={{ backgroundColor: section.accent }}>إضافة للمفضلة</button>
            </div>
          </div>
        </section>
      )}

      <button
        onClick={() => navigate(section.id)}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#173a36] py-4 font-bold text-white shadow-lg"
      >
        <ArrowRight size={18} /> العودة إلى {section.title}
      </button>
    </div>
  );
}

function DataPreview({ ansabIndex, accent, mode, navigate }) {
  const [q, setQ] = useState("");
  const people = ansabIndex.people || [];
  const rows = useMemo(() => {
    const needle = normalize(q);
    return people
      .filter((person) => {
        if (mode === "mothers" && !clean(person.Mother)) return false;
        const haystack = [person.Name, person.DisplayName, person.Code, person.Father, person.Mother, person.Path].join(" ");
        return !needle || normalize(haystack).includes(needle);
      })
      .slice(0, 40);
  }, [people, q, mode]);

  if (!people.length) {
    return (
      <section className="rounded-[1.7rem] bg-white/85 p-5 shadow-lg shadow-[#a8865a]/10 ring-1 ring-black/5">
        <div className="flex items-center gap-3 text-[#7d756b]">
          <Database size={22} />
          <p className="text-sm leading-7">لم يتم نشر قاعدة بيانات JSON بعد. افتح صفحة الإدارة، ارفع ملف Excel، ثم انشر إلى GitHub.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[1.7rem] bg-white/85 p-4 shadow-lg shadow-[#a8865a]/10 ring-1 ring-black/5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-black" style={{ color: accent }}>{mode === "mothers" ? "سلسلة الأمهات" : "بيانات الأنساب"}</h2>
        <span className="rounded-full bg-[#f7f1e8] px-3 py-1 text-xs font-bold text-[#7d756b]">{people.length} صف</span>
      </div>
      <div className="mb-3 flex items-center gap-2 rounded-2xl bg-[#fbf7f1] px-3 py-2">
        <Search size={18} className="text-[#8b8378]" />
        <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="بحث في البيانات..." className="w-full bg-transparent text-sm outline-none" />
      </div>
      <div className="max-h-[390px] overflow-auto rounded-2xl border border-[#eee1cf]">
        <table className="w-full min-w-[680px] text-right text-xs">
          <thead className="sticky top-0 bg-[#f7f1e8] text-[#173a36]">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Name</th>
              <th className="p-3">Father</th>
              <th className="p-3">Mother</th>
              <th className="p-3">Branch</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((person, index) => (
              <tr
                key={`${getPersonCode(person)}-${index}`}
                onClick={() => navigate("person", { personCode: getPersonCode(person) })}
                className="cursor-pointer border-t border-[#eee1cf] bg-white/70 hover:bg-[#fbf7f1]"
              >
                <td className="p-3 font-mono text-[11px] text-[#7d756b]">{getPersonCode(person)}</td>
                <td className="p-3 font-bold text-[#173a36]">{getPersonName(person)}</td>
                <td className="p-3 text-[#7d756b]">{getFatherCode(person)}</td>
                <td className="p-3 text-[#7d756b]">{getMotherCode(person)}</td>
                <td className="p-3 text-[#7d756b]">{getBranchName(person)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PersonProfilePage({ code, ansabIndex, navigate }) {
  const person = ansabIndex.peopleByCode[code];

  if (!person) {
    return (
      <section className="rounded-[2rem] bg-white/85 p-6 text-center shadow-lg ring-1 ring-black/5">
        <Database className="mx-auto mb-3 text-[#0a5d52]" size={34} />
        <h1 className="text-2xl font-black text-[#173a36]">لم يتم العثور على الشخص</h1>
        <p className="mt-3 text-sm leading-7 text-[#7d756b]">
          الكود غير موجود في قاعدة البيانات الحالية.
        </p>
        <button
          onClick={() => navigate("ansab")}
          className="mt-5 rounded-full bg-[#0a5d52] px-6 py-3 text-sm font-bold text-white"
        >
          العودة إلى الأنساب
        </button>
      </section>
    );
  }

  const personCode = getPersonCode(person);
  const fatherCode = getFatherCode(person);
  const motherCode = getMotherCode(person);

  const father = ansabIndex.peopleByCode[fatherCode];
  const mother = ansabIndex.peopleByCode[motherCode];

  const fatherChildren = ansabIndex.childrenByFatherCode[personCode] || [];
  const motherChildren = ansabIndex.childrenByMotherCode[personCode] || [];
  const allChildren = [...fatherChildren, ...motherChildren].filter(
    (child, index, arr) =>
      arr.findIndex((x) => getPersonCode(x) === getPersonCode(child)) === index
  );

  const media = ansabIndex.mediaByPersonCode[personCode] || [];
  const fatherPath = buildFatherPath(person, ansabIndex);

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] bg-[#006b5b] p-6 text-white shadow-xl">
        <p className="text-sm text-white/70">Person Profile</p>
        <h1 className="mt-2 text-3xl font-black">
          {getPersonName(person) || personCode}
        </h1>
        <p className="mt-2 font-mono text-xs text-white/70" dir="ltr">
          {personCode}
        </p>

        <div className="mt-4 rounded-2xl bg-white/10 p-3 text-sm leading-7">
          <p>{firstValue(person, ["PersonType"]) || "لا يوجد وصف نوع الشخص بعد."}</p>
          <p className="mt-1 text-white/70">
            {getBranchName(person) || "لم يتم تحديد الفرع"}
          </p>
        </div>
      </section>

      <section className="rounded-[1.7rem] bg-white/85 p-4 shadow-lg ring-1 ring-black/5">
        <h2 className="mb-3 text-xl font-black text-[#006b5b]">الأب والأم</h2>

        <div className="grid grid-cols-1 gap-3">
          <RelativeButton
            label="الأب"
            person={father}
            fallbackCode={fatherCode}
            navigate={navigate}
          />
          <RelativeButton
            label="الأم"
            person={mother}
            fallbackCode={motherCode}
            navigate={navigate}
          />
        </div>
      </section>

      <section className="rounded-[1.7rem] bg-white/85 p-4 shadow-lg ring-1 ring-black/5">
        <h2 className="mb-3 text-xl font-black text-[#006b5b]">المسار صعودًا</h2>

        {fatherPath.length ? (
          <div className="space-y-2">
            {fatherPath.map((item, index) => (
              <button
                key={getPersonCode(item)}
                onClick={() =>
                  navigate("person", { personCode: getPersonCode(item) })
                }
                className="flex w-full items-center justify-between rounded-2xl bg-[#fbf7f1] px-4 py-3 text-right"
              >
                <span>
                  <span className="block font-bold text-[#173a36]">
                    {getPersonName(item)}
                  </span>
                  <span className="font-mono text-[11px] text-[#8b8378]" dir="ltr">
                    {getPersonCode(item)}
                  </span>
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#006b5b]">
                  {index === 0 ? "الحالي" : `↑ ${index}`}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#7d756b]">لا يوجد مسار أبوي محسوب.</p>
        )}
      </section>

      <section className="rounded-[1.7rem] bg-white/85 p-4 shadow-lg ring-1 ring-black/5">
        <h2 className="mb-3 text-xl font-black text-[#006b5b]">
          الأبناء ({allChildren.length})
        </h2>

        {allChildren.length ? (
          <div className="space-y-2">
            {allChildren.slice(0, 60).map((child) => (
              <button
                key={getPersonCode(child)}
                onClick={() =>
                  navigate("person", { personCode: getPersonCode(child) })
                }
                className="flex w-full items-center justify-between rounded-2xl bg-[#fbf7f1] px-4 py-3 text-right"
              >
                <span>
                  <span className="block font-bold text-[#173a36]">
                    {getPersonName(child)}
                  </span>
                  <span className="font-mono text-[11px] text-[#8b8378]" dir="ltr">
                    {getPersonCode(child)}
                  </span>
                </span>
                <ChevronLeft size={18} className="text-[#8b8378]" />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#7d756b]">لا يوجد أبناء مربوطون بهذا الكود.</p>
        )}
      </section>

      <section className="rounded-[1.7rem] bg-white/85 p-4 shadow-lg ring-1 ring-black/5">
        <h2 className="mb-3 text-xl font-black text-[#006b5b]">الصور والمرفقات</h2>

        {media.length ? (
          <div className="grid grid-cols-2 gap-3">
            {media.map((item, index) => (
              <div key={index} className="rounded-2xl bg-[#fbf7f1] p-2">
                <img
                  src={item.path || item.FileName || item.fileName}
                  alt={item.caption || "media"}
                  className="h-28 w-full rounded-xl object-cover"
                />
                <p className="mt-2 text-xs font-bold text-[#173a36]">
                  {item.caption || item.Caption || "صورة مرتبطة"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-7 text-[#7d756b]">
            لم يتم رفع صور لهذا الشخص بعد. لاحقًا اربط الصورة باستخدام نفس الكود:
            <span className="mx-1 font-mono" dir="ltr">{personCode}</span>
          </p>
        )}
      </section>

      <section className="rounded-[1.7rem] bg-white/85 p-4 shadow-lg ring-1 ring-black/5">
        <h2 className="mb-3 text-xl font-black text-[#006b5b]">بيانات خام للمراجعة</h2>

        <div className="max-h-[360px] overflow-auto rounded-2xl border border-[#eee1cf]">
          <table className="w-full text-xs">
            <tbody>
              {Object.entries(person).map(([key, value]) => (
                <tr key={key} className="border-b border-[#eee1cf]">
                  <td className="w-32 bg-[#f7f1e8] p-2 font-bold text-[#173a36]">
                    {key}
                  </td>
                  <td className="p-2 text-[#7d756b]">{String(value ?? "")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function RelativeButton({ label, person, fallbackCode, navigate }) {
  if (!person) {
    return (
      <div className="rounded-2xl bg-[#fbf7f1] px-4 py-3">
        <p className="text-xs font-bold text-[#8b8378]">{label}</p>
        <p className="mt-1 text-sm text-[#7d756b]">
          {fallbackCode || "غير محدد"}
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={() => navigate("person", { personCode: getPersonCode(person) })}
      className="flex w-full items-center justify-between rounded-2xl bg-[#fbf7f1] px-4 py-3 text-right"
    >
      <span>
        <span className="block text-xs font-bold text-[#8b8378]">{label}</span>
        <span className="block font-bold text-[#173a36]">
          {getPersonName(person)}
        </span>
        <span className="font-mono text-[11px] text-[#8b8378]" dir="ltr">
          {getPersonCode(person)}
        </span>
      </span>
      <ChevronLeft size={18} className="text-[#8b8378]" />
    </button>
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
        <p className="mt-3 leading-7 text-[#7d756b]">هذه صفحة مساعدة من شريط التنقل السفلي.</p>
      </section>
      {id === "account" && (
        <button onClick={() => navigate("admin")} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#173a36] py-4 font-bold text-white">
          <LockKeyhole size={18} /> فتح لوحة الإدارة
        </button>
      )}
      <button onClick={() => navigate("home")} className="w-full rounded-full bg-[#0a5d52] py-4 font-bold text-white">العودة للرئيسية</button>
    </div>
  );
}

function AdminPage({ navigate, onDataPublished }) {
  const [settings, setSettings] = useState(loadSavedSettings);
  const [token, setToken] = useState(() => sessionStorage.getItem(ADMIN_TOKEN_KEY) || "");
  const [connected, setConnected] = useState(false);
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState("excel");
  const [workbookSheets, setWorkbookSheets] = useState({});
  const [sheetNames, setSheetNames] = useState([]);
  const [activeSheet, setActiveSheet] = useState("Dataset");
  const [sourceFileName, setSourceFileName] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [newColumn, setNewColumn] = useState("");
  const [images, setImages] = useState([]);
  const [publishLog, setPublishLog] = useState([]);
  const [publishing, setPublishing] = useState(false);

  const activeRows = workbookSheets[activeSheet] || [];
  const headers = useMemo(() => {
    const keys = new Set();
    activeRows.slice(0, 300).forEach((row) => Object.keys(row || {}).forEach((key) => keys.add(key)));
    return Array.from(keys);
  }, [activeRows]);

  const filteredRows = useMemo(() => {
    const q = normalize(tableSearch);
    return activeRows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => !q || normalize(Object.values(row || {}).join(" ")).includes(q))
      .slice(0, 70);
  }, [activeRows, tableSearch]);

  const findings = useMemo(() => validateWorkbook(workbookSheets), [workbookSheets]);

  function saveSettings(nextSettings = settings) {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(nextSettings));
  }

  function updateSetting(key, value) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);
  }

  async function connectToGitHub() {
    setLoginBusy(true);
    setLoginError("");
    try {
      if (!token.trim()) throw new Error("Paste a GitHub fine-grained token first.");
      if (!settings.owner || !settings.repo) throw new Error("Owner and repository are required.");
      await githubRequest({
        token: token.trim(),
        settings,
        path: `/repos/${settings.owner}/${settings.repo}`,
      });
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token.trim());
      saveSettings();
      setConnected(true);
    } catch (error) {
      setConnected(false);
      setLoginError(error.message);
    } finally {
      setLoginBusy(false);
    }
  }

  function logout() {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken("");
    setConnected(false);
  }

  async function handleExcelUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const nextSheets = {};
    wb.SheetNames.forEach((name) => {
      const ws = wb.Sheets[name];
      nextSheets[name] = XLSX.utils.sheet_to_json(ws, { defval: "", raw: false });
    });
    setWorkbookSheets(nextSheets);
    setSheetNames(wb.SheetNames);
    setActiveSheet(wb.SheetNames.includes("Dataset") ? "Dataset" : wb.SheetNames[0]);
    setSourceFileName(file.name);
    setPublishLog([`Loaded ${file.name} with ${wb.SheetNames.length} sheet(s).`]);
  }

  function updateCell(rowIndex, key, value) {
    setWorkbookSheets((prev) => ({
      ...prev,
      [activeSheet]: (prev[activeSheet] || []).map((row, index) => (index === rowIndex ? { ...row, [key]: value } : row)),
    }));
  }

  function addRow() {
    const blank = {};
    headers.forEach((header) => {
      blank[header] = header === "Order" ? String(activeRows.length + 1) : "";
    });
    setWorkbookSheets((prev) => ({ ...prev, [activeSheet]: [...(prev[activeSheet] || []), blank] }));
  }

  function deleteRow(rowIndex) {
    setWorkbookSheets((prev) => ({
      ...prev,
      [activeSheet]: (prev[activeSheet] || []).filter((_, index) => index !== rowIndex),
    }));
  }

  function addColumn() {
    const column = clean(newColumn);
    if (!column) return;
    setWorkbookSheets((prev) => ({
      ...prev,
      [activeSheet]: (prev[activeSheet] || []).map((row) => ({ ...row, [column]: row[column] ?? "" })),
    }));
    setNewColumn("");
  }

  function handleImages(event) {
    const files = Array.from(event.target.files || []);
    const next = files.map((file) => ({
      id: `${Date.now()}-${file.name}-${Math.random()}`,
      file,
      name: safeFileName(file.name),
      preview: URL.createObjectURL(file),
      relatedCode: "",
      caption: "",
    }));
    setImages((prev) => [...prev, ...next]);
  }

  function updateImage(id, key, value) {
    setImages((prev) => prev.map((image) => (image.id === id ? { ...image, [key]: value } : image)));
  }

  function removeImage(id) {
    setImages((prev) => prev.filter((image) => image.id !== id));
  }

  function buildJsonPayload() {
    const people = workbookSheets.Dataset || workbookSheets[activeSheet] || [];
    const media = images.map((image) => ({
      fileName: image.name,
      path: `/images/uploads/${image.name}`,
      relatedCode: clean(image.relatedCode),
      caption: clean(image.caption),
      type: image.file?.type || "image",
    }));

    return {
      metadata: {
        app: "Niefrar Portal",
        generatedAt: new Date().toISOString(),
        sourceFileName,
        sheetNames,
        peopleCount: people.length,
        mediaCount: media.length,
      },
      people,
      media,
      sheets: workbookSheets,
    };
  }

  function buildExcelBase64() {
    const wb = XLSX.utils.book_new();
    const names = sheetNames.length ? sheetNames : Object.keys(workbookSheets);
    names.forEach((name) => {
      const ws = XLSX.utils.json_to_sheet(workbookSheets[name] || []);
      XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
    });
    const output = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    return bytesToBase64(output);
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(buildJsonPayload(), null, 2)], { type: "application/json" });
    downloadBlob(blob, "ansab_database.json");
  }

  function downloadExcel() {
    const wb = XLSX.utils.book_new();
    const names = sheetNames.length ? sheetNames : Object.keys(workbookSheets);
    names.forEach((name) => XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(workbookSheets[name] || []), name.slice(0, 31)));
    const output = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    downloadBlob(new Blob([output], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "Final Clean Dataset.xlsx");
  }

  async function publishToGitHub() {
    setPublishing(true);
    setPublishLog([]);
    try {
      if (!connected) throw new Error("Connect to GitHub first.");
      if (!Object.keys(workbookSheets).length) throw new Error("Upload an Excel file first.");

      const jsonText = JSON.stringify(buildJsonPayload(), null, 2);
      setPublishLog((prev) => [...prev, "Creating JSON database..."]);
      await putGitHubFile({
        token,
        settings,
        path: settings.jsonPath,
        contentBase64: textToBase64(jsonText),
        message: "Update Niefrar JSON database from admin console",
      });
      setPublishLog((prev) => [...prev, `Saved ${settings.jsonPath}`]);

      setPublishLog((prev) => [...prev, "Creating updated Excel workbook..."]);
      await putGitHubFile({
        token,
        settings,
        path: settings.excelPath,
        contentBase64: buildExcelBase64(),
        message: "Update source Excel database from admin console",
      });
      setPublishLog((prev) => [...prev, `Saved ${settings.excelPath}`]);

      for (const image of images) {
        const imagePath = `${settings.imageFolder.replace(/\/$/, "")}/${image.name}`;
        setPublishLog((prev) => [...prev, `Uploading ${image.name}...`]);
        await putGitHubFile({
          token,
          settings,
          path: imagePath,
          contentBase64: await fileToBase64(image.file),
          message: `Upload image ${image.name} from admin console`,
        });
      }

      setPublishLog((prev) => [...prev, "Done. GitHub Actions will redeploy the public app."]);
      onDataPublished?.();
    } catch (error) {
      setPublishLog((prev) => [...prev, `Error: ${error.message}`]);
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[2rem] bg-[#173a36] p-6 text-white shadow-xl shadow-black/15">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/12">
              <LockKeyhole size={28} />
            </div>
            <div>
              <p className="text-sm text-white/60">Phase 2</p>
              <h1 className="text-3xl font-black">لوحة الإدارة</h1>
            </div>
          </div>
          <button onClick={() => navigate("home")} className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold">الرئيسية</button>
        </div>
        <p className="mt-5 text-sm leading-7 text-white/75">تسجيل دخول GitHub، رفع Excel، تحرير شبيه بالجداول، رفع صور، ثم نشر التحديثات إلى التطبيق.</p>
      </section>

      {!connected ? (
        <AdminLogin
          settings={settings}
          updateSetting={updateSetting}
          token={token}
          setToken={setToken}
          busy={loginBusy}
          error={loginError}
          connect={connectToGitHub}
        />
      ) : (
        <>
          <div className="rounded-[1.7rem] bg-white/85 p-3 shadow-lg ring-1 ring-black/5">
            <div className="mb-3 flex items-center justify-between rounded-2xl bg-[#f7f1e8] px-4 py-3">
              <div>
                <p className="text-xs font-bold text-[#7d756b]">Connected repo</p>
                <p className="font-black text-[#173a36]" dir="ltr">{settings.owner}/{settings.repo}</p>
              </div>
              <button onClick={logout} className="flex items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-bold text-[#8a3a24]">
                <LogOut size={14} /> خروج
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs font-bold">
              <TabButton active={tab === "excel"} onClick={() => setTab("excel")} icon={FileSpreadsheet} label="Excel" />
              <TabButton active={tab === "images"} onClick={() => setTab("images")} icon={ImagePlus} label="صور" />
              <TabButton active={tab === "publish"} onClick={() => setTab("publish")} icon={Save} label="نشر" />
              <TabButton active={tab === "settings"} onClick={() => setTab("settings")} icon={Settings} label="إعدادات" />
            </div>
          </div>

          {tab === "excel" && (
            <AdminExcelTab
              activeSheet={activeSheet}
              setActiveSheet={setActiveSheet}
              sheetNames={sheetNames}
              activeRows={activeRows}
              headers={headers}
              filteredRows={filteredRows}
              tableSearch={tableSearch}
              setTableSearch={setTableSearch}
              handleExcelUpload={handleExcelUpload}
              updateCell={updateCell}
              addRow={addRow}
              deleteRow={deleteRow}
              newColumn={newColumn}
              setNewColumn={setNewColumn}
              addColumn={addColumn}
              sourceFileName={sourceFileName}
              findings={findings}
            />
          )}

          {tab === "images" && (
            <AdminImagesTab
              images={images}
              handleImages={handleImages}
              updateImage={updateImage}
              removeImage={removeImage}
              imageFolder={settings.imageFolder}
            />
          )}

          {tab === "publish" && (
            <AdminPublishTab
              findings={findings}
              publishing={publishing}
              publishToGitHub={publishToGitHub}
              publishLog={publishLog}
              downloadJson={downloadJson}
              downloadExcel={downloadExcel}
              hasWorkbook={Object.keys(workbookSheets).length > 0}
              imagesCount={images.length}
              settings={settings}
            />
          )}

          {tab === "settings" && <AdminSettingsTab settings={settings} updateSetting={updateSetting} />}
        </>
      )}
    </div>
  );
}

function AdminLogin({ settings, updateSetting, token, setToken, busy, error, connect }) {
  return (
    <section className="rounded-[1.8rem] bg-white/85 p-5 shadow-lg ring-1 ring-black/5">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f1e8] text-[#0a5d52]">
          <GitBranch size={25} />
        </div>
        <div>
          <h2 className="text-xl font-black text-[#173a36]">تسجيل دخول الإدارة</h2>
          <p className="text-xs leading-5 text-[#7d756b]">استخدم GitHub fine-grained token. لا تحفظ الرمز داخل الكود.</p>
        </div>
      </div>

      <div className="space-y-3">
        <Input label="GitHub owner" value={settings.owner} onChange={(value) => updateSetting("owner", value)} dir="ltr" />
        <Input label="Repository" value={settings.repo} onChange={(value) => updateSetting("repo", value)} dir="ltr" />
        <Input label="Branch" value={settings.branch} onChange={(value) => updateSetting("branch", value)} dir="ltr" />
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-[#7d756b]">GitHub token</span>
          <div className="flex items-center gap-2 rounded-2xl bg-[#fbf7f1] px-3 py-2 ring-1 ring-black/5">
            <KeyRound size={17} className="text-[#8b8378]" />
            <input
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="github_pat_..."
              className="w-full bg-transparent text-left text-sm outline-none"
              dir="ltr"
            />
          </div>
        </label>
        {error && <p className="rounded-2xl bg-[#fff0ed] px-3 py-2 text-xs font-bold text-[#a33b25]">{error}</p>}
        <button
          onClick={connect}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#173a36] py-4 font-black text-white disabled:opacity-60"
        >
          {busy ? <Loader2 className="animate-spin" size={18} /> : <LockKeyhole size={18} />}
          Connect to GitHub
        </button>
      </div>
    </section>
  );
}

function Input({ label, value, onChange, dir = "rtl" }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-[#7d756b]">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl bg-[#fbf7f1] px-4 py-3 text-sm outline-none ring-1 ring-black/5" dir={dir} />
    </label>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} className={classNames("flex flex-col items-center gap-1 rounded-2xl px-2 py-3", active ? "bg-[#173a36] text-white" : "bg-[#fbf7f1] text-[#7d756b]")}> 
      <Icon size={18} />
      {label}
    </button>
  );
}

function AdminExcelTab(props) {
  const {
    activeSheet,
    setActiveSheet,
    sheetNames,
    activeRows,
    headers,
    filteredRows,
    tableSearch,
    setTableSearch,
    handleExcelUpload,
    updateCell,
    addRow,
    deleteRow,
    newColumn,
    setNewColumn,
    addColumn,
    sourceFileName,
    findings,
  } = props;

  return (
    <section className="rounded-[1.8rem] bg-white/85 p-4 shadow-lg ring-1 ring-black/5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-[#173a36]">Excel database</h2>
          <p className="text-xs text-[#7d756b]">{sourceFileName || "Upload your workbook to start"}</p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-full bg-[#173a36] px-4 py-3 text-xs font-black text-white">
          <Upload size={16} /> رفع Excel
          <input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} className="hidden" />
        </label>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <MiniMetric label="Sheets" value={sheetNames.length || "—"} />
        <MiniMetric label="Rows" value={activeRows.length || "—"} />
        <MiniMetric label="Issues" value={findings.length} warning={findings.length > 0} />
      </div>

      {!!sheetNames.length && (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {sheetNames.map((name) => (
            <button key={name} onClick={() => setActiveSheet(name)} className={classNames("shrink-0 rounded-full px-4 py-2 text-xs font-bold", activeSheet === name ? "bg-[#0a5d52] text-white" : "bg-[#f7f1e8] text-[#7d756b]")}>{name}</button>
          ))}
        </div>
      )}

      <div className="mb-3 flex items-center gap-2 rounded-2xl bg-[#fbf7f1] px-3 py-2">
        <Search size={18} className="text-[#8b8378]" />
        <input value={tableSearch} onChange={(event) => setTableSearch(event.target.value)} placeholder="Search rows..." className="w-full bg-transparent text-sm outline-none" />
      </div>

      <div className="mb-3 grid grid-cols-[1fr_auto] gap-2">
        <input value={newColumn} onChange={(event) => setNewColumn(event.target.value)} placeholder="New column name" className="rounded-2xl bg-[#fbf7f1] px-3 py-2 text-sm outline-none ring-1 ring-black/5" />
        <button onClick={addColumn} className="rounded-2xl bg-[#f7f1e8] px-4 py-2 text-sm font-bold text-[#173a36]">Add</button>
      </div>

      <div className="mb-3 flex gap-2">
        <button onClick={addRow} disabled={!headers.length} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0a5d52] py-3 text-sm font-bold text-white disabled:opacity-40"><Plus size={16} /> صف جديد</button>
        <div className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#f7f1e8] py-3 text-xs font-bold text-[#7d756b]"><Eye size={16} /> Showing {filteredRows.length}</div>
      </div>

      {findings.length > 0 && (
        <div className="mb-3 rounded-2xl bg-[#fff8e7] p-3 text-xs leading-6 text-[#8a5b12]">
          <p className="mb-1 flex items-center gap-1 font-black"><AlertTriangle size={15} /> Data observations</p>
          {findings.slice(0, 4).map((item, index) => <p key={index}>• {item}</p>)}
        </div>
      )}

      <div className="max-h-[520px] overflow-auto rounded-2xl border border-[#eee1cf] bg-white">
        {headers.length ? (
          <table className="w-full min-w-[1100px] text-xs">
            <thead className="sticky top-0 bg-[#f7f1e8] text-[#173a36]">
              <tr>
                <th className="p-2 text-center">#</th>
                {headers.map((header) => <th key={header} className="p-2 text-right">{header}</th>)}
                <th className="p-2 text-center">Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map(({ row, index }) => (
                <tr key={index} className="border-t border-[#eee1cf]">
                  <td className="bg-[#fbf7f1] p-2 text-center font-mono text-[#7d756b]">{index + 1}</td>
                  {headers.map((header) => (
                    <td key={header} className="min-w-[140px] p-1 align-top">
                      <textarea
                        value={row[header] ?? ""}
                        onChange={(event) => updateCell(index, header, event.target.value)}
                        className="min-h-[42px] w-full resize-y rounded-xl bg-[#fbf7f1] p-2 outline-none focus:bg-white focus:ring-2 focus:ring-[#0a5d52]/30"
                      />
                    </td>
                  ))}
                  <td className="p-2 text-center">
                    <button onClick={() => deleteRow(index)} className="rounded-full bg-[#fff0ed] p-2 text-[#a33b25]"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-sm text-[#7d756b]">No Excel file loaded yet.</div>
        )}
      </div>
    </section>
  );
}

function MiniMetric({ label, value, warning }) {
  return (
    <div className={classNames("rounded-2xl p-3 text-center ring-1 ring-black/5", warning ? "bg-[#fff8e7]" : "bg-[#fbf7f1]")}> 
      <p className={classNames("text-lg font-black", warning ? "text-[#9a5c08]" : "text-[#173a36]")}>{value}</p>
      <p className="text-[11px] font-bold text-[#7d756b]">{label}</p>
    </div>
  );
}

function AdminImagesTab({ images, handleImages, updateImage, removeImage, imageFolder }) {
  return (
    <section className="rounded-[1.8rem] bg-white/85 p-4 shadow-lg ring-1 ring-black/5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-[#173a36]">Image upload</h2>
          <p className="text-xs text-[#7d756b]" dir="ltr">{imageFolder}</p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-full bg-[#173a36] px-4 py-3 text-xs font-black text-white">
          <ImagePlus size={16} /> رفع صور
          <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
        </label>
      </div>

      {!images.length ? (
        <div className="rounded-3xl bg-[#fbf7f1] p-6 text-center text-sm leading-7 text-[#7d756b]">ارفع الصور هنا. يمكن ربط كل صورة بكود شخص أو مدفن أو مصدر.</div>
      ) : (
        <div className="space-y-3">
          {images.map((image) => (
            <div key={image.id} className="rounded-3xl bg-[#fbf7f1] p-3 ring-1 ring-black/5">
              <div className="flex gap-3">
                <img src={image.preview} alt="Preview" className="h-20 w-20 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <input value={image.name} onChange={(event) => updateImage(image.id, "name", safeFileName(event.target.value))} className="w-full rounded-xl bg-white px-3 py-2 text-xs font-bold outline-none" dir="ltr" />
                    <button onClick={() => removeImage(image.id)} className="rounded-full bg-white p-2 text-[#a33b25]"><X size={16} /></button>
                  </div>
                  <input value={image.relatedCode} onChange={(event) => updateImage(image.id, "relatedCode", event.target.value)} placeholder="Related code, e.g. AE-02..." className="mb-2 w-full rounded-xl bg-white px-3 py-2 text-xs outline-none" dir="ltr" />
                  <input value={image.caption} onChange={(event) => updateImage(image.id, "caption", event.target.value)} placeholder="Caption / وصف الصورة" className="w-full rounded-xl bg-white px-3 py-2 text-xs outline-none" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function AdminPublishTab({ findings, publishing, publishToGitHub, publishLog, downloadJson, downloadExcel, hasWorkbook, imagesCount, settings }) {
  return (
    <section className="rounded-[1.8rem] bg-white/85 p-4 shadow-lg ring-1 ring-black/5">
      <h2 className="mb-2 text-xl font-black text-[#173a36]">Publish to GitHub</h2>
      <p className="mb-4 text-sm leading-7 text-[#7d756b]">This will update the JSON database, source Excel file, and uploaded images in your repository. GitHub Actions will redeploy the app after the commit.</p>

      <div className="mb-4 space-y-2 rounded-3xl bg-[#fbf7f1] p-4 text-xs leading-6 text-[#7d756b]">
        <p dir="ltr"><b>JSON:</b> {settings.jsonPath}</p>
        <p dir="ltr"><b>Excel:</b> {settings.excelPath}</p>
        <p dir="ltr"><b>Images:</b> {settings.imageFolder} ({imagesCount})</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <button onClick={downloadJson} disabled={!hasWorkbook} className="flex items-center justify-center gap-2 rounded-2xl bg-[#f7f1e8] py-3 text-sm font-bold text-[#173a36] disabled:opacity-40"><Download size={16} /> JSON</button>
        <button onClick={downloadExcel} disabled={!hasWorkbook} className="flex items-center justify-center gap-2 rounded-2xl bg-[#f7f1e8] py-3 text-sm font-bold text-[#173a36] disabled:opacity-40"><Download size={16} /> Excel</button>
      </div>

      {findings.length > 0 ? (
        <div className="mb-4 rounded-2xl bg-[#fff8e7] p-3 text-xs leading-6 text-[#8a5b12]">
          <p className="font-black">Review before publishing:</p>
          {findings.slice(0, 6).map((item, index) => <p key={index}>• {item}</p>)}
        </div>
      ) : (
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-[#effaf4] p-3 text-xs font-bold text-[#0a6948]"><CheckCircle2 size={16} /> No major validation issues detected.</div>
      )}

      <button onClick={publishToGitHub} disabled={publishing || !hasWorkbook} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#173a36] py-4 font-black text-white disabled:opacity-50">
        {publishing ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
        Publish updates
      </button>

      {!!publishLog.length && (
        <div className="mt-4 rounded-2xl bg-[#111f1d] p-4 text-left text-xs leading-6 text-[#dce9e5]" dir="ltr">
          {publishLog.map((line, index) => <p key={index}>{line}</p>)}
        </div>
      )}
    </section>
  );
}

function AdminSettingsTab({ settings, updateSetting }) {
  return (
    <section className="rounded-[1.8rem] bg-white/85 p-4 shadow-lg ring-1 ring-black/5">
      <h2 className="mb-4 text-xl font-black text-[#173a36]">Repository settings</h2>
      <div className="space-y-3">
        <Input label="GitHub owner" value={settings.owner} onChange={(value) => updateSetting("owner", value)} dir="ltr" />
        <Input label="Repository" value={settings.repo} onChange={(value) => updateSetting("repo", value)} dir="ltr" />
        <Input label="Branch" value={settings.branch} onChange={(value) => updateSetting("branch", value)} dir="ltr" />
        <Input label="Excel source path" value={settings.excelPath} onChange={(value) => updateSetting("excelPath", value)} dir="ltr" />
        <Input label="JSON public path" value={settings.jsonPath} onChange={(value) => updateSetting("jsonPath", value)} dir="ltr" />
        <Input label="Images folder" value={settings.imageFolder} onChange={(value) => updateSetting("imageFolder", value)} dir="ltr" />
      </div>
    </section>
  );
}

function validateWorkbook(workbookSheets) {
  const rows = workbookSheets.Dataset || [];
  if (!rows.length) return [];

  const findings = [];
  const codes = new Map();
  let missingCode = 0;
  let missingName = 0;
  let missingPath = 0;

  rows.forEach((row, index) => {
    const code = clean(row.Code);
    if (!code) missingCode += 1;
    if (!clean(row.Name) && !clean(row.DisplayName)) missingName += 1;
    if (!clean(row.Path)) missingPath += 1;
    if (code) codes.set(code, [...(codes.get(code) || []), index + 2]);
  });

  const duplicates = Array.from(codes.entries()).filter(([, positions]) => positions.length > 1);
  if (missingCode) findings.push(`${missingCode} rows have empty Code.`);
  if (missingName) findings.push(`${missingName} rows have empty Name/DisplayName.`);
  if (missingPath) findings.push(`${missingPath} rows have empty Path.`);
  if (duplicates.length) findings.push(`${duplicates.length} duplicate Code values detected.`);
  return findings;
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function PrototypeNote({ accent }) {
  return (
    <div className="rounded-[1.6rem] bg-white/75 p-4 shadow-sm ring-1 ring-black/5">
      <h3 className="font-black" style={{ color: accent }}>ملاحظة تصميمية</h3>
      <p className="mt-2 text-sm leading-7 text-[#7d756b]">هذه الصفحة جاهزة كهيكل أولي. كل بطاقة رئيسية وكل بطاقة فرعية لها صفحة مستقلة، ويمكن ربط كل صفحة ببيانات JSON المنشورة من لوحة الإدارة.</p>
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
