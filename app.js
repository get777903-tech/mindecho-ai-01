/* ==========================================================================
   MindEcho AI — Main Application & Engine Script
   ========================================================================== */

// Configurable Webhook URL for Google Sheets logging
// Replace this URL with your published Google Apps Script Webhook URL
const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbx_DEMO_MINDECHO_WEBHOOK/exec";

// Global Application State
const appState = {
  lang: 'ru',
  isRecording: false,
  isPlayingAudio: false,
  isAnnualBilling: false,
  selectedPlan: 'Premium',
  selectedPrice: 14.99,
  currentAudioUtterance: null,
  speechSynth: window.speechSynthesis
};

// Multilingual Dictionary (RU, EN, HE)
const i18n = {
  ru: {
    nav_mission: "Миссия",
    nav_modes: "Аудиорежимы",
    nav_generator: "Студия",
    nav_pricing: "Тарифы",
    btn_login: "Войти",
    hero_badge: "ИИ + Детская Нейропсихология + КПТ",
    hero_title: "Превращаем родительскую рутину в <span class='text-gradient'>бережную терапию</span>",
    hero_subtitle: "Мы создаем глобальное технологическое решение для защиты ментального здоровья семей. Легальный способ сохранить эмоциональные ресурсы родителей и вырастить счастливого ребенка.",
    btn_try_free: "🚀 Попробовать бесплатно (2 запроса/день)",
    btn_support_project: "[ Поддержать проект / Получить ссылку ]",
    tag_supermission: "Супермиссия MindEcho AI",
    title_supermission: "4 Столпа Общественного Проекта",
    sub_supermission: "Мы создаем не просто коммерческий софт, а самую защищенную и научно выверенную экосистему для ментального здоровья семей во всем мире.",
    m1_title: "1. Глобальная инклюзивность",
    m1_desc: "Стираем социальное и экономическое неравенство. Платформа доступна даже для малоимущих семей — каждый ребенок имеет право на здоровое развитие. Диалог по КПТ и ACT с супервизором.",
    m2_title: "2. Гармония в доме без ссор",
    m2_desc: "Прогрессивные аудиорежимы и геймификация привычек исключают из жизни семьи истерики, упреки и обиды, мягко повышая эмоциональный интеллект (EQ).",
    m3_title: "3. Сбережение энергии родителей",
    m3_desc: "Защищаем родителей от выгорания, гарантируя 1–2 часа личного времени в день, а детей — от ментального перенапряжения.",
    m4_title: "4. Искоренение детских психотравм",
    m4_desc: "Превентивно и мягко исцеляем дневные стрессы, обиды и страхи ребенка прямо в процессе засыпания, программируя на уверенность.",
    tag_modes: "Быстрый запуск",
    title_modes: "3 Входных Аудиорежима Терапии",
    sub_modes: "Выберите требуемый сценарий для мгновенной генерации медитации или помощи",
    mode_morning_title: "Утренняя медитация",
    mode_morning_desc: "Заряд бодрости, веры в свои силы, лёгкости в учебе и радости перед новым днем.",
    btn_start_morning: "Запустить утренний настрой",
    mode_bedtime_title: "Медитация перед сном",
    mode_bedtime_desc: "Мягкий уход в сон, снятие дневных обид, растворение страхов и выработка глубинного покоя.",
    btn_start_bedtime: "Запустить сонную терапию",
    mode_emergency_title: "Экстренная помощь при истерике",
    mode_emergency_desc: "Мгновенный 4-шаговый алгоритм для родителя + экспресс-генерация аудио для заземления ребенка.",
    btn_start_emergency: "🚨 Активировать скорую помощь",
    btn_gen_emergency: "✨ Сгенерировать экспресс-аудио",
    tag_studio: "Студия Сказкотерапии",
    title_studio: "Создайте Персональную Медитацию",
    sub_studio: "Голосовая запись + Настройка имени, героя и успокаивающего голоса",
    btn_generate: "✨ Сгенерировать и озвучить медитацию",
    tag_pricing: "Прозрачная монетизация",
    title_pricing: "Выберите Тариф Подписки",
    sub_pricing: "Freemium доступ + Лимиты генерации + Докупка минут",
    btn_plan_free: "Начать бесплатно",
    btn_plan_basic: "Выбрать Базовый",
    btn_plan_premium: "Активировать Премиум",
    btn_plan_platinum: "Выбрать Платиновый",
    sticky_text: "Инвестируйте в гармонию семьи от $7/мес",
    btn_choose_plan: "Выбрать тариф"
  },
  en: {
    nav_mission: "Mission",
    nav_modes: "Audio Modes",
    nav_generator: "Studio",
    nav_pricing: "Pricing",
    btn_login: "Log In",
    hero_badge: "AI + Child Neuropsychology + CBT",
    hero_title: "Transforming parenting routine into <span class='text-gradient'>gentle therapy</span>",
    hero_subtitle: "We build a global tech ecosystem for family mental health. A legal way to save parents' emotional resources and raise happy children.",
    btn_try_free: "🚀 Try Free (2 requests/day)",
    btn_support_project: "[ Support Project / Get Link ]",
    tag_supermission: "MindEcho AI Super-Mission",
    title_supermission: "4 Pillars of Public Impact",
    sub_supermission: "Creating a scientifically validated and secure ecosystem for family mental health worldwide.",
    m1_title: "1. Global Inclusivity",
    m1_desc: "Erasing social inequality. Platform remains accessible even for low-income families — every child deserves healthy mental growth.",
    m2_title: "2. Family Harmony Without Fights",
    m2_desc: "Progressive audio modes eliminate tantrums and resentment, gently boosting emotional intelligence (EQ).",
    m3_title: "3. Saving Parents' Energy",
    m3_desc: "Protecting parents from burnout, guaranteeing 1–2 hours of personal daily time.",
    m4_title: "4. Preventing Child Trauma",
    m4_desc: "Gently healing daytime stress and fears right during sleep transition, programming confidence.",
    tag_modes: "Quick Launch",
    title_modes: "3 Core Audio Therapy Modes",
    sub_modes: "Select a scenario for instant personalized meditation or emergency relief",
    mode_morning_title: "Morning Meditation",
    mode_morning_desc: "Boost of energy, self-belief, learning ease, and joy for the new day.",
    btn_start_morning: "Start Morning Vibe",
    mode_bedtime_title: "Bedtime Meditation",
    mode_bedtime_desc: "Gentle sleep transition, dissolving daytime fears, and cultivating deep peace.",
    btn_start_bedtime: "Start Sleep Therapy",
    mode_emergency_title: "Emergency Tantrum Relief",
    mode_emergency_desc: "Instant 4-step algorithm for parents + express audio for child grounding.",
    btn_start_emergency: "🚨 Activate Emergency Relief",
    btn_gen_emergency: "✨ Generate Express Audio",
    tag_studio: "Story Therapy Studio",
    title_studio: "Create Personal Meditation",
    sub_studio: "Voice recording + Custom name, hero, and soothing voice timbre",
    btn_generate: "✨ Generate & Speak Meditation",
    tag_pricing: "Transparent Pricing",
    title_pricing: "Select Subscription Plan",
    sub_pricing: "Freemium access + Generation credits + Top-up minutes",
    btn_plan_free: "Start Free",
    btn_plan_basic: "Choose Basic",
    btn_plan_premium: "Activate Premium",
    btn_plan_platinum: "Choose Platinum",
    sticky_text: "Invest in family harmony from $7/mo",
    btn_choose_plan: "Choose Plan"
  },
  he: {
    nav_mission: "משימה",
    nav_modes: "מצבי שמע",
    nav_generator: "סטודיו",
    nav_pricing: "תעריפים",
    btn_login: "התחבר",
    hero_badge: "בינה מלאכותית + נוירופסיכולוגיה",
    hero_title: "הופכים את שגרת ההורות ל<span class='text-gradient'>תרפיה עדינה</span>",
    hero_subtitle: "פתרון טכנולוגי גלובלי לבריאות הנפש של המשפחה. לשמור על המשאבים הרגשיים של ההורים ולגדל ילדים מאושרים.",
    btn_try_free: "🚀 נסה בחינם (2 בקשות ביום)",
    btn_support_project: "[ תמוך בפרויקט / קבל קישור ]",
    tag_supermission: "סופר-משימה של MindEcho AI",
    title_supermission: "4 עמודי התווך של הפרויקט",
    sub_supermission: "מערכת אקולוגית בטוחה ומוכחת מדעית לבריאות הנפש של משפחות ברחבי העולם.",
    m1_title: "1. הכלה גלובלית",
    m1_desc: "מחיקת אי-שוויון חברתי. הפלטפורמה נגישה לכל המשפחות — לכל ילד מגיעה צמיחה נפשית בריאה.",
    m2_title: "2. הרמוניה בבית ללא מריבות",
    m2_desc: "מצבי שמע מתקדמים מונעים התקפי זעם ומעלים בעדינות את האינטליגנציה הרגשית (EQ).",
    m3_title: "3. חיסכון באנרגיה של ההורים",
    m3_desc: "הגנה על ההורים מפני שחיקה, עם הבטחה ל-1–2 שעות זמן אישי ביום.",
    m4_title: "4. מניעת טראומות ילדות",
    m4_desc: "ריפוי עדין של פחדים ומתחים ישירות בתהליך ההרדמה, תוך תכנות ביטחון עצמי.",
    tag_modes: "הפעלה מהירה",
    title_modes: "3 מצבי טיפול בשמע",
    sub_modes: "בחר תרחיש ליצירה מיידית של מדיטציה או עזרה דחופה",
    mode_morning_title: "מדיטציית בוקר",
    mode_morning_desc: "חיזוק הביטחון, הקלה בלימודים ושמחה ליום החדש.",
    btn_start_morning: "התחל מדיטציית בוקר",
    mode_bedtime_title: "מדיטציה לפני השינה",
    mode_bedtime_desc: "מעבר עדין לשינה, הפגת פחדים וטיפוח שלווה עמוקה.",
    btn_start_bedtime: "התחל תרפיית שינה",
    mode_emergency_title: "עזרה דחופה בזמן התקף זעם",
    mode_emergency_desc: "אלגוריתם מיידי של 4 שלבים להורה + שמע מהיר לקרקוע הילד.",
    btn_start_emergency: "🚨 הפעל עזרה דחופה",
    btn_gen_emergency: "✨ צור שמע מהיר",
    tag_studio: "סטודיו לריפוי בסיפורים",
    title_studio: "צור מדיטציה אישית",
    sub_studio: "הקלטת קול + התאמה אישית של שם, גיבור וטמבר מרגיע",
    btn_generate: "✨ צור והקרא מדיטציה",
    tag_pricing: "תמחור שקוף",
    title_pricing: "בחר תוכנית מנוי",
    sub_pricing: "גישת Freemium + קרדיטים ליצירה",
    btn_plan_free: "התחל בחינם",
    btn_plan_basic: "בחר בסיסי",
    btn_plan_premium: "הפעל פרימיום",
    btn_plan_platinum: "בחר פלטינום",
    sticky_text: "השקע בהרמוניה משפחתית החל מ-$7 לחודש",
    btn_choose_plan: "בחר תוכנית"
  }
};

