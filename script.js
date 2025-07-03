// API key for OMDb API
// To get your free API key, visit: http://www.omdbapi.com/apikey.aspx
// Replace 'YOUR_API_KEY_HERE' with your actual API key
const API_KEY = 'e17213ce';
const API_URL = 'https://www.omdbapi.com/';

// Get references to HTML elements we'll need
const searchForm = document.getElementById('search-form');
const movieSearchInput = document.getElementById('movie-search');
const movieResultsContainer = document.getElementById('movie-results');
const watchlistContainer = document.getElementById('watchlist');
const toggleWatchlistBtn = document.getElementById('toggle-watchlist-btn');
const resultsSection = document.getElementById('results-section');
const watchlistSection = document.getElementById('watchlist-section');

// Modal elements
const modal = document.getElementById('movie-modal');
const modalClose = document.querySelector('.modal-close');

// Add event listener for mobile watchlist toggle
toggleWatchlistBtn.addEventListener('click', toggleMobileWatchlist);

// Add modal event listeners
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

// Add keyboard support for modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('show')) {
    closeModal();
  }
});

// Add touch gesture support for mobile modal
let startY = 0;
let currentY = 0;
let modalContent = document.querySelector('.modal-content');

modalContent.addEventListener('touchstart', (e) => {
  startY = e.touches[0].clientY;
}, { passive: true });

modalContent.addEventListener('touchmove', (e) => {
  if (!modal.classList.contains('show')) return;
  
  currentY = e.touches[0].clientY;
  const deltaY = currentY - startY;
  
  // Only allow downward swipes to close
  if (deltaY > 0) {
    const progress = Math.min(deltaY / 200, 1);
    modalContent.style.transform = `translateY(${deltaY}px)`;
    modal.style.opacity = 1 - (progress * 0.5);
  }
}, { passive: true });

modalContent.addEventListener('touchend', (e) => {
  if (!modal.classList.contains('show')) return;
  
  const deltaY = currentY - startY;
  
  if (deltaY > 100) {
    // Close modal if swiped down enough
    closeModal();
  } else {
    // Snap back to original position
    modalContent.style.transform = '';
    modal.style.opacity = '';
  }
}, { passive: true });

// Initialize footer visibility on page load
function initializeFooterVisibility() {
  // On mobile, footer should be hidden initially (search results are shown by default)
  if (window.innerWidth <= 768) {
    document.body.classList.remove('show-footer');
  }
}

// Call initialization function when page loads
initializeFooterVisibility();

// Also call on window resize to handle orientation changes
window.addEventListener('resize', initializeFooterVisibility);

// Function to toggle between search results and watchlist on mobile
function toggleMobileWatchlist() {
  const isWatchlistVisible = watchlistSection.classList.contains('show-mobile');
  
  if (isWatchlistVisible) {
    // Show search results, hide watchlist
    watchlistSection.classList.remove('show-mobile');
    resultsSection.classList.remove('hide-mobile');
    toggleWatchlistBtn.innerHTML = '<i class="fas fa-list-ul"></i> View Watchlist';
    // Hide footer when showing search results on mobile
    document.body.classList.remove('show-footer');
  } else {
    // Show watchlist, hide search results
    watchlistSection.classList.add('show-mobile');
    resultsSection.classList.add('hide-mobile');
    toggleWatchlistBtn.innerHTML = '<i class="fas fa-search"></i> Back to Search';
    // Show footer when showing watchlist on mobile
    document.body.classList.add('show-footer');
  }
}

// Array to store watchlist movies (prevents duplicates)
let watchlistMovies = [];

// Load watchlist from localStorage when page loads
function loadWatchlistFromStorage() {
  const savedWatchlist = localStorage.getItem('movieWatchlist');
  if (savedWatchlist) {
    watchlistMovies = JSON.parse(savedWatchlist);
    displayWatchlist();
  }
}

// Save watchlist to localStorage
function saveWatchlistToStorage() {
  localStorage.setItem('movieWatchlist', JSON.stringify(watchlistMovies));
}

// Load watchlist when page loads
loadWatchlistFromStorage();

