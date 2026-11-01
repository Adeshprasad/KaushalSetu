/**
 * Speech Recognition Helper Utility
 * 
 * Provides deduplication, boundary overlap resolution, and robust multi-event
 * assembly for Web Speech API transcription across desktop and mobile browsers
 * (especially fixing known Android Chrome duplicated phrases and cumulative results).
 */

// Common linguistic reduplications in Indian languages that are grammatically intentional
// (e.g., "कभी कभी", "धीरे धीरे", "बार बार", "साथ साथ")
const LEGITIMATE_REDUPLICATIONS = new Set([
  'कभी',
  'धीरे',
  'साथ',
  'बार',
  'अलग',
  'थोड़ा',
  'थोडे',
  'कम',
  'नए',
  'नई',
  'जल्दी',
  'रोज',
  'पास',
  'दूर',
  'बार-बार',
  'कभी-कभी',
  'अलग-अलग',
  'धीरे-धीरे',
  'साथ-साथ'
]);

/**
 * Removes consecutive duplicate words caused by speech recognition audio frame stutter
 * (e.g., "वेल्डिंग वेल्डिंग" -> "वेल्डिंग", "repair repair" -> "repair"),
 * while preserving legitimate linguistic reduplications.
 */
export function removeImmediateDuplicateWords(text: string): string {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= 1) return text.trim();

  const cleaned: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const current = words[i];
    const prev = cleaned[cleaned.length - 1];

    if (prev && current.toLowerCase() === prev.toLowerCase()) {
      // Check if it's an intentional linguistic reduplication
      if (LEGITIMATE_REDUPLICATIONS.has(current)) {
        cleaned.push(current);
        continue;
      }
      // Otherwise skip the duplicate word
      continue;
    }
    cleaned.push(current);
  }

  return cleaned.join(' ');
}

/**
 * Merges two phrases seamlessly without duplicate words or overlapping boundaries.
 * Handles cases where:
 * 1. Both phrases are identical
 * 2. Right phrase already contains left phrase as prefix (common in mobile Chrome)
 * 3. Left phrase ends with right phrase
 * 4. Word-level overlap at the boundary (e.g. left ends with "X Y" and right starts with "X Y Z")
 */
export function mergeTwoPhrases(left: string, right: string): string {
  const l = (left || '').trim();
  const r = (right || '').trim();

  if (!l) return r;
  if (!r) return l;

  const lLower = l.toLowerCase();
  const rLower = r.toLowerCase();

  // 1. Exact match
  if (lLower === rLower) return l;

  // 2. Right phrase already subsumes the left phrase completely
  // (e.g., Left: "मुझे वेल्डिंग आता है", Right: "मुझे वेल्डिंग आता है और बाइक रिपेयर")
  if (rLower.startsWith(lLower)) {
    return r;
  }

  // 3. Left phrase already ends with the right phrase
  if (lLower.endsWith(rLower)) {
    return l;
  }

  // 4. Check for multi-word boundary overlap
  const wordsL = l.split(/\s+/);
  const wordsR = r.split(/\s+/);

  const maxCheck = Math.min(wordsL.length, wordsR.length, 12);
  let overlapWordCount = 0;

  for (let count = maxCheck; count >= 1; count--) {
    const suffixL = wordsL.slice(wordsL.length - count).map(w => w.toLowerCase()).join(' ');
    const prefixR = wordsR.slice(0, count).map(w => w.toLowerCase()).join(' ');

    if (suffixL === prefixR) {
      overlapWordCount = count;
      break;
    }
  }

  if (overlapWordCount > 0) {
    const remainingR = wordsR.slice(overlapWordCount).join(' ');
    return remainingR ? `${l} ${remainingR}` : l;
  }

  return `${l} ${r}`;
}

/**
 * Processes a Web Speech API SpeechRecognitionEvent to assemble a single, clean,
 * non-duplicated transcript string from all final and interim results.
 */
export function processSpeechEvent(event: any): {
  fullText: string;
  finalText: string;
  interimText: string;
} {
  if (!event || !event.results || event.results.length === 0) {
    return { fullText: '', finalText: '', interimText: '' };
  }

  let accumulatedFinal = '';
  let accumulatedInterim = '';

  for (let i = 0; i < event.results.length; i++) {
    const res = event.results[i];
    if (!res || !res[0]) continue;
    const piece = (res[0].transcript || '').trim();
    if (!piece) continue;

    if (res.isFinal) {
      accumulatedFinal = mergeTwoPhrases(accumulatedFinal, piece);
    } else {
      accumulatedInterim = accumulatedInterim
        ? mergeTwoPhrases(accumulatedInterim, piece)
        : piece;
    }
  }

  // Merge final and interim transcripts
  let combined = '';
  if (accumulatedFinal && accumulatedInterim) {
    combined = mergeTwoPhrases(accumulatedFinal, accumulatedInterim);
  } else {
    combined = accumulatedFinal || accumulatedInterim;
  }

  // Deduplicate any consecutive identical words
  const fullText = removeImmediateDuplicateWords(combined);
  const cleanFinal = removeImmediateDuplicateWords(accumulatedFinal);
  const cleanInterim = removeImmediateDuplicateWords(accumulatedInterim);

  return {
    fullText,
    finalText: cleanFinal,
    interimText: cleanInterim
  };
}