// Base Meditation Master Template
const BASE_MEDITATION_TEMPLATE = `
Закрой глаза и обрати внимание на свой нос. Найди его, не открывая глаз. Почувствуй его мысленно... (Дыши спокойно и ровно, сосредоточься на ощущении воздуха у ноздрей)...
А теперь обрати внимание на свои уши... Найди их, мысленно их ощути. Побудь с ними... (Почувствуй их тепло и мысленно представь их форму)...
А теперь обрати внимание на пространство между своими ушами внутри своей головы... вот на это пространство. Почувствуй его, наблюдая за ним... (Представь внутри головы тихую, темную и спокойную пустоту)...
А теперь обрати внимание на пространство вокруг всей своей головы... Ощути его мыслями, понаблюдай за ним...
А теперь давай отправимся в дружелюбное местечко... Представь, что в мире {HERO} есть такое место, где {NAME} чувствует себя волшебно и хорошо...
Потому что это тот мир, который {NAME} построил{GENDER_END} самостоятельно, где мысли становятся реальными...
Поверь в то, что {NAME} — очень умн{GENDER_ADJ} человек, и ооочень быстро и легко учишься... Поверь в это, и всё сбудется...
Поверь в то, что тебя очень сильно любят, и почувствуй это всем своим сердцем...
Поверь в то, что ты всегда можешь быть здоров{GENDER_ADJ}, и какое сильное у тебя тело...
Поверь в то, что все неприятности и страхи растают, как снег под жаркими лучами солнца...
Ты — волшебство своей жизни. Помни: {NAME}, ты важна, ты любима, ты особенная, и в тебе есть величие!
Сделай глубокий вдох... улыбнись жизни, и она улыбнется тебе в ответ...
`;

