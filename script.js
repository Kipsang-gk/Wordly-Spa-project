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
const audioPlayback = document.getElementById('audioPlayback');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const word = searchField.value.trim();

  if (!word) {
    definition.textContent = 'Please enter a word to search.';
    return;
  }

  definition.textContent = 'Searching...';
  synonymsAntonyms.value = '';
  audioPlayback.value = '';

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Word not found.');
    }

    const entry = data[0];
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
    const audioPlayer = document.getElementById('audioControl');
    const audioSource = document.getElementById('audioSource');

    audioSource.src = audioUrl || '';
    audioPlayer.load();
  } catch (error) {
    definition.textContent = `Lookup failed: ${error.message}`;
  }
});



// let searchField = document.getElementById('searchBox');
// searchField.addEventListener('input', (event) => {
//   // Handle search input changes
// });

// let submitButton = document.getElementById('submitBtn');
// submitButton.addEventListener('click', (event) => {
//   event.preventDefault();
//   let searchTerm = searchField.value.trim();
//   if (searchTerm) {
//     // Perform search operation with searchTerm
//     console.log(`Searching for: ${searchTerm}`);
//   } else {
//     console.log('Please enter a word to search.');
//   }
// });

// let wordDescription = document.getElementById('definition-container');
// wordDescription.addEventListener()

// function displayWordDescription(word) {
//   // Fetch and display the word description
//   // This is a placeholder for the actual implementation
//   wordDescription.textContent = `Description for ${word}`;
// };

// let savedWordsField = document.getElementById('savedWords');
// savedWordsField.addEventListener()

// function displaySavedWords(words) {
//   // Display saved words in the input field
//   savedWordsField.textContent = words.join(', ');
// };


// let synonymsAntonymsField = document.getElementById('synonymsAntonyms');
// synonymsAntonymsField.addEventListener()

// function displaySynonymsAntonyms(synonyms, antonyms) {
//   // Display synonyms and antonyms in the input field
//   synonymsAntonymsField.textContent = `Synonyms: ${synonyms.join(', ')} | Antonyms: ${antonyms.join(', ')}`;
// };


// let audioPlaybackField = document.getElementById('audioPlayback');
// audioPlaybackField.addEventListener()

// //function to prevent the default behavior of the form submission
// let searchQuery = getElementById('submitBtn')
// searchQuery.addEventListener('click', )


// // Function to fetch data from the dictionary API
// fetch('https://dictionaryapi.dev')
//   .then(response => response.json())
//   .then(data => console.log(data))
//   .catch(error => console.error('Error:', error));
