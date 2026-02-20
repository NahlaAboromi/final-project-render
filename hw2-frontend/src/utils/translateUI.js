// src/utils/translateUI.js
export async function translateUI({ sourceLang = "EN", targetLang = "HE", texts = [] }) {
  if (!Array.isArray(texts) || texts.length === 0) return [];

  // ⚡️ קאש דפדפן פשוט כדי לא לקרוא פעמיים על אותו טקסט
  const makeKey = (t) => `${sourceLang}::${targetLang}::${t}`;
  const cache = window.sessionStorage; // או localStorage
  const results = new Array(texts.length);
  const missing = [];

  // שלב א: שליפת מהקאש המקומי
  texts.forEach((t, i) => {
    const k = makeKey(t);
    const cached = cache.getItem(k);
    if (cached) {
      results[i] = cached;
    } else {
      missing.push({ i, t, k });
    }
  });

  // שלב ב: מה שחסר—נשלח לשרת בבאצ' אחד
  if (missing.length > 0) {
    const resp = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceLang,
        targetLang,
        texts: missing.map(m => m.t)
      })
    });
    if (!resp.ok) {
      // נפילה — נחזיר את המקור, שלא נתקע
      missing.forEach(m => { results[m.i] = m.t; });
    } else {
      const data = await resp.json();
      missing.forEach((m, idx) => {
        const translated = data.translations?.[idx] ?? m.t;
        results[m.i] = translated;
        cache.setItem(m.k, translated);
      });
    }
  }

  return results;
}