// Popular search terms and franchises to find interesting movies
const popularSearchTerms = [
  // Major Franchises
  'Marvel', 'Batman', 'Star Wars', 'Harry Potter', 'Lord of the Rings',
  'Fast', 'Mission Impossible', 'James Bond', 'Transformers', 'Jurassic',
  'Avengers', 'Spider', 'Indiana Jones', 'Terminator', 'Alien',
  'X-Men', 'Superman', 'Wonder Woman', 'Iron Man', 'Captain America',
  'Thor', 'Guardians', 'Black Panther', 'Aquaman', 'Flash',
  
  // Popular Directors/Studios
  'Christopher Nolan', 'Steven Spielberg', 'Quentin Tarantino', 'Martin Scorsese',
  'Ridley Scott', 'James Cameron', 'Tim Burton', 'Wes Anderson',
  'Disney', 'Pixar', 'Studio Ghibli', 'DreamWorks',
  
  // Genre Keywords
  'Action', 'Comedy', 'Horror', 'Thriller', 'Romance', 'Adventure',
  'Drama', 'Fantasy', 'Science Fiction', 'Mystery', 'Crime',
  'War', 'Western', 'Musical', 'Animation', 'Documentary',
  
  // Popular Actors/Characters
  'John Wick', 'Sherlock Holmes', 'Pirates', 'Ocean', 'Matrix',
  'Bourne', 'Rocky', 'Rambo', 'Die Hard', 'Lethal Weapon',
  'Mad Max', 'Blade Runner', 'Godfather', 'Scarface', 'Casino',
  'Goodfellas', 'Taxi Driver', 'Pulp Fiction', 'Kill Bill',
  
  // Popular Movie Themes
  'Space', 'Robot', 'Zombie', 'Vampire', 'Werewolf', 'Monster',
  'Superhero', 'Spy', 'Heist', 'Race', 'Fighter', 'Assassin',
  'Detective', 'Cop', 'Soldier', 'Pilot', 'Doctor', 'Teacher',
  
  // Classic/Iconic Terms
  'King', 'Queen', 'Princess', 'Prince', 'Knight', 'Warrior',
  'Legend', 'Hero', 'Villain', 'Master', 'Secret', 'Lost',
  'Return', 'Rise', 'Fall', 'Dawn', 'Dark', 'Light',
  
  // Popular Franchises & Series
  'Fast Furious', 'John Wick', 'Taken', 'Expendables', 'Planet Apes',
  'Back Future', 'Men Black', 'Teenage Mutant', 'Power Rangers',
  'Hunger Games', 'Twilight', 'Fifty Shades', 'Divergent',
  
  // Animation & Family
  'Toy Story', 'Finding Nemo', 'Shrek', 'Ice Age', 'Madagascar',
  'Despicable Me', 'Minions', 'Frozen', 'Moana', 'Tangled',
  'Beauty Beast', 'Lion King', 'Aladdin', 'Little Mermaid',
  
  // Horror & Thriller
  'Halloween', 'Friday 13th', 'Nightmare Elm', 'Saw', 'Scream',
  'Conjuring', 'Insidious', 'Paranormal Activity', 'Final Destination',
  'Ring', 'Grudge', 'Exorcist', 'Psycho', 'Birds',
  
  // Comedy
  'American Pie', 'Hangover', 'Meet Parents', 'Dumb Dumber',
  'Austin Powers', 'Wayne World', 'Anchorman', 'Step Brothers',
  'Zoolander', 'Dodgeball', 'Wedding Crashers', 'Old School'
];

// Recent years to search for popular movies (expanded range)
const recentYears = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010];

