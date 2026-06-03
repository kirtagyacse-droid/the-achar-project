export interface QuizQuestion {
  id: number;
  question: string;
  subtitle: string;
  options: { label: string; value: string }[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "How spicy do you like it?",
    subtitle: "Select your preferred heat tolerance level.",
    options: [
      { label: "Mild · Gentle warmth", value: "mild" },
      { label: "Medium · Balanced kick", value: "medium" },
      { label: "Bold · Noticeable heat", value: "bold" },
      { label: "Fiery · Pure excitement", value: "fiery" }
    ]
  },
  {
    id: 2,
    question: "What's your flavor mood?",
    subtitle: "Choose the flavor notes you crave today.",
    options: [
      { label: "Tangy & Bright · Sour citrus notes", value: "tangy" },
      { label: "Rich & Savory · Textured & spiced", value: "savory" },
      { label: "Sweet & Mild · Dessert-like sour sweet", value: "sweet" },
      { label: "Sharp & Pungent · Unique traditional recipe", value: "pungent" }
    ]
  },
  {
    id: 3,
    question: "What are you pairing it with?",
    subtitle: "Pick your favorite meal combination.",
    options: [
      { label: "Dal & Rice · Classic comfort food", value: "rice" },
      { label: "Paratha & Roti · Traditional flatbreads", value: "bread" },
      { label: "Snacks & Chaat · Crispy samosas & mathris", value: "snacks" },
      { label: "Everything · I put pickle on everything!", value: "everything" }
    ]
  }
];

// Returns the name of the recommended product based on answer keys
export function getRecommendedPickleName(answers: Record<number, string>): string {
  const spice = answers[1]; // mild, medium, bold, fiery
  const mood = answers[2];  // tangy, savory, sweet, pungent
  const pair = answers[3];  // rice, bread, snacks, everything

  // Fiery levels always recommend Green Chili
  if (spice === 'fiery') {
    return 'Teekhi Hari Mirch';
  }

  // Sweet cravings
  if (mood === 'sweet') {
    return 'Keri ka Meetha';
  }

  // Mild citrus cravings
  if (spice === 'mild' && mood === 'tangy') {
    return 'Nimbu Khatta Meetha';
  }

  // Rare traditional delicacies
  if (mood === 'pungent') {
    return 'Lehsua';
  }

  // Savory textured combinations
  if (mood === 'savory') {
    if (pair === 'bread') {
      return 'Keri with Onion';
    }
    if (pair === 'snacks') {
      return 'Keri with Kabuli Chana';
    }
    return 'Keri with Desi Chana';
  }

  // Specific pairings fallback
  if (pair === 'snacks') {
    return 'Nimbu Khatta Meetha';
  }

  // Default classic sour mango pickle
  return 'Keri ka Khatta';
}
