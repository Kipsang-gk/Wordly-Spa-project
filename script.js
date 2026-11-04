//Function to change the theme of the webpage
const changeThemeButton = document.getElementById('changeTheme');
changeThemeButton.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  document.body.classList.toggle('light-theme');
});

// Function to search for a word in the dictionary API
const initializeWordSearch = () => {
  const searchInput = document.getElementById('searchbox');
  searchInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchWord();
    }
  });
};

function displayWordData(data) {
  const resultContainer = document.getElementById('resultContainer');
  resultContainer.innerHTML = ''; // Clear previous results

  if (data && data.length > 0) {
    const wordData = data[0];
    const word = wordData.word;
    const phonetics = wordData.phonetics.map(p => p.text).join(', ');
    const meanings = wordData.meanings.map(meaning => {
      const definitions = meaning.definitions.map(def => `<li>${def.definition}</li>`).join('');
      return `<h3>${meaning.partOfSpeech}</h3><ul>${definitions}</ul>`;
    }).join('');

    resultContainer.innerHTML = `
      <h2>${word}</h2>
      <p>Phonetics: ${phonetics}</p>
      ${meanings}
    `;
  } else {
    resultContainer.innerHTML = '<p>No results found.</p>';
  }
}

function searchWord() {
  let searchInput = document.getElementById("searchbox").value.trim();
  if (searchInput) {
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchInput}`)
      .then(response => response.json())
      .then(data => {
        displayWordData(data);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        const resultContainer = document.getElementById('resultContainer');
        resultContainer.innerHTML = '<p>Error fetching data. Please try again later.</p>';
      });
  } else {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = '<p>Please enter a word to search.</p>';
  }
}

// Initialize the word search functionality
initializeWordSearch();


// fetch("https://api.dictionaryapi.dev/api/v2/entries/en/<word>")
// .then(response => response.json(data))
// .then(data => {
//     console.log(data);
// })
// .catch(error => {
//     console.error("Error fetching data:", error);
// });

// function searchWord() {
//   let userInput = document.getElementById('searchbox').value;
//   userInput.value.addEventListener('keypress', function(event) {
//     if (event.key === 'Enter') {
//       event.preventDefault();
//       let searchInput = document.getElementById("searchbox").value;
//       fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchInput}`)
//         .then(response => response.json())
//         .then(data => {
//           console.log(data);
//           // You can add code here to display the data on the webpage
//         })
//         .catch(error => {
//           console.error("Error fetching data:", error);
//         }); 

// }

let searchInput = document.getElementById("searchIcon");
searchInput.addEventListener('click', searchWord);