// Function to get random movies from different search terms
async function getRandomMoviesFromSearch() {
  const movies = [];
  const usedSearchTerms = [];
  
  // Randomly select 5-8 search terms to use
  const numberOfTermsToUse = Math.floor(Math.random() * 4) + 5; // 5-8 terms
  
  // Shuffle the search terms array for randomness
  const shuffledTerms = [...popularSearchTerms].sort(() => Math.random() - 0.5);
  
  // Try to get movies from the randomly selected search terms
  while (movies.length < 15 && usedSearchTerms.length < numberOfTermsToUse && usedSearchTerms.length < shuffledTerms.length) {
    // Pick the next term from shuffled array
    const randomTerm = shuffledTerms[usedSearchTerms.length];
    usedSearchTerms.push(randomTerm);
    
    try {
      // Search for movies with this term
      const searchUrl = `${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(randomTerm)}&type=movie`;
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      if (data.Response === 'True' && data.Search) {
        // Randomly take 1-4 movies from this search to create variety
        const numberOfMoviesToTake = Math.floor(Math.random() * 4) + 1; // 1-4 movies
        const moviesToAdd = data.Search.slice(0, numberOfMoviesToTake);
        movies.push(...moviesToAdd);
      }
    } catch (error) {
      console.error(`Error searching for ${randomTerm}:`, error);
    }
  }
  
  return movies.slice(0, 12); // Return max 12 movies for more variety
}

// Function to get movies from recent years
async function getMoviesFromRecentYears() {
  const movies = [];
  
  // Pick 3-5 random years from recent years
  const numberOfYearsToUse = Math.floor(Math.random() * 3) + 3; // 3-5 years
  const selectedYears = [];
  
  // Randomly select years
  while (selectedYears.length < numberOfYearsToUse) {
    const randomYear = recentYears[Math.floor(Math.random() * recentYears.length)];
    if (!selectedYears.includes(randomYear)) {
      selectedYears.push(randomYear);
    }
  }
  
  // Expanded list of common words that appear in movie titles
  const commonWords = [
    'the', 'man', 'war', 'love', 'life', 'world', 'last', 'first', 'new', 'old',
    'great', 'big', 'little', 'good', 'bad', 'black', 'white', 'red', 'blue',
    'night', 'day', 'time', 'home', 'story', 'game', 'house', 'city', 'girl',
    'boy', 'woman', 'dead', 'live', 'true', 'lost', 'found', 'final', 'rise'
  ];
  
  // Search for movies from these years
  for (const year of selectedYears) {
    try {
      // Use 1-2 random words per year for variety
      const numberOfWordsToUse = Math.floor(Math.random() * 2) + 1; // 1-2 words
      
      for (let i = 0; i < numberOfWordsToUse; i++) {
        const randomWord = commonWords[Math.floor(Math.random() * commonWords.length)];
        
        const searchUrl = `${API_URL}?apikey=${API_KEY}&s=${randomWord}&y=${year}&type=movie`;
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        if (data.Response === 'True' && data.Search) {
          // Take 1-3 movies from this year/word combination
          const numberOfMoviesToTake = Math.floor(Math.random() * 3) + 1; // 1-3 movies
          movies.push(...data.Search.slice(0, numberOfMoviesToTake));
        }
      }
    } catch (error) {
      console.error(`Error searching for movies from ${year}:`, error);
    }
  }
  
  return movies;
}

// Function to load and display featured movies
async function loadFeaturedMovies() {
  // Check if API key is set
  if (API_KEY === 'YOUR_API_KEY_HERE') {
    movieResultsContainer.innerHTML = '<p>Please set your OMDb API key in script.js to load featured movies!</p>';
    return;
  }
  
  // Show loading message
  movieResultsContainer.innerHTML = '<p>Loading popular movies...</p>';
  
  // Update section title to indicate featured movies
  const resultsTitle = document.querySelector('#results-section h2');
  resultsTitle.innerHTML = '<i class="fas fa-fire"></i> Popular Movies';
  
  try {
    // Get movies from both methods
    const [franchiseMovies, recentMovies] = await Promise.all([
      getRandomMoviesFromSearch(),
      getMoviesFromRecentYears()
    ]);
    
    // Combine and shuffle the results
    const allMovies = [...franchiseMovies, ...recentMovies];
    
    // Remove duplicates based on IMDb ID
    const uniqueMovies = [];
    const seenIds = new Set();
    
    for (const movie of allMovies) {
      if (!seenIds.has(movie.imdbID)) {
        seenIds.add(movie.imdbID);
        uniqueMovies.push(movie);
      }
    }
    
    // Shuffle the array multiple times for better randomization
    for (let shuffle = 0; shuffle < 3; shuffle++) {
      for (let i = uniqueMovies.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [uniqueMovies[i], uniqueMovies[j]] = [uniqueMovies[j], uniqueMovies[i]];
      }
    }
    
    // Take 12-15 movies for more variety (randomize the number too)
    const numberOfMoviesToShow = Math.floor(Math.random() * 4) + 12; // 12-15 movies
    const finalMovies = uniqueMovies.slice(0, numberOfMoviesToShow);
    
    if (finalMovies.length > 0) {
      displayMovies(finalMovies);
    } else {
      movieResultsContainer.innerHTML = '<p>Unable to load popular movies. Please try searching for movies!</p>';
    }
    
  } catch (error) {
    console.error('Error loading popular movies:', error);
    movieResultsContainer.innerHTML = '<p>Unable to load popular movies. Please try searching for movies!</p>';
  }
}

