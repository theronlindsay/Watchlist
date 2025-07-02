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

// Add event listener for mobile watchlist toggle
toggleWatchlistBtn.addEventListener('click', toggleMobileWatchlist);

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
      <img src="${posterUrl}" alt="${movie.Title} poster" class="movie-poster" onload="this.style.opacity=1" onerror="handlePosterError(this, '${movie.Title.replace(/'/g, "\\'")}', '${movie.Year}')">
      <div class="movie-info">
        <h3 class="movie-title">${movie.Title}</h3>
        <p class="movie-year">${movie.Year}</p>
        <button class="add-to-watchlist-btn" data-imdb-id="${movie.imdbID}">
          <i class="fas fa-plus"></i> Add to Watchlist
        </button>
      </div>
    `;
    
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
      <img src="${posterUrl}" alt="${movie.Title} poster" class="movie-poster" onload="this.style.opacity=1" onerror="handlePosterError(this, '${movie.Title.replace(/'/g, "\\'")}', '${movie.Year}')">
      <div class="movie-info">
        <h3 class="movie-title">${movie.Title}</h3>
        <p class="movie-year">${movie.Year}</p>
        <button class="remove-from-watchlist-btn" data-imdb-id="${movie.imdbID}">
          <i class="fas fa-trash"></i> Remove
        </button>
      </div>
    `;
    
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