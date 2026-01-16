import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import Navbar from '../components/Navbar';
import ShortsPlayer from '../components/ShortsPlayer';
import apiClient from '../services/apiClient';

interface Video {
  _id: string;
  episodeId: {
    _id: string;
    title: string;
    episodeNumber: number;
    type: string;
  };
  videoUrl?: string;
  thumbnailUrl?: string;
  voiceId: {
    durationSeconds: number;
  };
}

const ShortsPage: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadShorts();
    loadUser();
  }, []);

  const loadShorts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getPublishedVideos('short');
      
      if (response.success) {
        setVideos(response.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load shorts');
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
      // User not logged in, that's okay for shorts page
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
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

  if (error) {
    return (
      <Box sx={{ backgroundColor: '#141414', minHeight: '100vh' }}>
        <Navbar onLogout={handleLogout} />
        <Container maxWidth="xl" sx={{ pt: 4 }}>
          <Alert
            severity="error"
            action={
              <button onClick={loadShorts} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                Retry
              </button>
            }
          >
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  if (videos.length === 0) {
    return (
      <Box sx={{ backgroundColor: '#141414', minHeight: '100vh' }}>
        <Navbar onLogout={handleLogout} />
        <Container maxWidth="xl" sx={{ pt: 4 }}>
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
            }}
          >
            <Box sx={{ fontSize: 60, mb: 2 }}>🎬</Box>
            <Box
              sx={{
                color: '#ccc',
                fontSize: 24,
                mb: 2,
              }}
            >
              No shorts available yet
            </Box>
            <Box sx={{ color: '#888' }}>
              Published short videos will appear here once they're created and approved.
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#141414', minHeight: '100vh' }}>
      <Navbar onLogout={handleLogout} />
      <ShortsPlayer
        videos={videos}
        onVideoEnd={(index) => {
          console.log('Video ended:', index);
        }}
        onVideoChange={(index) => {
          console.log('Video changed to:', index);
        }}
      />
    </Box>
  );
};

export default ShortsPage;
