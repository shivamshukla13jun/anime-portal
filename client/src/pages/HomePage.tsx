import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button,
  useTheme,
} from '@mui/material';
import { PlayArrow, Info } from '@mui/icons-material';
import Navbar from '../components/Navbar';
import CollectionRow from '../components/CollectionRow';
import PlaylistCard from '../components/PlaylistCard';
import ContentCard from '../components/ContentCard';
import apiClient from '../services/apiClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

interface ContentItem {
  _id: string;
  title: string;
  synopsis: string;
  posterUrl: string;
  type: string;
  genres: string[];
  rating: number;
  status: string;
}

const HomePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [featuredContent, setFeaturedContent] = useState<ContentItem[]>([]);
  const [trendingContent, setTrendingContent] = useState<ContentItem[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [categoriesRes, collectionsRes, contentRes, trendingRes] = await Promise.all([
        apiClient.getCategories(),
        apiClient.getCollections(),
        apiClient.getContent({ limit: 20 }),
        apiClient.getTrendingContent(10),
      ]);

      if (categoriesRes.success) {
        setCategories(categoriesRes.data || []);
      }

      if (collectionsRes.success) {
        setCollections(collectionsRes.data || []);
      }

      if (contentRes.success) {
        setFeaturedContent(contentRes.data?.items || []);
      }

      if (trendingRes.success) {
        setTrendingContent(trendingRes.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/category/${categoryId}`);
  };

  const handleContentClick = (content: ContentItem) => {
    navigate(`/content/${content._id}`);
  };

  const featuredItem = featuredContent[0] || trendingContent[0];

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
      <Navbar />
      
      {/* Hero Section */}
      {featuredItem && (
        <Box
          sx={{
            position: 'relative',
            height: { xs: '50vh', md: '70vh' },
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%), url(${featuredItem.posterUrl || '/placeholder-hero.jpg'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{ maxWidth: '600px' }}>
              <Typography
                variant="h2"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  mb: 2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                }}
              >
                {featuredItem.title}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#b3b3b3',
                  mb: 3,
                  lineHeight: 1.4,
                }}
              >
                {featuredItem.synopsis || 'Experience the best in anime and manga entertainment'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrow />}
                  onClick={() => handleContentClick(featuredItem)}
                  sx={{
                    backgroundColor: 'white',
                    color: 'black',
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                >
                  Play
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Info />}
                  onClick={() => handleContentClick(featuredItem)}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  More Info
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      )}

      {/* Categories */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            mb: 3,
          }}
        >
          Browse by Category
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            pb: 2,
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#2a2a2a',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#e50914',
              borderRadius: '4px',
            },
          }}
        >
          {categories.map((category) => (
            <Button
              key={category._id}
              variant="outlined"
              onClick={() => handleCategoryClick(category._id)}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                borderRadius: '20px',
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                '&:hover': {
                  borderColor: '#e50914',
                  backgroundColor: 'rgba(229, 9, 20, 0.1)',
                },
              }}
            >
              {category.name}
            </Button>
          ))}
        </Box>
      </Container>

      {/* Trending Content */}
      {trendingContent.length > 0 && (
        <Container maxWidth="xl" sx={{ pb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              mb: 3,
            }}
          >
            Trending Now
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 2,
              '&::-webkit-scrollbar': {
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#2a2a2a',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#e50914',
                borderRadius: '4px',
              },
            }}
          >
            {trendingContent.map((content) => (
              <Box key={content._id} sx={{ minWidth: 300, maxWidth: 300 }}>
                <ContentCard
                  content={content}
                  onClick={() => handleContentClick(content)}
                />
              </Box>
            ))}
          </Box>
        </Container>
      )}

      {/* All Content */}
      {featuredContent.length > 0 && (
        <Container maxWidth="xl" sx={{ pb: 8 }}>
          <Typography
            variant="h4"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              mb: 3,
            }}
          >
            All Content
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 2,
              '&::-webkit-scrollbar': {
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#2a2a2a',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#e50914',
                borderRadius: '4px',
              },
            }}
          >
            {featuredContent.map((content) => (
              <Box key={content._id} sx={{ minWidth: 300, maxWidth: 300 }}>
                <ContentCard
                  content={content}
                  onClick={() => handleContentClick(content)}
                />
              </Box>
            ))}
          </Box>
        </Container>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
          action={
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
              Dismiss
            </button>
          }
        >
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default HomePage;
