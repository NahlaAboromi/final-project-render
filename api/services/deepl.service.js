// api/services/deepl.service.js
require('dotenv').config();
const axios = require('axios');

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
if (!DEEPL_API_KEY) {
  throw new Error('DEEPL_API_KEY חסר ב-.env');
}

// אם את על Free השאירי api-free. אם תשדרגי ל-Pro אפשר להחליף ל-api.deepl.com
const DEEPL_BASE = process.env.DEEPL_API_BASE || 'https://api-free.deepl.com';

async function translateBatch({ texts, sourceLang = 'EN', targetLang = 'HE' }) {
  if (!Array.isArray(texts) || texts.length === 0) return [];

  const params = new URLSearchParams();
  texts.forEach(t => params.append('text', t));
  params.append('target_lang', targetLang);
  if (sourceLang) params.append('source_lang', sourceLang); // אפשר להשמיט לזיהוי אוטומטי

  const res = await axios.post(`${DEEPL_BASE}/v2/translate`, params, {
    headers: {
      'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    timeout: 15000
  });

  // החזרה אחידה: מערך של מחרוזות מתורגמות (באותו סדר)
  return (res.data?.translations || []).map(t => t.text);
}

module.exports = { translateBatch };