// Initialize Page Load
document.addEventListener('DOMContentLoaded', () => {
  setupScrollListener();
  registerServiceWorker();
});

// Switch Language
function switchLanguage(langKey) {
  appState.lang = langKey;
  
  // Update Buttons UI
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  // HTML dir attribute for RTL
  if (langKey === 'he') {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'he');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.setAttribute('lang', langKey);
  }

  // Update DOM i18n Elements
  const dictionary = i18n[langKey] || i18n.ru;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dictionary[key]) {
      el.innerHTML = dictionary[key];
    }
  });
}

// Scroll & Sticky Bar
function setupScrollListener() {
  const stickyBar = document.getElementById('sticky-bar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 450) {
      stickyBar.classList.remove('hidden');
    } else {
      stickyBar.classList.add('hidden');
    }
  });
}

function scrollToSection(sectionId) {
  const target = document.getElementById(sectionId);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
}

// Select 3 Primary Audio Modes
function selectAudioMode(modeKey) {
  const typeSelect = document.getElementById('meditation-type');
  if (typeSelect) typeSelect.value = modeKey;

  const emergencyPanel = document.getElementById('emergency-panel');
  if (modeKey === 'emergency') {
    emergencyPanel.classList.remove('hidden');
    emergencyPanel.scrollIntoView({ behavior: 'smooth' });
  } else {
    emergencyPanel.classList.add('hidden');
    scrollToSection('generator');
  }

  // Log Mode Selection Click to Analytics Webhook
  logClickAnalytics('AudioMode_Select', modeKey, 0);
}

