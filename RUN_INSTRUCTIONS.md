# Netflix-Style Anime/Manga Platform - Run Instructions

## Backend Setup

### Prerequisites
- Node.js 18+
- MongoDB
- RabbitMQ
- Redis (optional)
- FFmpeg (for video processing)
- Remotion CLI (for video rendering)

### Environment Variables
Create `.env` file in `api/` directory:

```env
# Database
MONGODB_URL=mongodb://localhost:27017/anime-platform

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# Redis (optional)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key

# File Upload
UPLOAD_BASE_DIR=./uploads

# Server
PORT=5000
NODE_ENV=development
```

### Install Dependencies
```bash
cd api
npm install
```

### Database Setup
```bash
# Start MongoDB
mongod

# Start RabbitMQ
rabbitmq-server
```

### Run Backend Server
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### Run Video Render Worker
```bash
# Development
npm run worker:video

# Production
npm run worker:video:prod
```

## Frontend Setup

### Environment Variables
Create `.env` file in `client/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### Install Dependencies
```bash
cd client
npm install
```

### Run Frontend
```bash
# Development
npm run dev

# Build
npm run build

# Preview
npm run preview
```

## API Endpoints

### Categories
```bash
# Get all categories
GET /api/categories

# Create category (admin only)
POST /api/categories
{
  "name": "Anime",
  "slug": "anime",
  "type": "anime"
}

# Update category (admin only)
PATCH /api/categories/:id
{
  "name": "Updated Anime"
}

# Delete category (admin only)
DELETE /api/categories/:id
```

### Collections
```bash
# Get collections
GET /api/collections?categoryId=category_id

# Create collection (admin only)
POST /api/collections
{
  "title": "Trending Now",
  "categoryId": "category_id",
  "sortOrder": 1,
  "isFeatured": true
}

# Update collection (admin only)
PATCH /api/collections/:id
{
  "title": "Updated Collection"
}

# Delete collection (admin only)
DELETE /api/collections/:id
```

### Playlists
```bash
# Get playlists
GET /api/playlists?categoryId=category_id&collectionId=collection_id

# Get playlist by ID
GET /api/playlists/:id

# Create playlist
POST /api/playlists
{
  "title": "One Piece Shorts",
  "description": "Amazing One Piece content",
  "categoryId": "category_id",
  "collectionId": "collection_id",
  "posterUrl": "https://example.com/poster.jpg",
  "type": "anime"
}

# Update playlist
PATCH /api/playlists/:id
{
  "title": "Updated Playlist"
}
```

### Episodes
```bash
# Get episodes
GET /api/episodes?playlistId=playlist_id

# Create episode
POST /api/episodes
{
  "playlistId": "playlist_id",
  "episodeNumber": 1,
  "title": "Episode 1",
  "type": "short",
  "status": "draft"
}

# Update episode
PATCH /api/episodes/:id
{
  "title": "Updated Episode"
}

# Delete episode
DELETE /api/episodes/:id
```

### Content (Trending Cache)
```bash
# Get content with filters
GET /api/content?type=anime&genre=action&sort=trendScore&page=1&limit=20

# Get trending content
GET /api/content/trending?limit=10

# Get content by genre
GET /api/content/genre/action?limit=20
```

### Scripts
```bash
# Generate script
POST /api/scripts/generate
{
  "episodeId": "episode_id",
  "duration": "short",
  "style": "explained"
}

# Get script
GET /api/scripts/:id

# Update script
PATCH /api/scripts/:id
{
  "content": "Updated script content"
}

# Approve script
PATCH /api/scripts/:id/approve
{
  "note": "Approved for production"
}
```

### Voice
```bash
# Generate voice
POST /api/voice/generate
{
  "scriptId": "script_id",
  "provider": "google"
}

# Get voice
GET /api/voice/:id

# Get voice by script ID
GET /api/voice/script/:script_id
```

### Videos
```bash
# Generate video
POST /api/videos/generate
{
  "episodeId": "episode_id",
  "scriptId": "script_id",
  "voiceId": "voice_id",
  "orientation": "vertical"
}

# Get video
GET /api/videos/:id

# Get videos with filters
GET /api/videos?status=PUBLISHED&type=short

# Get published videos
GET /api/videos/published?type=short
```

### Editor
```bash
# Get project
GET /api/editor/project/:videoId