// Load featured movies when page loads (after variables are declared)
loadFeaturedMovies();

// Add event listener to the search form
searchForm.addEventListener('submit', handleSearchSubmit);

// Function to handle form submission
function handleSearchSubmit(event) {
  // Prevent the form from refreshing the page
  event.preventDefault();
  
  // Get the search term from the input field
  const searchTerm = movieSearchInput.value.trim();
  
  // Check if the user entered something to search for
  if (searchTerm === '') {
    alert('Please enter a movie title to search for!');
    return;
  }
  
  // Call the function to search for movies
  searchMovies(searchTerm);
  
  // On mobile, switch back to search results view after searching
  if (watchlistSection.classList.contains('show-mobile')) {
    toggleMobileWatchlist();
  }
}

// Function to search for movies using the OMDb API
async function searchMovies(searchTerm) {
  // Update section title back to search results
  const resultsTitle = document.querySelector('#results-section h2');
  resultsTitle.innerHTML = '<i class="fas fa-search"></i> Search Results';
  
  // Show loading message while fetching data
  movieResultsContainer.innerHTML = '<p>Searching for movies...</p>';
  
  // Create the URL for the API request
  const searchUrl = `${API_URL}?apikey=${API_KEY}&s=${searchTerm}&type=movie`;
  
  // Check if API key is set
  if (API_KEY === 'YOUR_API_KEY_HERE') {
    movieResultsContainer.innerHTML = '<p>Please set your OMDb API key in script.js to search for movies!</p>';
    return;
  }
  
  // Fetch data from the OMDb API
  const response = await fetch(searchUrl);
  const data = await response.json();
  
  // Check if the search was successful
  if (data.Response === 'True') {
    // Display the movies that were found
    displayMovies(data.Search);
  } else {
    console.error('Error fetching movies:', data.Error);
    // Show error message based on the type of error
    if (data.Error === 'Invalid API key!') {
      movieResultsContainer.innerHTML = '<p>Invalid API key! Please check your OMDb API key in script.js.</p>';
    } else if (data.Error === 'Too many results.') {
      movieResultsContainer.innerHTML = `
        <p>Too many results found for "${searchTerm}"!</p>
        <p>Try being more specific with your search:</p>
        <ul style="text-align: left; margin: 10px 0;">
          <li>Use the full movie title</li>
          <li>Add the year (e.g., "Batman 2022")</li>
          <li>Be more specific (e.g., "Iron Man" instead of just "iron")</li>
        </ul>
      `;
    } else {
      movieResultsContainer.innerHTML = `<p>No movies found for "${searchTerm}". Try a different search term!</p>`;
    }
  }
}

// Function to create a professional-looking movie poster placeholder
function createMoviePoster(movieTitle, movieYear) {
  // Clean the title for display
  const cleanTitle = movieTitle.replace(/[^\w\s\-:]/g, '').trim();
  
  // Create a professional movie poster placeholder
  // Using a reliable placeholder service with movie-like styling
  const posterUrl = `https://placehold.co/300x450/1a1a2e/ee4f69?text=${encodeURIComponent(cleanTitle)}%0A(${movieYear})&font=raleway`;
  
  return posterUrl;
}

// Function to handle poster loading errors
function handlePosterError(imgElement, movieTitle, movieYear) {
  const currentSrc = imgElement.src;
  
  // If it's already our custom placeholder, don't change it
  if (currentSrc.includes('placehold.co')) {
    return;
  }
  
  // Use our professional movie poster placeholder
  imgElement.src = createMoviePoster(movieTitle, movieYear);
}