function closeEmergencyPanel() {
  document.getElementById('emergency-panel').classList.add('hidden');
}

// Generate Emergency Tantrum Audio
function generateEmergencyAudio() {
  const contextInput = document.getElementById('emergency-context').value || "Ребенок растревожен и не может успокоиться";
  const name = document.getElementById('child-name').value || "Ребенок";

  const emergencyScript = `
    ${name}, сделай глубокий выдох вместе со мной... 1... 2... 3... 
    Я знаю, что ситуация: "${contextInput}" вызывает много эмоций. 
    Твои чувства важны, но ты в полной безопасности. 
    Почувствуй, как тепло разливается по твоему телу. Ты сильный, ты любимый, все хорошо.
  `;

  document.getElementById('meditation-text-box').innerHTML = `<p><strong>🚨 ЭКСТРЕННОЕ АУДИО ДЛЯ ЗАЗЕМЛЕНИЯ:</strong><br><br>${emergencyScript}</p>`;
  speakTextWithTunedVoice(emergencyScript);

  logClickAnalytics('EmergencyAudio_Generated', contextInput, 0);
}

// Microphone Recording Simulation
function toggleVoiceRecord() {
  const micBtn = document.getElementById('mic-btn');
  const micText = document.getElementById('mic-text');
  const micWave = document.getElementById('mic-wave');

  if (!appState.isRecording) {
    appState.isRecording = true;
    micBtn.classList.add('recording');
    micText.innerText = "Идет запись голоса... Задайте вопрос";
    micWave.classList.remove('hidden');

    // Simulate Speech-to-Text Speech Recognition
    setTimeout(() => {
      if (appState.isRecording) {
        toggleVoiceRecord();
        alert("Голос записан! ИИ проанализировал тембр: Выявлено небольшое выгорание родителя. Сгенерирована бережная медитация для снятия напряжения.");
      }
    }, 4000);
  } else {
    appState.isRecording = false;
    micBtn.classList.remove('recording');
    micText.innerText = "Запись завершена (Голос проанализирован)";
    micWave.classList.add('hidden');
  }

  logClickAnalytics('VoiceRecord_Toggled', appState.isRecording ? 'Start' : 'Stop', 0);
}

