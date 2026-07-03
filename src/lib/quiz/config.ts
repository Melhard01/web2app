import type { QuizConfig } from "./types";

/**
 * ───────────────────────────────────────────────────────────────────────────
 * EpiMinded — "Strategic Profile" quiz (real content).
 * ───────────────────────────────────────────────────────────────────────────
 * 6 scored questions (keys: scout · analyst · operator · seeker) + 1 role
 * question (not scored). The engine renders, scores, and reports from this
 * object only. Options are presented shuffled (see QuizEngine).
 * ───────────────────────────────────────────────────────────────────────────
 */
export const QUIZ: QuizConfig = {
  id: "epiminded-strategic-posture-v1",
  title: "Find your",
  titleEmphasis: "strategic profile",
  subtitle:
    "Seven questions on how you read change, make the call, and stay ahead of what is coming. Two minutes. You get the profile that defines how you operate, the blind spot holding you back, and the room that would sharpen you.",
  meta: "7 questions · about 2 minutes · for founders, CEOs, and operators",
  priority: ["seeker", "scout", "analyst", "operator"],
  tieBreakQuestions: ["q2", "q6"],
  questions: [
    {
      id: "q1",
      scoring: true,
      text: "When a new trend or signal shows up in your field, you tend to:",
      options: [
        { label: "Jump in and test it early", key: "scout" },
        { label: "Dig into the data before reacting", key: "analyst" },
        { label: "Stay focused on what is already working", key: "operator" },
        { label: "Sense it matters but not know how to act on it", key: "seeker" },
      ],
    },
    {
      id: "q2",
      scoring: true,
      text: "A competitor you have never heard of takes 20% of your market in three months. Your first move:",
      options: [
        { label: "Move fast and test a counter right away", key: "scout" },
        { label: "Pull the data and understand it fully before acting", key: "analyst" },
        { label: "Hold the course and not chase every threat", key: "operator" },
        { label: "Feel the ground shift but not know the next move", key: "seeker" },
      ],
    },
    {
      id: "q3",
      scoring: true,
      text: "How do you usually catch what is coming before it is obvious?",
      options: [
        { label: "Conversations across a wide, varied network", key: "scout" },
        { label: "Tracking data, metrics, and competitors", key: "analyst" },
        { label: "Experience and a playbook that has worked before", key: "operator" },
        { label: "I take in a lot but have no real method", key: "seeker" },
      ],
    },
    {
      id: "q4",
      scoring: true,
      text: "When you face a hard call, who do you pressure-test it with?",
      options: [
        { label: "A wide circle I can tap quickly", key: "scout" },
        { label: "Mostly my own analysis", key: "analyst" },
        { label: "My gut and my track record, I decide alone", key: "operator" },
        { label: "Mostly alone, and I wish I had the right room", key: "seeker" },
      ],
    },
    {
      id: "q5",
      scoring: true,
      text: "If you could add one thing to how you operate, it would be:",
      options: [
        { label: "Sharper peers who challenge my thinking", key: "scout" },
        { label: "Earlier, clearer sight of signals", key: "analyst" },
        { label: "A faster way to turn insight into results", key: "operator" },
        { label: "A method to cut the noise and actually act", key: "seeker" },
      ],
    },
    {
      id: "q6",
      scoring: true,
      text: "Be honest, your biggest blind spot right now is probably:",
      options: [
        { label: "I start more than I finish", key: "scout" },
        { label: "I overanalyze and decide too late", key: "analyst" },
        { label: "I may be optimizing something the market is leaving behind", key: "operator" },
        { label: "I understand more than I act on", key: "seeker" },
      ],
    },
    {
      id: "role",
      scoring: false,
      text: "Last one. What is your role?",
      options: [
        { label: "Founder", key: "founder" },
        { label: "Co-founder", key: "cofounder" },
        { label: "CEO or General Manager", key: "ceo" },
        { label: "Entrepreneur or Solopreneur", key: "solo" },
        { label: "Other", key: "other" },
      ],
    },
  ],
  profiles: {
    scout: {
      key: "scout",
      name: "The Scout",
      mantra: "“I move early, even on half-signals.”",
      result:
        "You see it first. You also start ten things and finish three. Your matched cohort is the discipline you will not give yourself.",
      exposed:
        "Speed without a thread. Many parallel bets, weak prioritisation, little long-term memory.",
      cohort:
        "A daily thinking ritual to hold the signal, and steadier, more analytical peers matched to stress-test your best bets.",
    },
    analyst: {
      key: "analyst",
      name: "The Analyst",
      mantra: "“I decide with evidence, not noise.”",
      result:
        "You have more data than anyone in the room and you are still last to decide. Peers are the forcing function that turns your analysis into a move.",
      exposed:
        "Analysis paralysis. The search for certainty delays the call while the window closes.",
      cohort:
        "A five-minute structured read each day, and faster-moving peers matched to push you to act before perfect certainty.",
    },
    operator: {
      key: "operator",
      name: "The Operator",
      mantra: "“I run what works.”",
      result:
        "Your playbook is your strength until the market rewrites the rules without telling you. Your cohort is the radar that warns you first.",
      exposed:
        "Strategic myopia. The risk of optimising a playbook the market is quietly leaving behind.",
      cohort:
        "An early-warning radar of peers matched to flag the shifts your playbook ignores, before they cost you.",
    },
    seeker: {
      key: "seeker",
      name: "The Seeker",
      mantra: "“I can feel it shifting. I am missing the method.”",
      result:
        "You are not behind on information. You are behind on a method and a room. That is exactly what this is.",
      exposed:
        "Over-information. A gap between understanding and action, where insight rarely lands as a decision.",
      cohort:
        "A clear daily method, and peers matched to pull you out of consumption and into motion.",
    },
  },
};
