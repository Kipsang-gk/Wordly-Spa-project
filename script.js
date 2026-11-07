//Function to change the theme of the webpage
const changeThemeButton = document.getElementById('changeTheme');
changeThemeButton.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  document.body.classList.toggle('light-theme');
});

const form = document.getElementById('formData');
const searchField = document.getElementById('searchBox');
const definition = document.getElementById('definition-container');
const synonymsAntonyms = document.getElementById('synonymsAntonyms');
const saveWordButton = document.getElementById('saveWordButton');
const playWordButton = document.getElementById('playWordButton');
const pronunciationStatus = document.getElementById('pronunciationStatus');
const savedWordsList = document.getElementById('savedWords');
const savedWordsEmpty = document.getElementById('savedWordsEmpty');
const savedWordsStatus = document.getElementById('savedWordsStatus');
const savedWordsStorageKey = 'wordly-saved-words';

let currentWord = '';
let savedWords = [];
let activeSearchId = 0;
let activeSearchController = null;
let currentAudioUrl = '';
let currentDefinitionText = '';
let wordAudio = null;
let wordUtterance = null;

function getLookupErrorMessage(error) {
  if (
    error instanceof TypeError ||
    /failed to fetch|networkerror|load failed/i.test(error.message || '')
  ) {
    return 'Could not connect to the dictionary. Check your internet connection and try again.';
  }

  return error.message || 'The search could not be completed. Please try again.';
}

try {
  const storedWords = JSON.parse(localStorage.getItem(savedWordsStorageKey) || '[]');
  if (Array.isArray(storedWords) && storedWords.every((word) => typeof word === 'string')) {
    savedWords = storedWords;
  } else {
    savedWordsStatus.textContent = 'Saved words could not be loaded because the stored data is invalid.';
  }
} catch (error) {
  savedWordsStatus.textContent = `Saved words could not be loaded: ${error.message}`;
}

function renderSavedWords() {
  savedWordsList.replaceChildren();
  savedWordsEmpty.hidden = savedWords.length > 0;

  savedWords.forEach((word) => {
    const item = document.createElement('li');
    item.className = 'flex items-center justify-between gap-2';

    const lookupButton = document.createElement('button');
    lookupButton.type = 'button';
    lookupButton.dataset.word = word;
    lookupButton.className = 'text-blue-700 underline hover:text-blue-900';
    lookupButton.textContent = word;

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.dataset.removeWord = word;
    removeButton.className = 'text-sm text-red-700 hover:text-red-900';
    removeButton.textContent = 'Remove';
    removeButton.setAttribute('aria-label', `Remove ${word} from saved words`);

    item.append(lookupButton, removeButton);
    savedWordsList.append(item);
  });
}

function persistSavedWords() {
  try {
    localStorage.setItem(savedWordsStorageKey, JSON.stringify(savedWords));
    return true;
  } catch (error) {
    savedWordsStatus.textContent = `Saved words are only available until you close this page: ${error.message}`;
    return false;
  }
}

function updateSaveButton() {
  const isSaved = savedWords.some((word) => word.toLowerCase() === currentWord.toLowerCase());
  saveWordButton.disabled = !currentWord || isSaved;
  saveWordButton.textContent = isSaved ? 'Word saved' : 'Save word';
  playWordButton.disabled = !currentWord;
}

