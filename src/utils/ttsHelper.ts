/**
 * Web Speech API Text-to-Speech (TTS) Helper
 * Provides accessible audio readout for blue-collar workers and rural job seekers.
 */

let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeSpeakerId: string | null = null;
let activeListeners: Set<(speakerId: string | null) => void> = new Set();

export const subscribeSpeakerState = (callback: (speakerId: string | null) => void) => {
  activeListeners.add(callback);
  callback(activeSpeakerId);
  return () => {
    activeListeners.delete(callback);
  };
};

const notifyListeners = (speakerId: string | null) => {
  activeSpeakerId = speakerId;
  activeListeners.forEach(listener => listener(speakerId));
};

export const speakJobOrScheme = (
  speakerId: string,
  text: string,
  language: string = 'hi'
) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  // If already speaking the same card, toggle off (pause/stop)
  if (activeSpeakerId === speakerId) {
    stopSpeaking();
    return false;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  // Select regional voice code
  if (language === 'hi') {
    utterance.lang = 'hi-IN';
  } else if (language === 'bn') {
    utterance.lang = 'bn-IN';
  } else if (language === 'ta') {
    utterance.lang = 'ta-IN';
  } else if (language === 'or') {
    utterance.lang = 'or-IN';
  } else {
    utterance.lang = 'en-IN';
  }

  utterance.onstart = () => {
    notifyListeners(speakerId);
  };

  utterance.onend = () => {
    notifyListeners(null);
    activeUtterance = null;
  };

  utterance.onerror = () => {
    notifyListeners(null);
    activeUtterance = null;
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
};

export const stopSpeaking = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  notifyListeners(null);
  activeUtterance = null;
};