// Function to display movies in the results grid
function displayMovies(movies) {
  // Clear any existing content
  movieResultsContainer.innerHTML = '';
  
  // Loop through each movie and create a card for it
  movies.forEach(movie => {
    // Create a div element for each movie card
    const movieCard = document.createElement('div');
    movieCard.className = 'movie-card';
    
    // Get the movie poster URL, or use a custom poster if no poster is available
    const posterUrl = movie.Poster !== 'N/A' ? movie.Poster : createMoviePoster(movie.Title, movie.Year);
    
    // Create the HTML content for the movie card
    movieCard.innerHTML = `
      <div class="movie-clickable" data-imdb-id="${movie.imdbID}">
        <img src="${posterUrl}" alt="${movie.Title} poster" class="movie-poster" onload="this.style.opacity=1" onerror="handlePosterError(this, '${movie.Title.replace(/'/g, "\\'")}', '${movie.Year}')">
        <div class="movie-info">
          <h3 class="movie-title">${movie.Title}</h3>
          <p class="movie-year">${movie.Year}</p>
          <button class="add-to-watchlist-btn" data-imdb-id="${movie.imdbID}" onclick="event.stopPropagation()">
            <i class="fas fa-plus"></i> Add to Watchlist
          </button>
        </div>
      </div>
    `;
    
    // Add click listener for movie details modal
    const clickableArea = movieCard.querySelector('.movie-clickable');
    clickableArea.addEventListener('click', () => {
      openModal(movie.imdbID);
    });
    
    // Add the movie card to the results container
    movieResultsContainer.appendChild(movieCard);
  });
  
  // Add event listeners to all "Add to Watchlist" buttons
  const addToWatchlistButtons = document.querySelectorAll('.add-to-watchlist-btn');
  addToWatchlistButtons.forEach(button => {
    button.addEventListener('click', handleAddToWatchlist);
  });
}

// Function to handle adding a movie to the watchlist
function handleAddToWatchlist(event) {
  // Get the IMDb ID from the button's data attribute
  const imdbID = event.target.getAttribute('data-imdb-id');
  
  // Check if movie is already in watchlist to prevent duplicates
  const isAlreadyInWatchlist = watchlistMovies.some(movie => movie.imdbID === imdbID);
  
  if (isAlreadyInWatchlist) {
    alert('This movie is already in your watchlist!');
    return;
  }
  
  // Find the movie data from the current search results
  const movieCard = event.target.closest('.movie-card');
  const movieTitle = movieCard.querySelector('.movie-title').textContent;
  const movieYear = movieCard.querySelector('.movie-year').textContent;
  const moviePoster = movieCard.querySelector('.movie-poster').src;
  
  // Create movie object to add to watchlist
  const movieToAdd = {
    imdbID: imdbID,
    Title: movieTitle,
    Year: movieYear,
    Poster: moviePoster
  };
  
  // Add movie to watchlist array
  watchlistMovies.push(movieToAdd);
  
  // Save to localStorage
  saveWatchlistToStorage();
  
  // Update the watchlist display
  displayWatchlist();
  
  // Show success message
  alert(`"${movieTitle}" has been added to your watchlist!`);
}