// Generate Personal Meditation Text & Audio
function generatePersonalMeditation() {
  const name = document.getElementById('child-name').value || "Ребенок";
  const gender = document.getElementById('child-gender').value;
  const hero = document.getElementById('child-hero').value || "Волшебник";
  const mode = document.getElementById('meditation-type').value;

  const genderEnd = (gender === 'girl') ? 'а' : '';
  const genderAdj = (gender === 'girl') ? 'ая' : 'ый';

  let customText = BASE_MEDITATION_TEMPLATE
    .replace(/{NAME}/g, name)
    .replace(/{HERO}/g, hero)
    .replace(/{GENDER_END}/g, genderEnd)
    .replace(/{GENDER_ADJ}/g, genderAdj);

  if (mode === 'morning') {
    customText = `☀️ УТРЕННИЙ НАСТРОЙ ДЛЯ ${name.toUpperCase()}:\n\n` + customText;
  } else if (mode === 'emergency') {
    customText = `🚨 ЗАЗЕМЛЯЮЩАЯ МЕДИТАЦИЯ ДЛЯ ${name.toUpperCase()}:\n\n` + customText;
  } else {
    customText = `🌙 СОННАЯ ТЕРАПИЯ ДЛЯ ${name.toUpperCase()}:\n\n` + customText;
  }

  document.getElementById('meditation-text-box').innerText = customText;
  document.getElementById('player-title').innerText = `Медитация для ${name} (${hero})`;
  
  speakTextWithTunedVoice(customText);

  logClickAnalytics('Meditation_Generated', `${mode}_${name}`, 0);
}

// Native SpeechSynthesis (Deep, Slow, 1.5x Pauses)
function speakTextWithTunedVoice(text) {
  if (!appState.speechSynth) {
    alert("Ваш браузер не поддерживает встроенный синтез речи.");
    return;
  }

  appState.speechSynth.cancel(); // Stop current

  const utterance = new SpeechSynthesisUtterance(text);
  const voiceTimbre = document.getElementById('voice-timbre').value;

  // Tuned Timbre Parameters: Low Pitch & Slow Rate
  utterance.rate = 0.65; // Slow, calming delivery
  utterance.pitch = (voiceTimbre === 'male_deep') ? 0.75 : 0.9;
  utterance.lang = (appState.lang === 'he') ? 'he-IL' : (appState.lang === 'en' ? 'en-US' : 'ru-RU');

  utterance.onstart = () => {
    appState.isPlayingAudio = true;
    document.getElementById('play-btn').innerText = "⏸";
    document.getElementById('player-progress').style.width = "20%";
  };

  utterance.onend = () => {
    appState.isPlayingAudio = false;
    document.getElementById('play-btn').innerText = "▶";
    document.getElementById('player-progress').style.width = "100%";
  };

  appState.currentAudioUtterance = utterance;
  appState.speechSynth.speak(utterance);
}

