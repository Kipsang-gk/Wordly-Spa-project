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
const audioPlayer = document.getElementById('audioControl');
const audioSource = document.getElementById('audioSource');
const saveWordButton = document.getElementById('saveWordButton');
const savedWordsList = document.getElementById('savedWords');
const savedWordsEmpty = document.getElementById('savedWordsEmpty');
const savedWordsStatus = document.getElementById('savedWordsStatus');
const savedWordsStorageKey = 'wordly-saved-words';

let currentWord = '';
let savedWords = [];

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
}

function saveWord(word) {
  if (savedWords.some((savedWord) => savedWord.toLowerCase() === word.toLowerCase())) {
    return;
  }

  savedWords.push(word);
  renderSavedWords();
  updateSaveButton();

  if (persistSavedWords()) {
    savedWordsStatus.textContent = `"${word}" saved.`;
  }
}

function removeSavedWord(word) {
  savedWords = savedWords.filter((savedWord) => savedWord.toLowerCase() !== word.toLowerCase());
  renderSavedWords();
  updateSaveButton();
  if (persistSavedWords()) {
    savedWordsStatus.textContent = `"${word}" removed from saved words.`;
  }
}

renderSavedWords();
updateSaveButton();

saveWordButton.addEventListener('click', () => {
  if (currentWord) {
    saveWord(currentWord);
  }
});

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
    definition.textContent = 'Please enter a word to search.';
    currentWord = '';
    updateSaveButton();
    return;
  }

  currentWord = '';
  updateSaveButton();
  definition.textContent = 'Searching...';
  synonymsAntonyms.textContent = '';
  audioSource.src = '';
  audioPlayer.load();

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Word not found.');
    }

    const entry = data[0];
    currentWord = entry.word;
    const meanings = entry.meanings ?? [];

    const definitions = meanings.flatMap((meaning) =>
      (meaning.definitions ?? []).map(
        (item) => `${meaning.partOfSpeech}: ${item.definition}`
      )
    );

    definition.textContent = definitions.length
      ? definitions.join(' ')
      : `No definition was provided for "${entry.word}".`;

    const synonyms = [
      ...new Set(meanings.flatMap((meaning) => meaning.synonyms ?? []))
    ];
    const antonyms = [
      ...new Set(meanings.flatMap((meaning) => meaning.antonyms ?? []))
    ];

    synonymsAntonyms.textContent =
      `Synonyms: ${synonyms.join(', ') || 'None listed'} | ` +
      `Antonyms: ${antonyms.join(', ') || 'None listed'}`;

    const audioUrl = entry.phonetics?.find((item) => item.audio)?.audio;

    audioSource.src = audioUrl || '';
    audioPlayer.load();
    updateSaveButton();
  } catch (error) {
    currentWord = '';
    updateSaveButton();
    definition.textContent = `Lookup failed: ${error.message}`;
  }
});
