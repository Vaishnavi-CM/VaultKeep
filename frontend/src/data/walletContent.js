// Grounded in real, reported wallet design pain points (not just guesses)
// -- see the conversation notes for sourcing. Used on the Wallet Design page.

export const problemsAndSolutions = [
  {
    problem: "Quick-access ID vs. security",
    detail: "Cards need to be held firmly enough that they don't slip out in a crowded bus or bag — but that same tight fit makes them slow and fiddly to pull out fast, exactly when you need your ID quickest.",
    solution: "A dedicated pull-tab slot",
    solutionDetail: "One slot with a small fabric tab attached to the card, so a single quick pull frees it — security when it sits still, speed when you need it.",
  },
  {
    problem: "\"One wallet fits all\" bulk",
    detail: "Most wallets are designed around a single carrying habit — a back pocket — which forces a bulky compromise for anyone who carries differently (a bag, a front pocket, a clutch).",
    solution: "Separate form factors by carrying style",
    solutionDetail: "A slim, minimal design for pocket carry, and a flatter, wider layout for bag carry — same core idea, shaped around how it's actually held.",
  },
  {
    problem: "No visual organization",
    detail: "Cash, cards, IDs, and receipts often end up in one undifferentiated stack, so finding the right card means flipping through all of them.",
    solution: "Color-coded, categorized sections",
    solutionDetail: "Distinct sections for payment cards, ID, transit, and loyalty cards — a physical version of how a good app groups things by category.",
  },
  {
    problem: "Contactless card skimming",
    detail: "Cards with tap-to-pay chips can, in theory, be read by a nearby scanner without ever being removed from the wallet.",
    solution: "A shielded compartment",
    solutionDetail: "A lined pocket that blocks the wireless signal for your most sensitive cards, while everyday cards stay in normal slots.",
  },
  {
    problem: "Losing a wallet loses everything at once",
    detail: "Cash, every card, and ID all disappear in a single moment if a wallet is lost or stolen — no partial recovery, no backup copy.",
    solution: "A companion digital vault",
    solutionDetail: "This is exactly the gap VaultKeep fills for your passwords: if a physical wallet is lost, cards can be frozen and reissued — but a leaked or lost password often can't be 'reissued' at all, which is why a proper vault matters even more.",
  },
];

export const journalStages = [
  { key: "empathize", label: "Empathize", prompt: "What did you learn interviewing your partner? What frustrations, habits, or workarounds did they mention about how they use their wallet or purse?" },
  { key: "define", label: "Define", prompt: "Boil it down to one clear problem statement. What's the real need behind what they told you?" },
  { key: "ideate", label: "Ideate", prompt: "Brainstorm freely — what are several different ways this problem could be solved? Don't filter yet." },
  { key: "prototype", label: "Prototype", prompt: "Describe your sketch or concept. What does it look like, what are its key features, and why?" },
  { key: "test", label: "Test", prompt: "How did you present it back? What feedback did you get, and what would you change next?" },
];