function stopWordPlayback() {
  if (wordAudio) {
    const audio = wordAudio;
    wordAudio = null;
    audio.pause();
    audio.currentTime = 0;
  }
  if (wordUtterance) {
    wordUtterance = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

function speakText(text, onComplete) {
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    pronunciationStatus.textContent = 'Spoken definition playback is not supported by this browser.';
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  wordUtterance = utterance;
  utterance.lang = 'en-US';
  utterance.onend = () => {
    if (wordUtterance !== utterance) return;
    wordUtterance = null;
    onComplete();
  };
  utterance.onerror = () => {
    if (wordUtterance !== utterance) return;
    wordUtterance = null;
    pronunciationStatus.textContent = 'Could not play this word. Please try again.';
  };
  window.speechSynthesis.speak(utterance);
  pronunciationStatus.textContent = 'Playing word and definition.';
}

async function playCurrentWord() {
  if (!currentWord) return;

  const word = currentWord;
  const spokenDefinition = currentDefinitionText
    ? `Definition: ${currentDefinitionText}`
    : 'No definition was provided.';
  stopWordPlayback();
  pronunciationStatus.textContent = '';

  if (!currentAudioUrl) {
    speakText(`${word}. ${spokenDefinition}`, () => {
      pronunciationStatus.textContent = '';
    });
    return;
  }

  const audio = new Audio(currentAudioUrl);
  wordAudio = audio;
  audio.addEventListener('ended', () => {
    if (wordAudio === audio) {
      wordAudio = null;
      speakText(spokenDefinition, () => {
        pronunciationStatus.textContent = '';
      });
    }
  }, { once: true });
  audio.addEventListener('error', () => {
    if (wordAudio !== audio) return;
    wordAudio = null;
    speakText(`${word}. ${spokenDefinition}`, () => {
      pronunciationStatus.textContent = '';
    });
  }, { once: true });

  try {
    await audio.play();
    if (wordAudio !== audio) return;
    pronunciationStatus.textContent = `Playing "${word}", then its definition.`;
  } catch {
    if (wordAudio !== audio) return;
    wordAudio = null;
    speakText(`${word}. ${spokenDefinition}`, () => {
      pronunciationStatus.textContent = '';
    });
  }
}

function updateSavedWords(status) {
  renderSavedWords();
  updateSaveButton();
  if (persistSavedWords()) savedWordsStatus.textContent = status;
}

function saveWord(word) {
  if (savedWords.some((savedWord) => savedWord.toLowerCase() === word.toLowerCase())) return;
  savedWords.push(word);
  updateSavedWords(`"${word}" saved.`);
}

function removeSavedWord(word) {
  savedWords = savedWords.filter((savedWord) => savedWord.toLowerCase() !== word.toLowerCase());
  updateSavedWords(`"${word}" removed from saved words.`);
}

renderSavedWords();
updateSaveButton();

saveWordButton.addEventListener('click', () => {
  if (currentWord) {
    saveWord(currentWord);
  }
});

playWordButton.addEventListener('click', playCurrentWord);

savedWordsList.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  if (button.dataset.word) {
    searchField.value = button.dataset.word;
    form.requestSubmit();
  } else if (button.dataset.removeWord) {
    removeSavedWord(button.dataset.removeWord);
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const word = searchField.value.trim();

  if (!word) {
    stopWordPlayback();
    definition.textContent = 'Please enter a word to search.';
    currentWord = '';
    currentAudioUrl = '';
    currentDefinitionText = '';
    updateSaveButton();
    pronunciationStatus.textContent = '';
    return;
  }

  activeSearchController?.abort();
  stopWordPlayback();

  const searchWord = word.toLowerCase();

  const requestId = ++activeSearchId;
  activeSearchController = new AbortController();
  currentWord = '';
  currentAudioUrl = '';
  currentDefinitionText = '';
  updateSaveButton();
  pronunciationStatus.textContent = '';
  definition.textContent = 'Searching...';
  synonymsAntonyms.textContent = '';

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(searchWord)}`,
      { signal: activeSearchController.signal }
    );

    if (requestId !== activeSearchId) return;
    if (response.status === 404) {
      throw new Error(`No dictionary entry was found for "${word}". Check the spelling and try again.`);
    }
    if (!response.ok) {
      throw new Error('The dictionary service is temporarily unavailable. Please try again.');
    }

    const data = await response.json();
    const entry = Array.isArray(data) ? data[0] : null;
    if (!entry || typeof entry !== 'object') {
      throw new Error('The dictionary returned an unexpected response. Please try again.');
    }

    currentWord = entry.word || searchWord;
    const phonetics = Array.isArray(entry.phonetics) ? entry.phonetics : [];
    const audioUrl = phonetics.map((phonetic) => phonetic.audio).find(
      (audio) => typeof audio === 'string' && audio.trim()
    );
    currentAudioUrl = audioUrl
      ? `${audioUrl.startsWith('//') ? 'https:' : ''}${audioUrl}`
      : '';
    const meanings = Array.isArray(entry.meanings) ? entry.meanings : [];
    const definitions = meanings.flatMap((meaning) =>
      (Array.isArray(meaning.definitions) ? meaning.definitions : []).map(
        (item) => `${meaning.partOfSpeech || 'Definition'}: ${item.definition || 'No definition provided.'}`
      )
    );
    const synonyms = [...new Set(meanings.flatMap((meaning) => Array.isArray(meaning.synonyms) ? meaning.synonyms : []))];
    const antonyms = [...new Set(meanings.flatMap((meaning) => Array.isArray(meaning.antonyms) ? meaning.antonyms : []))];

    currentDefinitionText = definitions.length
      ? definitions.join(' ')
      : `No definition was provided for "${currentWord}".`;
    definition.textContent = currentDefinitionText;
    synonymsAntonyms.textContent =
      `Synonyms: ${synonyms.join(', ') || 'None listed'} | ` +
      `Antonyms: ${antonyms.join(', ') || 'None listed'}`;
    updateSaveButton();
  } catch (error) {
    if (error.name === 'AbortError') {
      return;
    }

    if (requestId !== activeSearchId) {
      return;
    }

    currentWord = '';
    currentAudioUrl = '';
    currentDefinitionText = '';
    updateSaveButton();
    definition.textContent = getLookupErrorMessage(error);
  } finally {
    if (activeSearchController && requestId === activeSearchId) {
      activeSearchController = null;
    }
  }
});