function togglePlayAudio() {
  if (!appState.speechSynth) return;

  if (appState.speechSynth.speaking) {
    if (appState.speechSynth.paused) {
      appState.speechSynth.resume();
      document.getElementById('play-btn').innerText = "⏸";
    } else {
      appState.speechSynth.pause();
      document.getElementById('play-btn').innerText = "▶";
    }
  } else {
    generatePersonalMeditation();
  }
}

// Pricing Toggle (Monthly vs Annual)
function toggleBillingCycle() {
  const isAnnual = document.getElementById('billing-switch').checked;
  appState.isAnnualBilling = isAnnual;

  const basicPrice = document.querySelector('.price-basic');
  const premiumPrice = document.querySelector('.price-premium');
  const platinumPrice = document.querySelector('.price-platinum');

  const premiumAnnualSub = document.querySelector('.price-premium-annual');
  const platinumAnnualSub = document.querySelector('.price-platinum-annual');

  if (isAnnual) {
    premiumPrice.innerHTML = "$59.99 <span>/ год</span>";
    platinumPrice.innerHTML = "$99.99 <span>/ год</span>";
    premiumAnnualSub.classList.remove('hidden');
    platinumAnnualSub.classList.remove('hidden');
  } else {
    premiumPrice.innerHTML = "$14.99 <span>/ месяц</span>";
    platinumPrice.innerHTML = "$24.99 <span>/ месяц</span>";
    premiumAnnualSub.classList.add('hidden');
    platinumAnnualSub.classList.add('hidden');
  }

  logClickAnalytics('BillingCycle_Toggled', isAnnual ? 'Annual' : 'Monthly', 0);
}

// Plan Selection & Checkout Modal
function selectPlan(planName, price) {
  appState.selectedPlan = planName;
  appState.selectedPrice = price;

  logClickAnalytics('TariffButton_Click', planName, price);

  if (price === 0) {
    openAuthModal('free');
  } else {
    document.getElementById('checkout-plan-name').innerText = planName;
    document.getElementById('checkout-plan-price').innerText = `$${price}`;
    document.getElementById('checkout-modal').classList.remove('hidden');
  }
}

function closeCheckoutModal() {
  document.getElementById('checkout-modal').classList.add('hidden');
}

function handlePaymentSubmit(e) {
  e.preventDefault();
  alert(`🎉 Подписка "${appState.selectedPlan}" успешно активирована! Добро пожаловать в экосистему MindEcho AI.`);
  closeCheckoutModal();
  logClickAnalytics('Payment_Completed', appState.selectedPlan, appState.selectedPrice);
}

// Auth Modal Handlers
function openAuthModal(type = 'login') {
  document.getElementById('auth-modal').classList.remove('hidden');
  logClickAnalytics('AuthModal_Opened', type, 0);
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.add('hidden');
}

function simulateSocialAuth(provider) {
  alert(`Вход через ${provider} выполнен успешно!`);
  closeAuthModal();
  logClickAnalytics('SocialAuth_Success', provider, 0);
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const phone = document.getElementById('auth-phone').value;

  alert(`Спасибо! Аккаунт (${email}) зарегистрирован.`);
  closeAuthModal();
  logClickAnalytics('EmailAuth_Registered', email, 0, { phone });
}

// Google Sheets Webhook Click & Onboarding Logger
function logClickAnalytics(eventType, planName, priceAmount, extraData = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    event_type: eventType,
    plan_name: planName,
    price: priceAmount,
    language: appState.lang,
    billing_cycle: appState.isAnnualBilling ? 'Annual' : 'Monthly',
    user_agent: navigator.userAgent,
    ...extraData
  };

  console.log("📊 [MindEcho Analytics] Payload:", payload);

  // Send to Google Apps Script Webhook
  try {
    fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => console.warn("Google Sheets Webhook notice (expected for demo URL):", err));
  } catch (err) {
    console.warn("Analytics fetch error:", err);
  }
}

// Register PWA Service Worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log("📱 [PWA] Service Worker registered"))
      .catch(err => console.log("PWA SW registration failed:", err));
  }
}
