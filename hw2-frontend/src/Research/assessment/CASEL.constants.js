//C:\Users\n0502\OneDrive\שולחן העבודה\פרויקט סוף\final_project-main\final_project-main\hw2-frontend\src\Research\assessment\CASEL.constants.js
import { Brain, Heart, Users, Lightbulb, Target } from 'lucide-react';

export const CATEGORIES = {
  'Self-Awareness':             { icon: Brain,      color:'from-purple-600 to-violet-600',  bgColor:'bg-purple-50',    textColor:'text-purple-700',    borderColor:'border-purple-200' },
  'Self-Management':            { icon: Target,     color:'from-blue-600 to-cyan-600',      bgColor:'bg-blue-50',      textColor:'text-blue-700',      borderColor:'border-blue-200' },
  'Social Awareness':           { icon: Heart,      color:'from-rose-600 to-pink-600',      bgColor:'bg-rose-50',      textColor:'text-rose-700',      borderColor:'border-rose-200' },
  'Relationship Skills':        { icon: Users,      color:'from-emerald-600 to-teal-600',   bgColor:'bg-emerald-50',   textColor:'text-emerald-700',   borderColor:'border-emerald-200' },
  'Responsible Decision-Making':{ icon: Lightbulb,  color:'from-amber-600 to-orange-600',   bgColor:'bg-amber-50',     textColor:'text-amber-700',     borderColor:'border-amber-200' },
};

export const SCALE = [
  { value: 1, label: 'Strongly Disagree', key:'1', color:'from-red-600 to-rose-600',     bgColor:'bg-red-50',     borderColor:'border-red-400',     hoverBorder:'hover:border-red-500' },
  { value: 2, label: 'Disagree',          key:'2', color:'from-orange-600 to-amber-600', bgColor:'bg-orange-50',  borderColor:'border-orange-400',  hoverBorder:'hover:border-orange-500' },
  { value: 3, label: 'Agree',             key:'3', color:'from-blue-600 to-cyan-600',    bgColor:'bg-blue-50',    borderColor:'border-blue-400',    hoverBorder:'hover:border-blue-500' },
  { value: 4, label: 'Strongly Agree',    key:'4', color:'from-emerald-600 to-teal-600', bgColor:'bg-emerald-50', borderColor:'border-emerald-400', hoverBorder:'hover:border-emerald-500' },
];
export const CATEGORIES_HE = {
  'מודעות עצמית':       { icon: Brain,      color:'from-purple-600 to-violet-600',  bgColor:'bg-purple-50',  textColor:'text-purple-700',  borderColor:'border-purple-200' },
  'ניהול עצמי':         { icon: Target,     color:'from-blue-600 to-cyan-600',      bgColor:'bg-blue-50',    textColor:'text-blue-700',    borderColor:'border-blue-200' },
  'מודעות חברתית':      { icon: Heart,      color:'from-rose-600 to-pink-600',      bgColor:'bg-rose-50',    textColor:'text-rose-700',    borderColor:'border-rose-200' },
  'מיומנויות בינאישיות': { icon: Users,      color:'from-emerald-600 to-teal-600',   bgColor:'bg-emerald-50', textColor:'text-emerald-700', borderColor:'border-emerald-200' },
  'קבלת החלטות אחראית': { icon: Lightbulb,  color:'from-amber-600 to-orange-600',   bgColor:'bg-amber-50',   textColor:'text-amber-700',   borderColor:'border-amber-200' },
};

export const SCALE_HE = [
  { value: 1, label: 'בכלל לא מסכים/ה', key:'1', color:'from-red-600 to-rose-600',     bgColor:'bg-red-50',     borderColor:'border-red-400',     hoverBorder:'hover:border-red-500' },
  { value: 2, label: 'לא מסכים/ה',       key:'2', color:'from-orange-600 to-amber-600', bgColor:'bg-orange-50',  borderColor:'border-orange-400',  hoverBorder:'hover:border-orange-500' },
  { value: 3, label: 'מסכים/ה',         key:'3', color:'from-blue-600 to-cyan-600',    bgColor:'bg-blue-50',    borderColor:'border-blue-400',    hoverBorder:'hover:border-blue-500' },
  { value: 4, label: 'מסכים/ה מאוד',    key:'4', color:'from-emerald-600 to-teal-600', bgColor:'bg-emerald-50', borderColor:'border-emerald-400', hoverBorder:'hover:border-emerald-500' },
];