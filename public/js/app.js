document.addEventListener('DOMContentLoaded', () => {
  // Theme switching functionality
  const toggleSwitch = document.querySelector('#checkbox');
  
  // Check for saved theme preference or use device preference
  const currentTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  // Apply the saved or detected theme
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  // Update checkbox state to match the theme
  if (currentTheme === 'dark') {
    toggleSwitch.checked = true;
  }
  
  // Handle theme switch
  toggleSwitch.addEventListener('change', switchTheme);
  
  function switchTheme(e) {
    if (e.target.checked) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }
  
  // Existing code for loading videos
  const videoGrid = document.getElementById('video-grid');
  const loadingMessage = document.createElement('p');
  loadingMessage.textContent = 'Loading videos...';
  loadingMessage.className = 'loading-message';
  videoGrid.appendChild(loadingMessage);

  // Fetch videos from our backend API
  fetch('/api/playlist')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(videos => {
      console.log('First video received by frontend:', videos[0]); 
      videoGrid.removeChild(loadingMessage);
      displayVideos(videos);
    })
    .catch(error => {
      console.error('Error fetching videos:', error);
      videoGrid.innerHTML = `<p class="error">Failed to load videos: ${error.message}</p>`;
    });

  function displayVideos(videos) {
    videos.forEach(video => {
      const videoCard = createVideoCard(video);
      videoGrid.appendChild(videoCard);
    });
  }

  function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    
    // Truncate description to 100 characters
    const shortDescription = video.description.length > 100 
      ? video.description.substring(0, 100) + '...' 
      : video.description;
    
    // Video URL
    const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
    
    card.innerHTML = `
      <div class="thumbnail-container">
        <a href="${videoUrl}" target="_blank" rel="noopener">
          <img src="${video.thumbnailUrl}" alt="${video.title}" class="thumbnail">
        </a>
      </div>
      <div class="video-info">
        <h3 class="video-title">
          <a href="${videoUrl}" target="_blank" rel="noopener">${video.title}</a>
        </h3>
        <p class="video-description">${shortDescription}</p>
        <div class="video-link-container">
          <input type="text" value="${videoUrl}" readonly class="video-link">
          <button class="copy-btn" data-url="${videoUrl}">Copy</button>
        </div>
      </div>
    `;
    
    // Add event listener for copy button
    const copyBtn = card.querySelector('.copy-btn');
    copyBtn.addEventListener('click', () => {
      const linkInput = card.querySelector('.video-link');
      linkInput.select();
      document.execCommand('copy');
      
      // Visual feedback for copy
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
      }, 2000);
    });
    
    return card;
  }
});