import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Button,
  Chip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import VideoCard from '../components/VideoCard';
import ConfirmDialog from '../components/ConfirmDialog';
import apiClient from '../services/apiClient';

interface Playlist {
  _id: string;
  title: string;
  description: string;
  posterUrl: string;
  type: string;
  categoryId: string;
  collectionId?: string;
  category?: {
    _id: string;
    name: string;
    slug: string;
    type: string;
  };
}

interface Episode {
  _id: string;
  playlistId: string;
  episodeNumber: number;
  title: string;
  type: string;
  status: string;
  videoId?: any;
}

interface Video {
  _id: string;
  episodeId: {
    _id: string;
    title: string;
    episodeNumber: number;
    type: string;
  };
  type: string;
  orientation: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  status: string;
  voiceId: {
    durationSeconds: number;
    provider: string;
    audioUrl: string;
  };
}

const PlaylistPage: React.FC = () => {
  const theme = useTheme();
  const { playlistId } = useParams<{ playlistId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [user, setUser] = useState<any>(null);
  const [generateDialog, setGenerateDialog] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (playlistId) {
      loadData();
    }
    loadUser();
  }, [playlistId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [playlistRes, episodesRes] = await Promise.all([
        apiClient.getPlaylist(playlistId!),
        apiClient.getEpisodes(playlistId!),
      ]);

      if (playlistRes.success) {
        setPlaylist(playlistRes.data);
      }

      if (episodesRes.success) {
        setEpisodes(episodesRes.data || []);
      }

      // Load videos for this playlist
      const videosRes = await apiClient.getVideos({ playlistId: playlistId! });
      if (videosRes.success) {
        setVideos(videosRes.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load playlist data');
    } finally {
      setLoading(false);
    }
  };

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const userRes = await apiClient.getCurrentUser();
        if (userRes.success) {
          setUser(userRes.data);
        }
      }
    } catch (err) {
      // User not logged in, that's okay
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const handleGenerateAIDraft = async () => {
    if (!user || episodes.length === 0) {
      return;
    }

    setGenerating(true);
    try {
      // Get first episode without video
      const episodeWithoutVideo = episodes.find(ep => 
        !videos.find(video => video.episodeId._id === ep._id)
      );

      if (!episodeWithoutVideo) {
        setError('All episodes already have videos');
        return;
      }

      // Step 1: Generate script
      const scriptRes = await apiClient.generateScript({
        episodeId: episodeWithoutVideo._id,
        duration: 'short',
        style: 'explained'
      });

      if (!scriptRes.success) {
        throw new Error('Failed to generate script');
      }

      // Step 2: Generate voice
      const voiceRes = await apiClient.generateVoice({
        scriptId: scriptRes.data._id,
        provider: 'google'
      });

      if (!voiceRes.success) {
        throw new Error('Failed to generate voice');
      }

      // Step 3: Generate video
      const videoRes = await apiClient.generateVideo({
        episodeId: episodeWithoutVideo._id,
        scriptId: scriptRes.data._id,
        voiceId: voiceRes.data._id,
        orientation: 'vertical'
      });

      if (videoRes.success) {
        setGenerateDialog(false);
        loadData(); // Reload data
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI draft');
    } finally {
      setGenerating(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'anime': return '#e50914';
      case 'manga': return '#f4c430';
      case 'movie': return '#2196f3';
      case 'show': return '#4caf50';
      case 'webseries': return '#ff9800';
      case 'shorts': return '#9c27b0';
      default: return '#757575';
    }
  };

  if (loading) {
    return (
      <Box sx={{ backgroundColor: '#141414', minHeight: '100vh' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress sx={{ color: '#e50914' }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#141414', minHeight: '100vh' }}>
      <Navbar onLogout={handleLogout} />
      
      <Container maxWidth="xl" sx={{ pt: 4, pb: 8 }}>
        {/* Playlist Header */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
            {/* Poster */}
            <Box
              sx={{
                width: 200,
                height: 300,
                backgroundImage: `url(${playlist?.posterUrl || '/placeholder-poster.jpg'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 2,
                flexShrink: 0,
              }}
            />

            {/* Info */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  mb: 2,
                }}
              >
                {playlist?.title}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  label={playlist?.type?.toUpperCase()}
                  size="small"
                  sx={{
                    backgroundColor: getTypeColor(playlist?.type || ''),
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
                <Chip
                  label={`${episodes.length} Episodes`}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                  }}
                />
              </Box>

              <Typography
                variant="body1"
                sx={{
                  color: '#ccc',
                  lineHeight: 1.6,
                  mb: 3,
                }}
              >
                {playlist?.description}
              </Typography>

              {user && (user.role === 'admin' || user.role === 'creator') && (
                <Button
                  variant="contained"
                  onClick={() => setGenerateDialog(true)}
                  disabled={episodes.length === 0}
                  sx={{
                    backgroundColor: '#e50914',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#f40612',
                    },
                  }}
                >
                  Generate AI Draft
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 4 }}
            action={
              <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                Dismiss
              </button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Episodes */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              color: 'white',
              mb: 3,
              fontWeight: 'bold',
            }}
          >
            Episodes
          </Typography>

          {episodes.length > 0 ? (
            <Grid container spacing={3}>
              {episodes.map((episode) => {
                const video = videos.find(v => v.episodeId._id === episode._id);
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={episode._id}>
                    <VideoCard
                      video={{
                        _id: video?._id || '',
                        episodeId: {
                          _id: episode._id,
                          title: episode.title,
                          episodeNumber: episode.episodeNumber,
                          type: episode.type,
                        },
                        scriptId: {
                          content: '',
                          style: 'explained',
                          duration: 'short',
                        },
                        voiceId: {
                          audioUrl: video?.voiceId?.audioUrl || '',
                          durationSeconds: video?.voiceId?.durationSeconds || 0,
                          provider: video?.voiceId?.provider || 'google',
                        },
                        type: episode.type,
                        orientation: video?.orientation || 'vertical',
                        videoUrl: video?.videoUrl,
                        thumbnailUrl: video?.thumbnailUrl,
                        status: video?.status || 'draft',
                      }}
                      onClick={() => {
                        if (video) {
                          window.location.href = `/studio/editor/${video._id}`;
                        }
                      }}
                    />
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography
                variant="h6"
                sx={{
                  color: '#ccc',
                  mb: 2,
                }}
              >
                No episodes yet
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#888',
                }}
              >
                Episodes will appear here once they are created.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Published Videos */}
        {videos.filter(v => v.status === 'PUBLISHED').length > 0 && (
          <Box>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                color: 'white',
                mb: 3,
                fontWeight: 'bold',
              }}
            >
              Published Videos
            </Typography>

            <Grid container spacing={3}>
              {videos.filter(v => v.status === 'PUBLISHED').map((video) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={video._id}>
                  <VideoCard
                    video={{
                      ...video,
                      scriptId: {
                        content: '',
                        style: 'explained',
                        duration: 'short',
                      },
                    }}
                    onClick={() => {
                      window.location.href = `/studio/editor/${video._id}`;
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>

      {/* Generate AI Draft Dialog */}
      <ConfirmDialog
        open={generateDialog}
        title="Generate AI Draft"
        message="This will create a script, generate voice, and render a video for the first episode without a video. This process may take several minutes. Continue?"
        confirmText="Generate"
        cancelText="Cancel"
        severity="info"
        loading={generating}
        onConfirm={handleGenerateAIDraft}
        onCancel={() => setGenerateDialog(false)}
      />
    </Box>
  );
};

export default PlaylistPage;