// Function to display movies in the watchlist
function displayWatchlist() {
  // Clear existing watchlist content
  watchlistContainer.innerHTML = '';
  
  // Check if watchlist is empty
  if (watchlistMovies.length === 0) {
    watchlistContainer.innerHTML = 'Your watchlist is empty. Search for movies to add!';
    return;
  }
  
  // Loop through watchlist movies and create cards
  watchlistMovies.forEach(movie => {
    // Create a div element for each movie card
    const movieCard = document.createElement('div');
    movieCard.className = 'movie-card';
    
    // Get poster URL with fallback support
    const posterUrl = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : getAlternativePosterUrl(movie.Title, movie.Year);
    
    // Create the HTML content for the watchlist movie card
    movieCard.innerHTML = `
      <div class="movie-clickable" data-imdb-id="${movie.imdbID}">
        <img src="${posterUrl}" alt="${movie.Title} poster" class="movie-poster" onload="this.style.opacity=1" onerror="handlePosterError(this, '${movie.Title.replace(/'/g, "\\'")}', '${movie.Year}')">
        <div class="movie-info">
          <h3 class="movie-title">${movie.Title}</h3>
          <p class="movie-year">${movie.Year}</p>
          <button class="remove-from-watchlist-btn" data-imdb-id="${movie.imdbID}" onclick="event.stopPropagation()">
            <i class="fas fa-trash"></i> Remove
          </button>
        </div>
      </div>
    `;
    
    // Add click listener for movie details modal
    const clickableArea = movieCard.querySelector('.movie-clickable');
    clickableArea.addEventListener('click', () => {
      openModal(movie.imdbID);
    });
    
    // Add the movie card to the watchlist container
    watchlistContainer.appendChild(movieCard);
  });
  
  // Add event listeners to all "Remove" buttons
  const removeButtons = document.querySelectorAll('.remove-from-watchlist-btn');
  removeButtons.forEach(button => {
    button.addEventListener('click', handleRemoveFromWatchlist);
  });
}

// Function to handle removing a movie from the watchlist
function handleRemoveFromWatchlist(event) {
  // Get the IMDb ID from the button's data attribute
  const imdbID = event.target.getAttribute('data-imdb-id');
  
  // Find the movie in the watchlist array
  const movieToRemove = watchlistMovies.find(movie => movie.imdbID === imdbID);
  
  // Remove the movie from the watchlist array
  watchlistMovies = watchlistMovies.filter(movie => movie.imdbID !== imdbID);
  
  // Save to localStorage
  saveWatchlistToStorage();
  
  // Update the watchlist display
  displayWatchlist();
  
  // Show success message
  alert(`"${movieToRemove.Title}" has been removed from your watchlist!`);
}

// Function to open movie details modal
async function openModal(imdbID) {
  try {
    // Show loading state
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Show loading message
    document.getElementById('modal-title').textContent = 'Loading...';
    document.getElementById('modal-plot-text').textContent = 'Loading movie details...';
    
    // Fetch detailed movie information
    const detailUrl = `${API_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`;
    const response = await fetch(detailUrl);
    const movieDetails = await response.json();
    
    if (movieDetails.Response === 'True') {
      // Populate modal with movie details
      populateModal(movieDetails);
    } else {
      // Handle error
      document.getElementById('modal-title').textContent = 'Error';
      document.getElementById('modal-plot-text').textContent = 'Unable to load movie details.';
    }
    
  } catch (error) {
    console.error('Error fetching movie details:', error);
    document.getElementById('modal-title').textContent = 'Error';
    document.getElementById('modal-plot-text').textContent = 'Unable to load movie details.';
  }
}

// Function to populate modal with movie details
function populateModal(movie) {
  // Set poster
  const posterImg = document.getElementById('modal-poster-img');
  if (movie.Poster !== 'N/A') {
    posterImg.src = movie.Poster;
    posterImg.alt = `${movie.Title} poster`;
  } else {
    posterImg.src = createMoviePoster(movie.Title, movie.Year);
    posterImg.alt = `${movie.Title} poster placeholder`;
  }
  
  // Set basic information
  document.getElementById('modal-title').textContent = movie.Title;
  document.getElementById('modal-year').textContent = movie.Year;
  document.getElementById('modal-rating').textContent = movie.imdbRating !== 'N/A' ? `${movie.imdbRating}/10 (IMDb)` : 'Not rated';
  document.getElementById('modal-genre').textContent = movie.Genre !== 'N/A' ? movie.Genre : 'Not specified';
  document.getElementById('modal-director').textContent = movie.Director !== 'N/A' ? movie.Director : 'Not specified';
  document.getElementById('modal-cast').textContent = movie.Actors !== 'N/A' ? movie.Actors : 'Not specified';
  
  // Set plot summary
  document.getElementById('modal-plot-text').textContent = movie.Plot !== 'N/A' ? movie.Plot : 'Plot summary not available.';
}

// Function to close modal
function closeModal() {
  modal.classList.remove('show');
  document.body.style.overflow = ''; // Restore background scrolling
  
  // Reset modal content transform (for mobile gesture)
  modalContent.style.transform = '';
  modal.style.opacity = '';
}