//C:\Users\n0502\OneDrive\שולחן העבודה\פרויקט סוף\convet to local host\ModularSkillsAssessmentTool-Team11-NEW-main\ModularSkillsAssessmentTool-Team11-NEW-main\api\utils\dates.js
const TZ = 'Asia/Jerusalem';
function asIL(dateLike) {
  if (!dateLike) return '';
  return new Date(dateLike).toLocaleString('he-IL', {
    timeZone: TZ, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}
module.exports = { asIL };