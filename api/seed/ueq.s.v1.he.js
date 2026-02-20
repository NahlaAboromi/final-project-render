// api/seed/ueq.s.v1.he.js

const OPTIONS_UEQ_HE = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7" }
];

// ⚠ שימי לב: כאן אני שם את הטקסטים בעברית בצורה שמורה,
// אבל את יכולה אחר-כך לעדכן לפי התרגום הרשמי שתרצי.

module.exports = [
  // --------- Pragmatic Quality ----------
  {
    key: 'ueqs01',
    category: 'Pragmatic Quality',
    text: 'מכשילות  / תומכות',
    order: 1,
  },
  {
    key: 'ueqs02',
    category: 'Pragmatic Quality',
    text: 'מסובכים / קלים',
    order: 2,
  },
  {
    key: 'ueqs03',
    category: 'Pragmatic Quality',
    text: 'לא יעיל / יעיל',
    order: 3,
  },
  {
    key: 'ueqs04',
    category: 'Pragmatic Quality',
    text: 'מבלבלים / ברורים',
    order: 4,
  },

  // --------- Hedonic Quality ----------
  {
    key: 'ueqs05',
    category: 'Hedonic Quality',
    text: 'משעממים / מלהיבים',
    order: 5,
  },
  {
    key: 'ueqs06',
    category: 'Hedonic Quality',
    text: 'לא מעניינים / מעניינים',
    order: 6,
  },
  {
    key: 'ueqs07',
    category: 'Hedonic Quality',
    text: 'שגרתיים / פורצי דרך',
    order: 7,
  },
  {
    key: 'ueqs08',
    category: 'Hedonic Quality',
    text: 'רגילים / בחזית החדשנות',
    order: 8,
  },
].map(q => ({
  ...q,
  options: OPTIONS_UEQ_HE,
  version: 'ueq-s-v1',
  lang: 'he',
  phase: 'post',   // 🔹 רק בדף האחרון אחרי כל התהליך
  active: true
}));
