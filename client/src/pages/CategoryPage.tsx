import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Grid,
  useTheme,
  useMediaQuery,
  Fab,
} from '@mui/material';
import { ArrowBack, FilterList } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CollectionRow from '../components/CollectionRow';
import PlaylistCard from '../components/PlaylistCard';
import apiClient from '../services/apiClient';

interface Category {
  _id: string;
  name: string;
  slug: string;
  type: string;
}

interface Collection {
  _id: string;
  title: string;
  categoryId: {
    _id: string;
    name: string;
    slug: string;
    type: string;
  };
  isFeatured: boolean;
  sortOrder: number;
}

interface Playlist {
  _id: string;
  title: string;
  description: string;
  posterUrl: string;
  type: string;
  categoryId: string;
  collectionId?: string;
}

const CategoryPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    if (categoryId) {
      loadData();
    }
    loadUser();
  }, [categoryId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [collectionsRes, playlistsRes] = await Promise.all([
        apiClient.getCollections(),
        apiClient.getPlaylists(categoryId),
      ]);

      if (collectionsRes.success) {
        setCollections(collectionsRes.data || []);
        // Get category from first collection
        if (collectionsRes.data?.length > 0) {
          setCategory(collectionsRes.data[0].categoryId);
        }
      }

      if (playlistsRes.success) {
        setPlaylists(playlistsRes.data?.playlists || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load category data');
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
      // User not logged in
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const handlePlaylistClick = (playlist: any) => {
    navigate(`/playlist/${playlist._id}`);
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'anime': return '🎌';
      case 'manga': return '📚';
      case 'movie': return '🎬';
      case 'show': return '📺';
      case 'webseries': return '🌐';
      case 'shorts': return '📱';
      default: return '🎭';
    }
  };

  const standalonePlaylists = playlists.filter(p => !p.collectionId);

  if (loading) {
    return (
      <Box sx={{ backgroundColor: '#141414', minHeight: '100vh' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress sx={{ color: '#e50914' }} />
        </Box>
      </Box>
    );
  }

  if (!category) {
    return (
      <Box sx={{ backgroundColor: '#141414', minHeight: '100vh' }}>
        <Navbar  onLogout={handleLogout} />
        <Container maxWidth="xl" sx={{ pt: 4 }}>
          <Alert severity="error">
            Category not found
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#141414', minHeight: '100vh' }}>
      <Navbar onLogout={handleLogout} />
      
      {/* Header */}
      <Box
        sx={{
          position: 'relative',
          height: '40vh',
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url('/category-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/')}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Back
            </Button>
            
            <Box>
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <span>{getTypeIcon(category.type)}</span>
                {category.name}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#b3b3b3',
                }}
              >
                {category.type.toUpperCase()} • {collections.length} Collections • {playlists.length} Playlists
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
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

        {/* Collections */}
        {collections.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h4"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                mb: 3,
              }}
            >
              Collections
            </Typography>
            {collections
              .sort((a, b) => {
                if (a.isFeatured && !b.isFeatured) return -1;
                if (!a.isFeatured && b.isFeatured) return 1;
                return a.sortOrder - b.sortOrder;
              })
              .map((collection) => (
                <Box key={collection._id} sx={{ mb: 4 }}>
                  <CollectionRow
                    collection={collection}
                    playlists={playlists.filter(p => p.collectionId === collection._id)}
                    onPlaylistClick={handlePlaylistClick}
                  />
                </Box>
              ))}
          </Box>
        )}

        {/* Standalone Playlists */}
        {standalonePlaylists.length > 0 && (
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                mb: 3,
              }}
            >
              Standalone Playlists
            </Typography>
            <Grid container spacing={3}>
              {standalonePlaylists.map((playlist) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={playlist._id}>
                  <PlaylistCard
                    playlist={playlist}
                    onClick={() => handlePlaylistClick(playlist)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Empty State */}
        {collections.length === 0 && standalonePlaylists.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: '#ccc',
                mb: 2,
              }}
            >
              No content available in this category
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#888',
              }}
            >
              Start by creating collections and playlists to build this category.
            </Typography>
          </Box>
        )}
      </Container>

      {/* Floating Filter Button */}
      <Fab
        color="primary"
        aria-label="filter"
        onClick={() => setShowFilter(!showFilter)}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          backgroundColor: '#e50914',
          '&:hover': {
            backgroundColor: '#f40612',
          },
        }}
      >
        <FilterList />
      </Fab>
    </Box>
  );
};

export default CategoryPage;
