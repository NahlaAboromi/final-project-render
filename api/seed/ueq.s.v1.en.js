// api/seed/ueq.s.v1.en.js

const OPTIONS_UEQ_EN = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7" }
];

// הרשימה מבוססת על UEQ-S: כל טקסט הוא זוג (left/right)
// שב-frontend תוכלו לפצל לפי "/".

module.exports = [
  // --------- Pragmatic Quality ----------
  {
    key: 'ueqs01',
    category: 'Pragmatic Quality',
    text: 'obstructive / supportive',
    order: 1,
  },
  {
    key: 'ueqs02',
    category: 'Pragmatic Quality',
    text: 'complicated / easy',
    order: 2,
  },
  {
    key: 'ueqs03',
    category: 'Pragmatic Quality',
    text: 'inefficient / efficient',
    order: 3,
  },
  {
    key: 'ueqs04',
    category: 'Pragmatic Quality',
    text: 'confusing / clear',
    order: 4,
  },

  // --------- Hedonic Quality ----------
  {
    key: 'ueqs05',
    category: 'Hedonic Quality',
    text: 'boring / exciting',
    order: 5,
  },
  {
    key: 'ueqs06',
    category: 'Hedonic Quality',
    text: 'not interesting / interesting',
    order: 6,
  },
  {
    key: 'ueqs07',
    category: 'Hedonic Quality',
    text: 'conventional / inventive',
    order: 7,
  },
  {
    key: 'ueqs08',
    category: 'Hedonic Quality',
    text: 'usual / leading-edge',
    order: 8,
  },
].map(q => ({
  ...q,
  options: OPTIONS_UEQ_EN,
  version: 'ueq-s-v1',
  lang: 'en',
  phase: 'post',
  active: true
}));
