//C:\Users\n0502\OneDrive\שולחן העבודה\פרויקט סוף\final_project-main\final_project-main\api\seed\sel.questions.v1.en.js
const OPTIONS = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Agree" },
  { value: 4, label: "Strongly Agree" }
];

module.exports = [
  { key: 'q01', category: 'Self-Awareness', text: 'I am aware of the emotions I feel.', order: 1 },
  { key: 'q02', category: 'Self-Awareness', text: 'I can calm myself down.', order: 2 },
  { key: 'q03', category: 'Self-Awareness', text: 'I know what my strengths are.', order: 3 },
  { key: 'q04', category: 'Self-Awareness', text: 'I am aware when my feelings are making it hard to focus.', order: 4 },
  { key: 'q05', category: 'Self-Management', text: 'I can be patient during lessons that get me excited.', order: 5 },
  { key: 'q06', category: 'Self-Management', text: 'I always manage to finish my tasks even if they are hard for me.', order: 6 },
  { key: 'q07', category: 'Self-Management', text: 'I can set goals for myself.', order: 7 },
  { key: 'q08', category: 'Self-Management', text: 'I complete my assignment even if I do not feel like it.', order: 8 },
  { key: 'q09', category: 'Social Awareness', text: 'I learn from people with different opinions than me.', order: 9 },
  { key: 'q10', category: 'Social Awareness', text: 'I am able to tell what people may be feeling.', order: 10 },
  { key: 'q11', category: 'Social Awareness', text: 'I know when someone needs help.', order: 11 },
  { key: 'q12', category: 'Social Awareness', text: "I know how to get help when I'm having trouble with a classmate.", order: 12 },
  { key: 'q13', category: 'Relationship Skills', text: "I can respect a classmate's opinions during disagreements.", order: 13 },
  { key: 'q14', category: 'Relationship Skills', text: 'I get along well with my classmates.', order: 14 },
  { key: 'q15', category: 'Relationship Skills', text: 'I always speak to an adult when I have problems at school.', order: 15 },
  { key: 'q16', category: 'Relationship Skills', text: 'I build and maintain healthy relationships within my university community.', order: 16 },
  { key: 'q17', category: 'Responsible Decision-Making', text: 'I think about what might happen before making any decision.', order: 17 },
  { key: 'q18', category: 'Responsible Decision-Making', text: 'In a situation, I know what is right or wrong.', order: 18 },
  { key: 'q19', category: 'Responsible Decision-Making', text: 'I can strictly say "NO" to a friend who wants me to break the rules.', order: 19 },
  { key: 'q20', category: 'Responsible Decision-Making', text: 'I always seek advice or feedback from others before making important decisions.', order: 20 }
].map(q => ({
  ...q,
  options: OPTIONS,
  version: 'v1',
  lang: 'en',
  phase: 'both',
  active: true
}));
