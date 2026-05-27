// categorizeThoughts: splits brain dump text into three buckets using keyword logic
export function categorizeThoughts(text) {
  if (!text.trim()) {
    return { tomorrow: [], later: [], notYourProblem: [] };
  }

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const tomorrow = [];
  const later = [];
  const notYourProblem = [];

  // Keywords that indicate a time-sensitive or action-oriented thought
  const tomorrowKeywords = [
    "tomorrow",
    "need to",
    "have to",
    "must",
    "should",
    "call",
    "buy",
    "schedule",
    "plan",
    "meeting",
    "deadline",
    "submit",
    "finish",
    "complete",
    "email",
    "send",
    "pick up",
    "appointment",
    "remind",
    "due",
    "urgent",
    "asap",
  ];

  // Keywords/patterns that indicate worry or hypothetical thoughts
  const worryPatterns = ["what if", "what about", "worried", "afraid", "anxious"];

  for (const thought of lines) {
    const lower = thought.toLowerCase();

    // Questions or "what if" → NOT YOUR PROBLEM TONIGHT
    if (thought.includes("?") || worryPatterns.some((p) => lower.startsWith(p))) {
      notYourProblem.push(thought);
      continue;
    }

    // Time/action words → TOMORROW
    if (tomorrowKeywords.some((kw) => lower.includes(kw))) {
      tomorrow.push(thought);
      continue;
    }

    // Everything else → LATER
    later.push(thought);
  }

  return { tomorrow, later, notYourProblem };
}