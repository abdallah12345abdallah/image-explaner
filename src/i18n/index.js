// Lightweight, dependency-free i18n for the app (ar / en / uk).
// - reactive `locale`; `t(key)` re-renders templates when the locale changes
// - `dir` is rtl for Arabic, ltr otherwise (drives layout direction)
// - locale is persisted via Capacitor Preferences and applied to <html>
import { reactive, computed } from "vue";
import { Preferences } from "@capacitor/preferences";

const KEY = "wuduh.lang";

export const LANGUAGES = [
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "en", label: "English", dir: "ltr" },
  { code: "uk", label: "Українська", dir: "ltr" },
];

const messages = {
  ar: {
    brand: "وضوح",
    common: { back: "رجوع", save: "حفظ", delete: "حذف", edit: "تعديل" },
    home: {
      welcome: "أهلاً بك",
      weExplain: "نشرح لك",
      whatToDo: "ماذا تريد أن تفعل؟",
      scanTitle: "تحليل صورة",
      scanDesc: "صوّر مستندًا واحصل على شرحه",
      apptTitle: "المواعيد",
      apptDesc: "تذكيرات مواعيدك",
      historyTitle: "السجل",
      historyDesc: "تحاليلك السابقة",
      settingsTitle: "الإعدادات",
      settingsDesc: "التذكيرات والإشعارات",
      rot: ["المواعيد", "الفواتير", "العقود", "الرسائل الرسمية", "أي مستند"],
    },
    scan: {
      title: "تحليل صورة",
      startNow: "ابدأ الآن ✨",
      intro: "التقط صورة المستند وسنشرحها لك في ثوانٍ.",
      takePhoto: "التقاط صورة",
      gallery: "المعرض",
      explain: "اشرح الصورة",
      analyzing: "جارٍ التحليل...",
      loadingAnalyze: "جارٍ تحليل الصورة...",
      errImage: "تعذّر الوصول إلى الصورة.",
      errGeneric: "حدث خطأ أثناء تحليل الصورة. حاول مرة أخرى.",
      another: "صورة أخرى",
      reviewHint: "راجع الصورة ثم اضغط لتحليلها",
    },
    appts: {
      title: "المواعيد والتذكيرات",
      add: "إضافة موعد",
      upcoming: "القادمة",
      past: "السابقة",
      empty: "لا مواعيد محفوظة بعد.",
      detailTitle: "تفاصيل الموعد",
      reminderBefore: "تذكير قبل",
      deleted: "تم حذف الموعد.",
      saved: "تم حفظ الموعد وضبط التذكير ✅",
      savedNoPerm: "تم حفظ الموعد. فعّل إذن الإشعارات ليصلك التذكير.",
    },
    history: { title: "سجل المستندات", empty: "لا مستندات في السجل بعد.", document: "مستند" },
    settings: {
      title: "الإعدادات",
      reminders: "التذكيرات",
      defaultLeadLabel: "وقت التذكير الافتراضي قبل الموعد",
      notifPerm: "إذن الإشعارات",
      enable: "تفعيل",
      permWeb: "الإشعارات تعمل على التطبيق المثبّت فقط",
      permOn: "مفعّلة",
      permOff: "غير مفعّلة — اضغط للسماح بها",
      permBlocked: "محظورة — فعّلها من إعدادات الهاتف",
      permBlockedToast: "الإشعارات محظورة. افتح إعدادات الهاتف ← التطبيق ← الإشعارات وفعّلها.",
      language: "اللغة",
      about: "عن التطبيق",
      aboutDesc: "يشرح مستنداتك ويذكّرك بمواعيدك.",
    },
    result: {
      noResult: "لا توجد نتيجة بعد.",
      backHome: "العودة للرئيسية",
      appointment: "موعد",
      summary: "الملخص",
      date: "التاريخ",
      time: "الوقت",
      place: "المكان",
      actionRequired: "المطلوب منك",
      tapMap: "اضغط لعرضه على الخريطة",
      saveAppt: "حفظ الموعد وتذكيري",
      addAsAppt: "إضافة كموعد",
      analyzeAnother: "تحليل صورة أخرى",
    },
    modal: {
      saveTitle: "حفظ موعد",
      editTitle: "تعديل الموعد",
      titleLabel: "العنوان",
      titlePlaceholder: "مثال: موعد المستشفى",
      datetime: "التاريخ والوقت",
      locationLabel: "المكان (اختياري)",
      locationPlaceholder: "مثال: مبنى ب",
      remindBefore: "ذكّرني قبل الموعد بـ",
      save: "حفظ",
      defaultTitle: "موعد",
    },
    leads: { m10: "١٠ دقائق", m30: "٣٠ دقيقة", h1: "ساعة", d1: "يوم" },
    langNames: { ar: "العربية", en: "الإنجليزية", uk: "الأوكرانية" },
    notif: { title: "تذكير بموعد" },
    auth: {
      loginTitle: "تسجيل الدخول",
      loginSubtitle: "أهلاً بعودتك",
      signupTitle: "إنشاء حساب",
      signupSubtitle: "أنشئ حسابك للبدء",
      forgotTitle: "نسيت كلمة المرور",
      forgotSubtitle: "أدخل بريدك وسنرسل لك رابط إعادة التعيين",
      name: "الاسم",
      nationality: "الجنسية",
      phone: "رقم الجوال",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      loginBtn: "دخول",
      signupBtn: "إنشاء الحساب",
      sendReset: "إرسال رابط الإعادة",
      loading: "جارٍ...",
      forgotLink: "نسيت كلمة المرور؟",
      noAccount: "ليس لديك حساب؟",
      haveAccount: "لديك حساب بالفعل؟",
      goSignup: "أنشئ حساب",
      goLogin: "تسجيل الدخول",
      backToLogin: "العودة لتسجيل الدخول",
      logout: "تسجيل الخروج",
      account: "الحساب",
      acceptPre: "أوافق على",
      privacyPolicy: "سياسة الخصوصية",
      errRequired: "يرجى تعبئة جميع الحقول المطلوبة.",
      errEmail: "أدخل بريدًا إلكترونيًا صحيحًا.",
      errPassword: "كلمة المرور يجب أن تكون 6 أحرف على الأقل.",
      errPrivacy: "يجب الموافقة على سياسة الخصوصية للمتابعة.",
      errCredentials: "البريد أو كلمة المرور غير صحيحة.",
      errGeneric: "حدث خطأ، حاول مرة أخرى.",
      signupDone: "تم إنشاء الحساب! تحقق من بريدك لتأكيد الحساب ثم سجّل الدخول.",
      resetSent: "إذا كان البريد مسجّلًا، فستصلك رسالة لإعادة تعيين كلمة المرور.",
      or: "أو",
      socialFailed: "تعذّر تسجيل الدخول عبر هذه الخدمة.",
    },
  },

  en: {
    brand: "Wuduh",
    common: { back: "Back", save: "Save", delete: "Delete", edit: "Edit" },
    home: {
      welcome: "Welcome",
      weExplain: "We explain",
      whatToDo: "What would you like to do?",
      scanTitle: "Analyze image",
      scanDesc: "Snap a document and get it explained",
      apptTitle: "Appointments",
      apptDesc: "Your appointment reminders",
      historyTitle: "History",
      historyDesc: "Your past analyses",
      settingsTitle: "Settings",
      settingsDesc: "Reminders and notifications",
      rot: ["appointments", "bills", "contracts", "official letters", "any document"],
    },
    scan: {
      title: "Analyze image",
      startNow: "Get started ✨",
      intro: "Take a photo of the document and we'll explain it in seconds.",
      takePhoto: "Take photo",
      gallery: "Gallery",
      explain: "Explain image",
      analyzing: "Analyzing...",
      loadingAnalyze: "Analyzing image...",
      errImage: "Couldn't access the image.",
      errGeneric: "Something went wrong analyzing the image. Try again.",
      another: "Another image",
      reviewHint: "Review the image, then tap to analyze it",
    },
    appts: {
      title: "Appointments & reminders",
      add: "Add appointment",
      upcoming: "Upcoming",
      past: "Past",
      empty: "No saved appointments yet.",
      detailTitle: "Appointment details",
      reminderBefore: "Reminder",
      deleted: "Appointment deleted.",
      saved: "Appointment saved and reminder set ✅",
      savedNoPerm: "Appointment saved. Enable notifications to get the reminder.",
    },
    history: { title: "Document history", empty: "No documents in history yet.", document: "Document" },
    settings: {
      title: "Settings",
      reminders: "Reminders",
      defaultLeadLabel: "Default reminder time before appointment",
      notifPerm: "Notification permission",
      enable: "Enable",
      permWeb: "Notifications work only in the installed app",
      permOn: "Enabled",
      permOff: "Disabled — tap to allow",
      permBlocked: "Blocked — enable it in your phone settings",
      permBlockedToast: "Notifications are blocked. Open phone Settings → App → Notifications and turn them on.",
      language: "Language",
      about: "About",
      aboutDesc: "Explains your documents and reminds you of appointments.",
    },
    result: {
      noResult: "No result yet.",
      backHome: "Back to home",
      appointment: "Appointment",
      summary: "Summary",
      date: "Date",
      time: "Time",
      place: "Place",
      actionRequired: "What you need to do",
      tapMap: "Tap to view on map",
      saveAppt: "Save appointment & remind me",
      addAsAppt: "Add as appointment",
      analyzeAnother: "Analyze another image",
    },
    modal: {
      saveTitle: "Save appointment",
      editTitle: "Edit appointment",
      titleLabel: "Title",
      titlePlaceholder: "e.g. Hospital appointment",
      datetime: "Date & time",
      locationLabel: "Location (optional)",
      locationPlaceholder: "e.g. Building B",
      remindBefore: "Remind me before",
      save: "Save",
      defaultTitle: "Appointment",
    },
    leads: { m10: "10 minutes", m30: "30 minutes", h1: "1 hour", d1: "1 day" },
    langNames: { ar: "Arabic", en: "English", uk: "Ukrainian" },
    notif: { title: "Appointment reminder" },
    auth: {
      loginTitle: "Log in",
      loginSubtitle: "Welcome back",
      signupTitle: "Create account",
      signupSubtitle: "Sign up to get started",
      forgotTitle: "Forgot password",
      forgotSubtitle: "Enter your email and we'll send a reset link",
      name: "Name",
      nationality: "Nationality",
      phone: "Phone number",
      email: "Email",
      password: "Password",
      loginBtn: "Log in",
      signupBtn: "Create account",
      sendReset: "Send reset link",
      loading: "Loading...",
      forgotLink: "Forgot your password?",
      noAccount: "Don't have an account?",
      haveAccount: "Already have an account?",
      goSignup: "Sign up",
      goLogin: "Log in",
      backToLogin: "Back to log in",
      logout: "Log out",
      account: "Account",
      acceptPre: "I agree to the",
      privacyPolicy: "Privacy Policy",
      errRequired: "Please fill in all required fields.",
      errEmail: "Enter a valid email address.",
      errPassword: "Password must be at least 6 characters.",
      errPrivacy: "You must accept the Privacy Policy to continue.",
      errCredentials: "Incorrect email or password.",
      errGeneric: "Something went wrong, please try again.",
      signupDone: "Account created! Check your email to confirm, then log in.",
      resetSent: "If that email is registered, a reset link is on its way.",
      or: "or",
      socialFailed: "Couldn't sign in with that provider.",
    },
  },

  uk: {
    brand: "Wuduh",
    common: { back: "Назад", save: "Зберегти", delete: "Видалити", edit: "Редагувати" },
    home: {
      welcome: "Ласкаво просимо",
      weExplain: "Ми пояснюємо",
      whatToDo: "Що бажаєте зробити?",
      scanTitle: "Аналіз зображення",
      scanDesc: "Сфотографуйте документ і отримайте пояснення",
      apptTitle: "Записи",
      apptDesc: "Нагадування про записи",
      historyTitle: "Історія",
      historyDesc: "Ваші минулі аналізи",
      settingsTitle: "Налаштування",
      settingsDesc: "Нагадування та сповіщення",
      rot: ["записи", "рахунки", "договори", "офіційні листи", "будь-який документ"],
    },
    scan: {
      title: "Аналіз зображення",
      startNow: "Почнімо ✨",
      intro: "Сфотографуйте документ, і ми пояснимо його за секунди.",
      takePhoto: "Зробити фото",
      gallery: "Галерея",
      explain: "Пояснити зображення",
      analyzing: "Аналізуємо...",
      loadingAnalyze: "Аналізуємо зображення...",
      errImage: "Не вдалося отримати зображення.",
      errGeneric: "Сталася помилка під час аналізу. Спробуйте ще раз.",
      another: "Інше зображення",
      reviewHint: "Перегляньте зображення та натисніть, щоб проаналізувати",
    },
    appts: {
      title: "Записи та нагадування",
      add: "Додати запис",
      upcoming: "Майбутні",
      past: "Минулі",
      empty: "Ще немає збережених записів.",
      detailTitle: "Деталі запису",
      reminderBefore: "Нагадування за",
      deleted: "Запис видалено.",
      saved: "Запис збережено, нагадування встановлено ✅",
      savedNoPerm: "Запис збережено. Увімкніть сповіщення, щоб отримати нагадування.",
    },
    history: { title: "Історія документів", empty: "Поки що немає документів в історії.", document: "Документ" },
    settings: {
      title: "Налаштування",
      reminders: "Нагадування",
      defaultLeadLabel: "Час нагадування за замовчуванням",
      notifPerm: "Дозвіл на сповіщення",
      enable: "Увімкнути",
      permWeb: "Сповіщення працюють лише у встановленому застосунку",
      permOn: "Увімкнено",
      permOff: "Вимкнено — натисніть, щоб дозволити",
      permBlocked: "Заблоковано — увімкніть у налаштуваннях телефону",
      permBlockedToast: "Сповіщення заблоковано. Відкрийте Налаштування → Застосунок → Сповіщення та увімкніть їх.",
      language: "Мова",
      about: "Про застосунок",
      aboutDesc: "Пояснює ваші документи та нагадує про записи.",
    },
    result: {
      noResult: "Поки що немає результату.",
      backHome: "На головну",
      appointment: "Запис",
      summary: "Підсумок",
      date: "Дата",
      time: "Час",
      place: "Місце",
      actionRequired: "Що потрібно зробити",
      tapMap: "Натисніть, щоб переглянути на карті",
      saveAppt: "Зберегти запис і нагадати",
      addAsAppt: "Додати як запис",
      analyzeAnother: "Аналізувати інше зображення",
    },
    modal: {
      saveTitle: "Зберегти запис",
      editTitle: "Редагувати запис",
      titleLabel: "Назва",
      titlePlaceholder: "напр. Запис до лікаря",
      datetime: "Дата та час",
      locationLabel: "Місце (необов'язково)",
      locationPlaceholder: "напр. Корпус Б",
      remindBefore: "Нагадати за",
      save: "Зберегти",
      defaultTitle: "Запис",
    },
    leads: { m10: "10 хвилин", m30: "30 хвилин", h1: "1 година", d1: "1 день" },
    langNames: { ar: "Арабська", en: "Англійська", uk: "Українська" },
    notif: { title: "Нагадування про запис" },
    auth: {
      loginTitle: "Вхід",
      loginSubtitle: "З поверненням",
      signupTitle: "Створити акаунт",
      signupSubtitle: "Зареєструйтесь, щоб почати",
      forgotTitle: "Забули пароль",
      forgotSubtitle: "Введіть email — ми надішлемо посилання для скидання",
      name: "Ім'я",
      nationality: "Громадянство",
      phone: "Номер телефону",
      email: "Email",
      password: "Пароль",
      loginBtn: "Увійти",
      signupBtn: "Створити акаунт",
      sendReset: "Надіслати посилання",
      loading: "Завантаження...",
      forgotLink: "Забули пароль?",
      noAccount: "Немає акаунта?",
      haveAccount: "Вже маєте акаунт?",
      goSignup: "Зареєструватися",
      goLogin: "Увійти",
      backToLogin: "Повернутися до входу",
      logout: "Вийти",
      account: "Акаунт",
      acceptPre: "Я приймаю",
      privacyPolicy: "Політику конфіденційності",
      errRequired: "Будь ласка, заповніть усі обов'язкові поля.",
      errEmail: "Введіть дійсну email-адресу.",
      errPassword: "Пароль має містити щонайменше 6 символів.",
      errPrivacy: "Потрібно прийняти Політику конфіденційності.",
      errCredentials: "Невірний email або пароль.",
      errGeneric: "Щось пішло не так, спробуйте ще раз.",
      signupDone: "Акаунт створено! Перевірте пошту для підтвердження, потім увійдіть.",
      resetSent: "Якщо ця адреса зареєстрована, лист для скидання вже надіслано.",
      or: "або",
      socialFailed: "Не вдалося увійти через цей сервіс.",
    },
  },
};

