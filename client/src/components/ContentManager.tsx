import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Pagination,
  InputAdornment,
} from '@mui/material';
import {
  PlayArrow,
  TrendingUp,
  FilterList,
  Search as SearchIcon,
} from '@mui/icons-material';
import apiClient from '../services/apiClient';

interface Content {
  _id: string;
  title: string;
  description: string;
  type: 'anime' | 'manga' | 'movie' | 'series';
  genre: string;
  source: string;
  posterUrl: string;
  thumbnailUrl?: string;
  trendScore: number;
  popularity: number;
  rating?: number;
  releaseDate?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface ContentManagerProps {
  type?: string;
  genre?: string;
  source?: string;
  onContentSelect?: (content: Content) => void;
  compact?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
}

const ContentManager: React.FC<ContentManagerProps> = ({
  type,
  genre,
  source,
  onContentSelect,
  compact = false,
  showFilters = true,
  showPagination = true,
}) => {
  const theme = useTheme();
  const [content, setContent] = useState<Content[]>([]);
  const [trendingContent, setTrendingContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: type || '',
    genre: genre || '',
    source: source || '',
    sort: 'trendScore',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  useEffect(() => {
    loadContent();
    loadTrendingContent();
  }, [filters, pagination.page]);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        type: filters.type || undefined,
        genre: filters.genre || undefined,
        source: filters.source || undefined,
        sort: filters.sort,
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await apiClient.getContent(params);
      if (response.success) {
        setContent(response.data?.content || []);
        setPagination(prev => ({
          ...prev,
          total: response.data?.total || 0,
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingContent = async () => {
    try {
      const response = await apiClient.getTrendingContent(10);
      if (response.success) {
        setTrendingContent(response.data || []);
      }
    } catch (err) {
      // Trending content is optional, don't show error
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPagination(prev => ({ ...prev, page: value }));
  };

  const getTypeColor = (contentType: string) => {
    switch (contentType) {
      case 'anime': return '#e50914';
      case 'manga': return '#2196f3';
      case 'movie': return '#4caf50';
      case 'series': return '#ff9800';
      default: return '#757575';
    }
  };

  const formatPopularity = (popularity: number) => {
    if (popularity >= 1000000) return `${(popularity / 1000000).toFixed(1)}M`;
    if (popularity >= 1000) return `${(popularity / 1000).toFixed(1)}K`;
    return popularity.toString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress sx={{ color: '#e50914' }} />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
          Content Library
        </Typography>
        <Button
          variant="outlined"
          startIcon={<TrendingUp />}
          onClick={() => loadTrendingContent()}
          sx={{
            borderColor: 'white',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          Refresh Trending
        </Button>
      </Box>

      {/* Trending Section */}
      {trendingContent.length > 0 && !compact && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
            <TrendingUp sx={{ verticalAlign: 'middle', mr: 1, color: '#e50914' }} />
            Trending Now
          </Typography>
          <Grid container spacing={2}>
            {trendingContent.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={item._id}>
                <Card
                  sx={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    cursor: 'pointer',
                    '&:hover': {
                      border: '1px solid #e50914',
                    },
                  }}
                  onClick={() => onContentSelect && onContentSelect(item)}
                >
                  <CardMedia
                    component="img"
                    image={item.posterUrl || '/placeholder-content.jpg'}
                    alt={item.title}
                    sx={{ height: 200 }}
                  />
                  <CardContent sx={{ p: 1 }}>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#b3b3b3' }}>
                      {item.genre}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Filters */}
      {showFilters && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#1a1a1a', borderRadius: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                placeholder="Search content..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#b3b3b3' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#e50914',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#b3b3b3', '&.Mui-focused': { color: '#e50914' } }}>
                  Type
                </InputLabel>
                <Select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#e50914',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white',
                    },
                  }}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="anime">Anime</MenuItem>
                  <MenuItem value="manga">Manga</MenuItem>
                  <MenuItem value="movie">Movie</MenuItem>
                  <MenuItem value="series">Series</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#b3b3b3', '&.Mui-focused': { color: '#e50914' } }}>
                  Genre
                </InputLabel>
                <Select
                  value={filters.genre}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#e50914',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white',
                    },
                  }}
                >
                  <MenuItem value="">All Genres</MenuItem>
                  <MenuItem value="action">Action</MenuItem>
                  <MenuItem value="adventure">Adventure</MenuItem>
                  <MenuItem value="comedy">Comedy</MenuItem>
                  <MenuItem value="drama">Drama</MenuItem>
                  <MenuItem value="fantasy">Fantasy</MenuItem>
                  <MenuItem value="horror">Horror</MenuItem>
                  <MenuItem value="romance">Romance</MenuItem>
                  <MenuItem value="sci-fi">Sci-Fi</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#b3b3b3', '&.Mui-focused': { color: '#e50914' } }}>
                  Source
                </InputLabel>
                <Select
                  value={filters.source}
                  onChange={(e) => handleFilterChange('source', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#e50914',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white',
                    },
                  }}
                >
                  <MenuItem value="">All Sources</MenuItem>
                  <MenuItem value="crunchyroll">Crunchyroll</MenuItem>
                  <MenuItem value="funimation">Funimation</MenuItem>
                  <MenuItem value="netflix">Netflix</MenuItem>
                  <MenuItem value="youtube">YouTube</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#b3b3b3', '&.Mui-focused': { color: '#e50914' } }}>
                  Sort By
                </InputLabel>
                <Select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#e50914',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white',
                    },
                  }}
                >
                  <MenuItem value="trendScore">Trending</MenuItem>
                  <MenuItem value="popularity">Popularity</MenuItem>
                  <MenuItem value="rating">Rating</MenuItem>
                  <MenuItem value="releaseDate">Release Date</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Content Grid */}
      <Grid container spacing={2}>
        {content.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
            <Card
              sx={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                cursor: 'pointer',
                '&:hover': {
                  border: '1px solid #e50914',
                },
              }}
              onClick={() => onContentSelect && onContentSelect(item)}
            >
              <CardMedia
                component="img"
                image={item.posterUrl || '/placeholder-content.jpg'}
                alt={item.title}
                sx={{ height: compact ? 200 : 300 }}
              />
              <CardContent sx={{ p: compact ? 1 : 2 }}>
                <Typography variant={compact ? 'body2' : 'h6'} sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 2 }}>
                  {item.description}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={item.type}
                    size="small"
                    sx={{
                      backgroundColor: getTypeColor(item.type),
                      color: 'white',
                      fontSize: '0.7rem',
                    }}
                  />
                  <Chip
                    label={item.genre}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: '0.7rem',
                    }}
                  />
                  {item.rating && (
                    <Chip
                      label={`⭐ ${item.rating}`}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255, 215, 0, 0.2)',
                        color: '#ffd700',
                        fontSize: '0.7rem',
                      }}
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#b3b3b3' }}>
                    {formatPopularity(item.popularity)} views
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#b3b3b3' }}>
                    {item.source}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {showPagination && pagination.total > pagination.limit && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={Math.ceil(pagination.total / pagination.limit)}
            page={pagination.page}
            onChange={handlePageChange}
            sx={{
              '& .MuiPaginationItem-root': {
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&.Mui-selected': {
                  backgroundColor: '#e50914',
                },
              },
            }}
          />
        </Box>
      )}

      {content.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: '#b3b3b3' }}>
            No content found matching your filters.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ContentManager;
