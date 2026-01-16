import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  Info,
  Share,
  FavoriteBorder,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import apiClient from '../services/apiClient';

interface ContentItem {
  _id: string;
  title: string;
  synopsis: string;
  posterUrl: string;
  type: string;
  genres: string[];
  rating: number;
  status: string;
  releaseYear?: number;
  popularity?: number;
}

const ContentDetailPage: React.FC = () => {
  const theme = useTheme();
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contentId) {
      loadContent(contentId);
    }
  }, [contentId]);

  const loadContent = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getContentById(id);
      
      if (response.success) {
        setContent(response.data);
      } else {
        setError('Content not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    // TODO: Implement video player navigation
    console.log('Playing content:', content?._id);
  };

  const handleShare = () => {
    if (navigator.share && content) {
      navigator.share({
        title: content.title,
        text: content.synopsis,
        url: window.location.href,
      });
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleFavorite = () => {
    // TODO: Implement favorite functionality
    console.log('Adding to favorites:', content?._id);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return '#4caf50';
      case 'draft': return '#ff9800';
      case 'archived': return '#f44336';
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

  if (error || !content) {
    return (
      <Box sx={{ backgroundColor: '#141414', minHeight: '100vh' }}>
        <Navbar />
        <Container maxWidth="lg" sx={{ pt: 4, pb: 8 }}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography
              variant="h4"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                mb: 2,
              }}
            >
              {error || 'Content not found'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/')}
              sx={{
                backgroundColor: '#e50914',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#f40612',
                },
              }}
            >
              Back to Home
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#141414', minHeight: '100vh' }}>
      <Navbar />
      
      <Container maxWidth="lg" sx={{ pt: 4, pb: 8 }}>
        {/* Back Button */}
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{
            borderColor: 'white',
            color: 'white',
            mb: 3,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          Back to Home
        </Button>

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

        {/* Content Details */}
        <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
          {/* Poster */}
          <Box sx={{ flex: '0 0 400px', maxWidth: 400 }}>
            {content.posterUrl ? (
              <img
                src={content.posterUrl}
                alt={content.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '600px',
                  backgroundColor: '#2a2a2a',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                }}
              >
                No Image
              </Box>
            )}
          </Box>

          {/* Content Info */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h3"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                mb: 2,
              }}
            >
              {content.title}
            </Typography>

            {/* Status and Type */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip
                label={content.status}
                size="small"
                sx={{
                  backgroundColor: getStatusColor(content.status),
                  color: 'white',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                }}
              />
              <Chip
                label={content.type}
                size="small"
                sx={{
                  backgroundColor: getTypeColor(content.type),
                  color: 'white',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                }}
              />
              {content.rating && (
                <Chip
                  label={`⭐ ${content.rating.toFixed(1)}`}
                  size="small"
                  sx={{
                    backgroundColor: '#333',
                    color: '#ccc',
                  }}
                />
              )}
              {content.releaseYear && (
                <Chip
                  label={content.releaseYear.toString()}
                  size="small"
                  sx={{
                    backgroundColor: '#333',
                    color: '#ccc',
                  }}
                />
              )}
            </Box>

            {/* Genres */}
            {content.genres && content.genres.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {content.genres.map((genre, index) => (
                  <Chip
                    key={index}
                    label={genre}
                    size="small"
                    sx={{
                      backgroundColor: '#333',
                      color: '#ccc',
                    }}
                  />
                ))}
              </Box>
            )}

            {/* Synopsis */}
            <Typography
              variant="body1"
              sx={{
                color: '#ccc',
                lineHeight: 1.6,
                mb: 3,
              }}
            >
              {content.synopsis}
            </Typography>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={handlePlay}
                sx={{
                  backgroundColor: '#e50914',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#f40612',
                  },
                }}
              >
                Play Now
              </Button>
              <Button
                variant="outlined"
                startIcon={<Share />}
                onClick={handleShare}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Share
              </Button>
              <Button
                variant="outlined"
                startIcon={<FavoriteBorder />}
                onClick={handleFavorite}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Add to Favorites
              </Button>
            </Box>

            {/* Additional Info */}
            {content.popularity && (
              <Typography
                variant="body2"
                sx={{
                  color: '#888',
                  mt: 2,
                }}
              >
                Popularity: {content.popularity.toLocaleString()}
              </Typography>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ContentDetailPage;
