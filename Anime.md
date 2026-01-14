You are a senior TypeScript backend engineer.

I already have an existing Node + TypeScript backend project with my own structure.
Auth service already exists, do NOT create auth-service and do NOT modify existing auth logic unless needed to add optional fields.

IMPORTANT:
- DO NOT create a new repo
- DO NOT change my folder structure
- Only add new code according to my structure

My structure must be followed exactly:
api/src/microservices/<service-name>/
  controller.ts
  service.ts
  route.ts
  *.model.ts
  *.validation.ts

Also I already have config files under:
api/src/config/
- database.ts (mongoose connection)
- rabbitmq.ts (RabbitMQ connection helper)
- redis.ts (optional)

GOAL:
Build a Netflix-style anime/manga content platform + AI draft generation + review/editor + re-render pipeline.
We will generate videos/shorts legally (script+voice+posters/stock/AI visuals).

=====================================================
A) CREATE THESE MICROSERVICES (EXCEPT AUTH)
=====================================================

1) category-service
- Netflix categories: Anime, Manga, Shows, Movies, WebSeries, Shorts
- endpoints:
  POST /categories
  GET /categories
  PATCH /categories/:id
  DELETE /categories/:id

2) collection-service
- Netflix style rows like "Trending Now", "Popular Manga", "Top Romance"
- endpoints:
  POST /collections
  GET /collections?categoryId=
  PATCH /collections/:id
  DELETE /collections/:id

3) playlist-service
- Playlist is a series/collection (example: "One Piece Manga Chapter Shorts")
- fields:
  title, description, categoryId, collectionId, posterUrl, type
- endpoints:
  POST /playlists
  GET /playlists?categoryId=&collectionId=
  GET /playlists/:id
  PATCH /playlists/:id

4) episode-service
- Each playlist contains episodes/shorts
- fields:
  playlistId, episodeNumber, title, type(short|long), status(draft|published), videoId(optional)
- endpoints:
  POST /episodes
  GET /episodes?playlistId=
  PATCH /episodes/:id
  DELETE /episodes/:id

5) script-service
- Generate script template for shorts/long based on episode + playlist
- fields:
  episodeId, content, duration(short|long), status(DRAFT|APPROVED)
- endpoints:
  POST /scripts/generate (episodeId, duration)
  PATCH /scripts/:id
  PATCH /scripts/:id/approve

6) voice-service
- Generate voice for approved script (placeholder adapter)
- Voice model:
  scriptId, provider, audioUrl, durationSeconds
- endpoints:
  POST /voice/generate (scriptId, provider)
  GET /voice/:scriptId

7) video-service
- Video model:
  episodeId, scriptId, voiceId, type(short|long), orientation(vertical|horizontal), status
  statuses:
    AI_PROCESSING | DRAFT_READY | IN_REVIEW | FINAL_APPROVED | PUBLISHED | FAILED
  endpoints:
    POST /videos/generate (episodeId, scriptId, voiceId, orientation)
    GET /videos/:id
    GET /videos?status=
- video-service must publish render jobs to RabbitMQ queue "video-render"

8) editor-service
- VideoProject model:
  videoId, title, orientation, status, projectJson, createdBy, updatedBy
- endpoints:
  GET /editor/project/:videoId
  PATCH /editor/project/:videoId (save projectJson edits)
  POST /editor/project/:videoId/rerender (push render job to rabbitmq)

Project JSON format:
{
  "title": string,
  "scenes": [
    {
      "sceneId": string,
      "start": number,
      "end": number,
      "image": string,
      "text": string,
      "caption": string,
      "style": { "fontSize": number, "x": number, "y": number }
    }
  ],
  "audio": {
    "voice": string,
    "bgm": string,
    "bgmVolume": number
  }
}

9) review-service
- ReviewLog model:
  videoId, reviewerId, action(APPROVED|REJECTED), note
- endpoints:
  GET /review/queue
  PATCH /review/:videoId/start
  PATCH /review/:videoId/approve
  PATCH /review/:videoId/reject
- Approval flow:
  DRAFT_READY -> IN_REVIEW -> FINAL_APPROVED
- Rejection should keep projectJson so creator can fix and rerender

10) youtube-service
- OAuth endpoints for connecting YouTube (structure only)
- endpoints:
  GET /youtube/auth-url
  GET /youtube/callback
  POST /youtube/upload (videoId, title, tags, description, visibility)
- Upload can be stubbed but keep correct structure and error handling

=====================================================
B) SECURITY (USE EXISTING AUTH)
=====================================================
- All routes except public GET should require authentication using existing auth middleware/guard
- Use req.user or your existing decoded token pattern for userId
- Add role-based check for admin-only endpoints (creating categories/collections)

=====================================================
C) VALIDATION + RESPONSE STYLE
=====================================================
- Follow same validation pattern used in the existing auth-service validation files.
- Standard API response format:
{
  success: boolean,
  message: string,
  data?: any
}

=====================================================
D) ROUTING REGISTRATION
=====================================================
Create a master router file:
api/src/microservices/index.ts
that imports and mounts all service routes.

Example:
import categoryRoutes from './category-service/route';
router.use('/categories', categoryRoutes);

=====================================================
E) WORKER FOR VIDEO RENDERING
=====================================================
Create worker file:
api/src/workers/video-render.worker.ts

- Consume RabbitMQ queue "video-render"
- Payload:
  { videoId, orientation, projectJson, voiceAudioUrl }
- Render MP4 using Remotion command via Node child_process
- Save output to /uploads/videos/<videoId>.mp4
- Update MongoDB Video record:
  status = "DRAFT_READY", videoUrl = "/uploads/videos/<videoId>.mp4"
- FAILED case should store error

=====================================================
OUTPUT REQUIRED
=====================================================
1) Create ALL files with complete TypeScript code (no pseudocode)
2) Provide list of all file paths created
3) Show how to register routes and run worker
4) Provide sample request bodies for key endpoints
