require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// YouTube API endpoint
app.get('/api/playlist', async (req, res) => {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
      params: {
        part: 'snippet,contentDetails',
        maxResults: 50,
        playlistId: process.env.YOUTUBE_PLAYLIST_ID,
        key: process.env.YOUTUBE_API_KEY
      }
    });
    
    // Log the first item to see its structure
    console.log('First video item structure:', JSON.stringify(response.data.items[0], null, 2));
    
    // Format the data before sending to client
    const videos = response.data.items.map(item => {
      // Get the best available thumbnail
      let thumbnail = null;
      if (item.snippet.thumbnails) {
        // Try to get the highest quality thumbnail available
        thumbnail = item.snippet.thumbnails.maxres || 
                   item.snippet.thumbnails.high || 
                   item.snippet.thumbnails.medium || 
                   item.snippet.thumbnails.default;
      }
      
      return {
        id: item.contentDetails.videoId,
        title: item.snippet.title,
        description: item.snippet.description || '',
        thumbnailUrl: thumbnail ? thumbnail.url : '',
        publishedAt: item.snippet.publishedAt
      };
    });
    
    // Log the first transformed item
    console.log('First transformed video:', JSON.stringify(videos[0], null, 2));
    
    res.json(videos);
  } catch (error) {
    console.error('YouTube API Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch videos from YouTube API' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});