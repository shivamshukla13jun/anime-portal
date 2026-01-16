import client from '@/utils/axiosInterceptor';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

class ApiClient {
  constructor() {
   
   
  }

  // Auth methods
  async login(email: string, password: string): Promise<ApiResponse> {
    const response = await client.post('/auth/login', { email, password });
    return response.data;
  }

  async register(userData: any): Promise<ApiResponse> {
    const response = await client.post('/auth/register', userData);
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse> {
    const response = await client.get('/auth/current-user');
    return response.data;
  }

  async logout(): Promise<ApiResponse> {
    const response = await client.post('/auth/logout');
    return response.data;
  }

  // User management methods (admin only)
  async getUsers(): Promise<ApiResponse> {
    const response = await client.get('/users');
    return response.data;
  }

  async getUserById(id: string): Promise<ApiResponse> {
    const response = await client.get(`/users/${id}`);
    return response.data;
  }

  async updateUser(id: string, userData: any): Promise<ApiResponse> {
    const response = await client.put(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    const response = await client.delete(`/users/${id}`);
    return response.data;
  }

  async activateUser(id: string): Promise<ApiResponse> {
    const response = await client.put(`/users/activate/${id}`);
    return response.data;
  }

  async blockUser(id: string): Promise<ApiResponse> {
    const response = await client.put(`/users/block/${id}`);
    return response.data;
  }

  // Category methods
  async getCategories(): Promise<ApiResponse> {
    const response = await client.get('/categories');
    return response.data;
  }

  async createCategory(categoryData: any): Promise<ApiResponse> {
    const response = await client.post('/categories', categoryData);
    return response.data;
  }

  async updateCategory(id: string, categoryData: any): Promise<ApiResponse> {
    const response = await client.patch(`/categories/${id}`, categoryData);
    return response.data;
  }

  async deleteCategory(id: string): Promise<ApiResponse> {
    const response = await client.delete(`/categories/${id}`);
    return response.data;
  }

  // Collection methods
  async getCollections(categoryId?: string): Promise<ApiResponse> {
    const params = categoryId ? { categoryId } : {};
    const response = await client.get('/collections', { params });
    return response.data;
  }

  async createCollection(collectionData: any): Promise<ApiResponse> {
    const response = await client.post('/collections', collectionData);
    return response.data;
  }

  async updateCollection(id: string, collectionData: any): Promise<ApiResponse> {
    const response = await client.patch(`/collections/${id}`, collectionData);
    return response.data;
  }

  async deleteCollection(id: string): Promise<ApiResponse> {
    const response = await client.delete(`/collections/${id}`);
    return response.data;
  }

  // Playlist methods
  async getPlaylists(categoryId?: string, collectionId?: string): Promise<ApiResponse> {
    const params: any = {};
    if (categoryId) params.categoryId = categoryId;
    if (collectionId) params.collectionId = collectionId;
    const response = await client.get('/playlists', { params });
    return response.data;
  }

  async getPlaylist(id: string): Promise<ApiResponse> {
    const response = await client.get(`/playlists/${id}`);
    return response.data;
  }

  async createPlaylist(playlistData: any): Promise<ApiResponse> {
    const response = await client.post('/playlists', playlistData);
    return response.data;
  }

  async updatePlaylist(id: string, playlistData: any): Promise<ApiResponse> {
    const response = await client.patch(`/playlists/${id}`, playlistData);
    return response.data;
  }

  // Episode methods
  async getEpisodes(playlistId?: string): Promise<ApiResponse> {
    const params = playlistId ? { playlistId } : {};
    const response = await client.get('/episodes', { params });
    return response.data;
  }

  async getEpisode(id: string): Promise<ApiResponse> {
    const response = await client.get(`/episodes/${id}`);
    return response.data;
  }

  async createEpisode(episodeData: any): Promise<ApiResponse> {
    const response = await client.post('/episodes', episodeData);
    return response.data;
  }

  async updateEpisode(id: string, episodeData: any): Promise<ApiResponse> {
    const response = await client.patch(`/episodes/${id}`, episodeData);
    return response.data;
  }

  async deleteEpisode(id: string): Promise<ApiResponse> {
    const response = await client.delete(`/episodes/${id}`);
    return response.data;
  }

  // Content methods
  async getContent(params?: {
    type?: string;
    genre?: string;
    source?: string;
    sort?: string;
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse> {
    const response = await client.get('/content', { params });
    return response.data;
  }

  async getContentById(id: string): Promise<ApiResponse> {
    const response = await client.get(`/content/${id}`);
    return response.data;
  }

  async createContent(contentData: any): Promise<ApiResponse> {
    const response = await client.post('/content', contentData);
    return response.data;
  }

  async updateContent(id: string, contentData: any): Promise<ApiResponse> {
    const response = await client.patch(`/content/${id}`, contentData);
    return response.data;
  }

  async deleteContent(id: string): Promise<ApiResponse> {
    const response = await client.delete(`/content/${id}`);
    return response.data;
  }

  async publishContent(id: string): Promise<ApiResponse> {
    const response = await client.patch(`/content/${id}/publish`);
    return response.data;
  }

  async unpublishContent(id: string): Promise<ApiResponse> {
    const response = await client.patch(`/content/${id}/unpublish`);
    return response.data;
  }

  async getTrendingContent(limit?: number): Promise<ApiResponse> {
    const params = limit ? { limit } : {};
    const response = await client.get('/content/trending', { params });
    return response.data;
  }

  async getContentByGenre(genre: string, limit?: number): Promise<ApiResponse> {
    const params = limit ? { limit } : {};
    const response = await client.get(`/content/genre/${genre}`, { params });
    return response.data;
  }

  // Script methods
  async generateScript(scriptData: any): Promise<ApiResponse> {
    const response = await client.post('/scripts/generate', scriptData);
    return response.data;
  }

  async getScript(id: string): Promise<ApiResponse> {
    const response = await client.get(`/scripts/${id}`);
    return response.data;
  }

  async updateScript(id: string, scriptData: any): Promise<ApiResponse> {
    const response = await client.patch(`/scripts/${id}`, scriptData);
    return response.data;
  }

  async approveScript(id: string, note?: string): Promise<ApiResponse> {
    const response = await client.patch(`/scripts/${id}/approve`, { note });
    return response.data;
  }

  // Voice methods
  async generateVoice(voiceData: any): Promise<ApiResponse> {
    const response = await client.post('/voice/generate', voiceData);
    return response.data;
  }

  async getVoice(id: string): Promise<ApiResponse> {
    const response = await client.get(`/voice/${id}`);
    return response.data;
  }

  async getVoiceByScriptId(scriptId: string): Promise<ApiResponse> {
    const response = await client.get(`/voice/script/${scriptId}`);
    return response.data;
  }

  // Video methods
  async generateVideo(videoData: any): Promise<ApiResponse> {
    const response = await client.post('/videos/generate', videoData);
    return response.data;
  }

  async getVideo(id: string): Promise<ApiResponse> {
    const response = await client.get(`/videos/${id}`);
    return response.data;
  }

  async getVideos(params?: {
    status?: string;
    playlistId?: string;
    type?: string;
  }): Promise<ApiResponse> {
    const response = await client.get('/videos', { params });
    return response.data;
  }

  async getPublishedVideos(type?: string): Promise<ApiResponse> {
    const params = type ? { type } : {};
    const response = await client.get('/videos/published', { params });
    return response.data;
  }

  // Editor methods
  async getProject(videoId: string): Promise<ApiResponse> {
    const response = await client.get(`/editor/project/${videoId}`);
    return response.data;
  }

  async updateProject(videoId: string, projectData: any): Promise<ApiResponse> {
    const response = await client.patch(`/editor/project/${videoId}`, projectData);
    return response.data;
  }

  async rerenderProject(videoId: string): Promise<ApiResponse> {
    const response = await client.post(`/editor/project/${videoId}/rerender`);
    return response.data;
  }

  // Review methods
  async getReviewQueue(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const response = await client.get('/review/queue', { params });
    return response.data;
  }

  async startReview(videoId: string): Promise<ApiResponse> {
    const response = await client.patch(`/review/${videoId}/start`);
    return response.data;
  }

  async approveVideo(videoId: string, data?: {
    note?: string;
    publishNow?: boolean;
    autoUploadYoutube?: boolean;
  }): Promise<ApiResponse> {
    const response = await client.patch(`/review/${videoId}/approve`, data);
    return response.data;
  }

  async rejectVideo(videoId: string, note: string): Promise<ApiResponse> {
    const response = await client.patch(`/review/${videoId}/reject`, { note });
    return response.data;
  }

  async getReviewHistory(videoId: string): Promise<ApiResponse> {
    const response = await client.get(`/review/${videoId}/history`);
    return response.data;
  }

  // YouTube methods
  async getYouTubeAuthUrl(): Promise<ApiResponse> {
    const response = await client.get('/youtube/auth-url');
    return response.data;
  }

  async uploadToYouTube(uploadData: any): Promise<ApiResponse> {
    const response = await client.post('/youtube/upload', uploadData);
    return response.data;
  }

  async getYouTubeUploads(status?: string): Promise<ApiResponse> {
    const params = status ? { status } : {};
    const response = await client.get('/youtube', { params });
    return response.data;
  }

  // Cron methods (admin only)
  async runCronJob(job: string): Promise<ApiResponse> {
    const response = await client.post('/cron/run-now', { job });
    return response.data;
  }

  async getCronJobStatus(): Promise<ApiResponse> {
    const response = await client.get('/cron/status');
    return response.data;
  }

  async startAllCronJobs(): Promise<ApiResponse> {
    const response = await client.post('/cron/start');
    return response.data;
  }

  async stopAllCronJobs(): Promise<ApiResponse> {
    const response = await client.post('/cron/stop');
    return response.data;
  }

  // Schedule management methods
  async getAllCronSchedules(): Promise<ApiResponse> {
    const response = await client.get('/cron/schedules');
    return response.data;
  }

  async updateCronSchedule(jobName: string, scheduleData: any): Promise<ApiResponse> {
    const response = await client.patch(`/cron/schedules/${jobName}`, scheduleData);
    return response.data;
  }

  async toggleCronSchedule(jobName: string, isActive: boolean): Promise<ApiResponse> {
    const response = await client.patch(`/cron/schedules/${jobName}/toggle`, { isActive });
    return response.data;
  }

  async initializeDefaultCronSchedules(): Promise<ApiResponse> {
    const response = await client.post('/cron/schedules/initialize');
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
