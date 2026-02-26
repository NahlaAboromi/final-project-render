//C:\Users\n0502\OneDrive\שולחן העבודה\פרויקט סוף\final_project-main\final_project-main\api\seed\seedScenarios.js
require('dotenv').config();
const mongoose = require('mongoose');
const Scenario = require('../models/Scenario');

const DATA = [
  {
    scenarioId: "S1",
    title: "Extra-credit without proper citation",
    text: `David is a senior and only has three more classes this semester before he graduates.He feels the pressure to maintain a high grade average (especially above 90), and he also just wants to finish and get the classes out of the way.
In one of his classes, an extra credit assignment is to read through a set of given texts from certain articles and books that have been given by the instructor throughout the semester, and then to compile personal thoughts based on the principles covered. To David, it seemed like basically doing something he already had done in the class—read the same information again. He figured the instructor just wanted to make sure the students really did read the articles, so David wrote his paper using direct quotes and verbatim phrases from the reading without correct citation.
During the course, David considered asking a classmate for their thoughts about the extra-credit assignment, but decided not to because he didn’t feel comfortable starting the conversation. He also avoided approaching the instructor to clarify the expectations, worrying it might make him look uncertain.
It was just extra credit, after all, so if it was not as good as his other work, it couldn't really hurt his grade.`,
    reflection: [
      "Is what David did wrong? Why or why not?",
      "Do you think David is right in thinking that this assignment really doesn't matter and can't really hurt his grade because it is only for extra credit?"
    ],
    selTags: ["Responsible Decision-Making","Self-Management","Self-Awareness","Social Awareness"],
    assignedGroupType: "experimental"
  },
 {
  scenarioId: "S3",
  title: "Group work and test dilemma (Math course)",
  text: `Daniel, Noa, and Yoav are assigned to work together on several group assignments in a math course this semester. One of their projects involves each of them solving different types of questions, and then combining the solutions together.

On a test that covers some of the material Noa handled, Daniel cannot remember how to solve the questions. He reasons that because the three of them worked on the project collaboratively and received a good grade, it shouldn’t be a problem to ask Noa for the answers.

Since they sit not far from each other in class, Daniel asks Noa to tell him the answers. Noa does not want to offend her friend, so she shifts her hand so Daniel can see her paper.

Yoav also sits nearby and sees this.`,
  reflection: [
    "Do you think Daniel and Noa’s behavior during the test was acceptable or not acceptable? Why?",
    "Are all three of them at fault?",
    "Is Daniel more at fault than Noa?",
    "Is Yoav obligated to tell the instructor what he saw?"
  ],
  selTags: ["Relationship Skills","Responsible Decision-Making","Social Awareness","Self-Management"],
  assignedGroupType: "experimental"
},
  {
    scenarioId: "S10",
    title: "Salina's frustrating day and missed invite",
    text: `Salina just had a very bad day. When she got up in the morning, she realized she needed her clean workout clothes, and they were still rolled up in a ball in her gym bag. She was angry with herself for forgetting to wash them. When her mom asked her what was wrong, she snapped, “Never mind. It’s not your problem.” Even though she was frustrated with herself, Salina remembered that her mom was just trying to help, and that made her feel a bit guilty.
Then she felt bad about snapping at her mom. When she got to first period, she was horrified when Mr. Jasper asked her to submit the first draft of her English assignment. She was sure he had said it was due tomorrow.
At lunch, Donte asked her if she wanted to shoot hoops after school. She liked basketball, but she couldn’t tell if he was asking her for real or just teasing her. Salina noticed Donte’s excitement when he invited her, and she realized he really wanted someone to play with him, not just tease her. Although Salina thought it would be fun, she decided she didn’t want to be embarrassed if he was just kidding. She decided to play it safe by not going.
That evening, Donte called Salina at home. “I waited for you on the court,” he said, sounding annoyed. “I thought you liked basketball.” Salina felt sick to her stomach because Donte really had wanted her to play and she missed her chance. She felt bummed out for the rest of the night.`,
    reflection: [
      "What else could Salina have said to her mom?",
      "What could Salina do next time to make sure she understands the English teacher’s expectations so that she isn’t surprised by the deadline?",
      "Why do you think Salina wasn’t sure if Donte was sincere about playing basketball?",
      "What could Salina do differently next time?",
      "What could Donte do differently next time?"
    ],
    selTags: ["Self-Management","Self-Awareness","Responsible Decision-Making","Relationship Skills"],
    assignedGroupType: "experimental"
  },
  {
    scenarioId: "S14",
    title: "Sharing finished paper with a classmate",
    text: `Tomer and Yael are both in business class. Toward the end of the semester, the assignment is to do an analysis of a business plan. The paper is due in a couple of days and due to a family emergency, followed by being in bed all weekend with the flu, Tomer hasn't had a chance to work on the paper and is very stressed out. Yael feels badly for Tomer and since she has finished her analysis, she offers to loan Tomer a copy of her paper so he can look it over to get a sense of how she broke down the assignment and then structured her response, figuring that should help Tomer not feel so overwhelmed and make the project manageable. Tomer gratefully accepts the offer. Yael sends him her analysis in an e-mail attachment. While Tomer struggles with the pressure, he hesitates to express how overwhelmed he feels, even though Yael is trying to support him. Yael, in turn, considers whether she should offer more direct help or ask Tomer what he truly needs, but worries about overstepping or making him uncomfortable.`,
    reflection: [
      "At this point, is this academic dishonesty? If so, what kind (plagiarism, cheating, etc.) and why?",
      "If you were in Tomer’s or Yael’s position, how would you feel, and what would you do differently to handle the situation in a fair and healthy way for both yourself and the other person?"
    ],
    selTags: ["Responsible Decision-Making","Social Awareness","Relationship Skills","Self-Management"],
    assignedGroupType: "control"
  }
];


async function seedScenarios() {
  const ops = DATA.map(doc => ({
    updateOne: {
      filter: { scenarioId: doc.scenarioId },
      update: { $set: doc },
      upsert: true
    }
  }));
  await Scenario.bulkWrite(ops);
  console.log('✅ Scenarios seeded/updated');
}

module.exports = { seedScenarios };

/**
 * CLI standalone:
 * אם מריצים ישירות: node seed/seedScenarios.js
 * במצב הזה בלבד נפתח/נסגור חיבור.
 */
if (require.main === module) {
  (async () => {
    try {
      const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/modular_skills';
      await mongoose.connect(uri);
      await seedScenarios();
    } catch (e) {
      console.error('❌ seedScenarios error:', e);
      process.exitCode = 1;
    } finally {
      await mongoose.disconnect();
    }
  })();
}