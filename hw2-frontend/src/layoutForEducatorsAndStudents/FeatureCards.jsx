import React, { useContext } from "react";
import { ThemeContext } from "../DarkLightMood/ThemeContext";

// Array of feature objects, each describing a key feature of the platform
const features = [
  {
    title: "AI-Powered Analysis",
    icon: "🧠",
    description: "Claude AI analyzes student responses in real-time, providing detailed insights on CASEL framework competencies including self-awareness, social awareness, and responsible decision-making."
  },
  {
    title: "Interactive Simulations",
    icon: "🎭",
    description: "Engage students with realistic scenarios that challenge their social-emotional skills. Each simulation is carefully designed to assess specific SEL competencies."
  },
  {
    title: "Comprehensive Analytics",
    icon: "📊",
    description: "Track progress with detailed dashboards, CASEL-based scoring, and personalized recommendations for skill improvement and intervention strategies."
  },
  {
    title: "Dual-User Platform",
    icon: "👥",
    description: "Separate interfaces for educators and students, with specialized tools for class management, progress tracking, and personalized learning experiences."
  },
  {
    title: "SEL Framework Integration",
    icon: "🎯",
    description: "Built on the internationally recognized CASEL framework, ensuring comprehensive coverage of all five core SEL competencies."
  },
  {
    title: "Progress Tracking",
    icon: "📈",
    description: "Monitor student development over time with detailed reports, trend analysis, and automated feedback generation powered by advanced AI algorithms."
  }
];

// Functional component that renders feature cards in a responsive grid
const FeatureCards = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-10">
      {features.map((feature, index) => {
        const baseClasses =  `${isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-900'} rounded-xl shadow-md p-6 text-center transition duration-300`;

        return (
          <div key={index} className={baseClasses}>
            {/* Icon emoji displayed large above title */}
            <div className="text-3xl mb-3">{feature.icon}</div>
            {/* Feature title */}
            <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
            {/* Feature description */}
            <p className="text-sm leading-relaxed">{feature.description}</p>
          </div>
        );
      })}
    </div>
  );
};

export default FeatureCards;
