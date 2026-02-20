import words from "../words.txt?raw";

// Create a Set from the words file, splitting by newlines and filtering out empty lines
export const dictionary = new Set(
  words
    .split("\n")
    .map((word) => word.trim().toUpperCase())
    .filter((word) => word.length > 0)
);

// Function to get all n-grams from a word
function getNGrams(n: number, word: string): Set<string> {
  const ngrams = new Set<string>();
  for (let i = 0; i < word.length - (n-1); i++) {
    ngrams.add(word.slice(i, i + n));
  }
  return ngrams;
}


// Create a map from trigram to words containing that trigram
export const bigramsToWords = new Map<string, Set<string>>();

// Populate the trigram map
for (const word of dictionary) {
  const trigrams = getNGrams(2, word);
  for (const trigram of trigrams) {
    if (!bigramsToWords.has(trigram)) {
      bigramsToWords.set(trigram, new Set());
    }
    bigramsToWords.get(trigram)!.add(word);
  }
}

// Create a map from trigram to words containing that trigram
export const trigramToWords = new Map<string, Set<string>>();

// Populate the trigram map
for (const word of dictionary) {
  const trigrams = getNGrams(3,word);
  for (const trigram of trigrams) {
    if (!trigramToWords.has(trigram)) {
      trigramToWords.set(trigram, new Set());
    }
    trigramToWords.get(trigram)!.add(word);
  }
}

export const easyBigrams = new Set(
  Array.from(bigramsToWords.entries())
    .sort((a, b) => b[1].size - a[1].size) // Sort by word count in descending order
    .slice(0, 250) // Take top 250
    .map(([bigram]) => bigram) // Extract just the trigrams
);

// Create a set of easy trigrams (top 250 by word count)
export const easyTrigrams = new Set(
  Array.from(trigramToWords.entries())
    .sort((a, b) => b[1].size - a[1].size) // Sort by word count in descending order
    .slice(0, 250) // Take top 250
    .map(([trigram]) => trigram) // Extract just the trigrams
);