# Update project
PATCH /api/editor/project/:videoId
{
  "title": "Updated Project",
  "projectJson": { ... },
  "status": "IN_REVIEW"
}

# Rerender project
POST /api/editor/project/:videoId/rerender
```

### Review
```bash
# Get review queue
GET /api/review/queue?status=DRAFT_READY&page=1&limit=20

# Start review
PATCH /api/review/:videoId/start

# Approve video
PATCH /api/review/:videoId/approve
{
  "note": "Looks great!",
  "publishNow": true,
  "autoUploadYoutube": false
}

# Reject video
PATCH /api/review/:videoId/reject
{
  "note": "Needs more work on transitions"
}

# Get review history
GET /api/review/:videoId/history
```

### YouTube
```bash
# Get auth URL
GET /api/youtube/auth-url

# Upload to YouTube
POST /api/youtube/upload
{
  "videoId": "video_id",
  "title": "Amazing Anime Video",
  "description": "Check out this awesome content!",
  "tags": ["anime", "shorts", "trending"],
  "visibility": "public"
}

# Get uploads
GET /api/youtube?status=uploaded
```

### Cron Jobs (Admin Only)
```bash
# Run job manually
POST /api/cron/run-now?job=trendingAnime

# Get job status
GET /api/cron/status

# Start all jobs
POST /api/cron/start

# Stop all jobs
POST /api/cron/stop
```

## Sample Workflow

1. **Create Categories and Collections**
```bash
# Create anime category
POST /api/categories
{
  "name": "Anime",
  "slug": "anime",
  "type": "anime"
}

# Create collection
POST /api/collections
{
  "title": "Trending Anime",
  "categoryId": "category_id",
  "isFeatured": true
}
```

2. **Create Playlist and Episode**
```bash
# Create playlist
POST /api/playlists
{
  "title": "One Piece Shorts",
  "description": "Short videos about One Piece",
  "categoryId": "category_id",
  "posterUrl": "https://example.com/one-piece.jpg",
  "type": "anime"
}

# Create episode
POST /api/episodes
{
  "playlistId": "playlist_id",
  "episodeNumber": 1,
  "title": "Luffy's First Adventure",
  "type": "short"
}
```

3. **Generate AI Content**
```bash
# Generate script
POST /api/scripts/generate
{
  "episodeId": "episode_id",
  "duration": "short",
  "style": "explained"
}

# Approve script
PATCH /api/scripts/:script_id/approve

# Generate voice
POST /api/voice/generate
{
  "scriptId": "script_id",
  "provider": "google"
}

# Generate video
POST /api/videos/generate
{
  "episodeId": "episode_id",
  "scriptId": "script_id",
  "voiceId": "voice_id",
  "orientation": "vertical"
}
```

4. **Review and Publish**
```bash
# Get review queue
GET /api/review/queue?status=DRAFT_READY

# Start review
PATCH /api/review/:videoId/start

# Approve and publish
PATCH /api/review/:videoId/approve
{
  "note": "Ready to publish!",
  "publishNow": true
}
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check MONGODB_URL in .env
   - Verify database exists

2. **RabbitMQ Connection Failed**
   - Ensure RabbitMQ is running
   - Check RABBITMQ_URL in .env
   - Verify queue permissions

3. **Video Rendering Failed**
   - Ensure FFmpeg is installed and in PATH
   - Check Remotion installation: `npm install -g remotion`
   - Verify upload directories exist

4. **Frontend API Errors**
   - Check VITE_API_URL in client .env
   - Ensure backend is running
   - Check CORS settings

### Logs

- Backend logs: Check console output or logs directory
- Worker logs: Check worker console output
- Frontend logs: Check browser console

## Production Deployment

1. **Backend**
   - Set NODE_ENV=production
   - Use PM2 for process management
   - Configure reverse proxy (nginx)
   - Set up SSL certificates

2. **Database**
   - Use MongoDB Atlas or dedicated server
   - Configure backups
   - Set up replication

3. **Message Queue**
   - Use managed RabbitMQ service
   - Configure clustering
   - Set up monitoring

4. **Frontend**
   - Build static files
   - Serve with CDN
   - Configure caching
   - Set up environment-specific configs

## Monitoring

- Use PM2 monitoring for backend
- Monitor RabbitMQ queues
- Track video processing times
- Set up error reporting
- Monitor database performance