const state = reactive({ locale: "ar" });

export const locale = computed(() => state.locale);
export const dir = computed(() => (state.locale === "ar" ? "rtl" : "ltr"));
export function localeTag() {
  return state.locale;
}

function get(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

// Translate a dot-path key. Reactive: reading state.locale ties it to renders.
export function t(key) {
  const cur = get(messages[state.locale], key);
  if (cur !== undefined && cur !== null) return cur;
  const ar = get(messages.ar, key);
  return ar !== undefined ? ar : key;
}

const LEAD_KEYS = { 10: "leads.m10", 30: "leads.m30", 60: "leads.h1", 1440: "leads.d1" };
export function leadLabel(minutes) {
  return t(LEAD_KEYS[minutes] || "leads.m30");
}
export function leadOptions() {
  return [
    { value: 10, label: t("leads.m10") },
    { value: 30, label: t("leads.m30") },
    { value: 60, label: t("leads.h1") },
    { value: 1440, label: t("leads.d1") },
  ];
}

function applyDom() {
  try {
    const el = document.documentElement;
    el.setAttribute("lang", state.locale);
    el.setAttribute("dir", state.locale === "ar" ? "rtl" : "ltr");
  } catch {
    /* no DOM (SSR/tests) */
  }
}

export function setLocale(code) {
  if (!messages[code]) return;
  state.locale = code;
  applyDom();
  Preferences.set({ key: KEY, value: code }).catch(() => {});
}

export async function loadLocale() {
  try {
    const { value } = await Preferences.get({ key: KEY });
    if (value && messages[value]) state.locale = value;
  } catch {
    /* keep default */
  }
  applyDom();
}

export function useI18n() {
  return { t, locale, dir, localeTag, setLocale, languages: LANGUAGES };
}
