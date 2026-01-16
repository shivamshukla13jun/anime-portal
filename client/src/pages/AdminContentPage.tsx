import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Grid,
  LinearProgress,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  YouTube,
  Upload,
  PlayArrow,
  Refresh,
  Search,
  FilterList,
  Publish,
  Unpublished,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import apiClient from '../services/apiClient';

interface Content {
  _id: string;
  title: string;
  synopsis: string;
  type: string;
  genres: string[];
  source: string;
  posterUrl?: string;
  rating: number;
  popularity: number;
  releaseYear: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const AdminContentPage: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<Content[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    synopsis: '',
    type: 'anime',
    genres: '',
    source: 'manual',
    posterUrl: '',
    rating: 7.5,
    popularity: 0,
    releaseYear: new Date().getFullYear(),
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterGenre, setFilterGenre] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getContent({ status: 'all' }); // Get all content for admin
      
      if (response.success) {
        setContent(response.data?.items || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async () => {
    if (!formData.title.trim() || !formData.synopsis.trim()) {
      setError('Title and synopsis are required');
      return;
    }

    setCreating(true);
    try {
      const contentData = {
        ...formData,
        genres: formData.genres.split(',').map(g => g.trim()).filter(g => g),
        externalId: Date.now().toString(),
        raw: {},
        trendScore: 0,
      };

      const response = await apiClient.createContent(contentData);
      
      if (response.success) {
        setCreateDialogOpen(false);
        setFormData({
          title: '',
          synopsis: '',
          type: 'anime',
          genres: '',
          source: 'manual',
          posterUrl: '',
          rating: 7.5,
          popularity: 0,
          releaseYear: new Date().getFullYear(),
        });
        loadContent();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create content');
    } finally {
      setCreating(false);
    }
  };

  const handlePublish = async (contentId: string) => {
    try {
      await apiClient.publishContent(contentId);
      loadContent();
    } catch (err: any) {
      setError(err.message || 'Failed to publish content');
    }
  };

  const handleUnpublish = async (contentId: string) => {
    try {
      await apiClient.unpublishContent(contentId);
      loadContent();
    } catch (err: any) {
      setError(err.message || 'Failed to unpublish content');
    }
  };

  const handleDelete = async (contentId: string) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await apiClient.deleteContent(contentId);
        loadContent();
      } catch (err: any) {
        setError(err.message || 'Failed to delete content');
      }
    }
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.synopsis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesGenre = filterGenre === 'all' || item.genres.includes(filterGenre);
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesType && matchesGenre && matchesStatus;
  });

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
      
      <Container maxWidth="xl" sx={{ pt: 4, pb: 8 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                mb: 1,
              }}
            >
              Manage Content
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#ccc',
              }}
            >
              Create and manage all anime, manga, and video content
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              backgroundColor: '#e50914',
              color: 'white',
              '&:hover': {
                backgroundColor: '#f40612',
              },
            }}
          >
            Create Content
          </Button>
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

        {/* Filters */}
        <Box sx={{ backgroundColor: '#1a1a1a', borderRadius: 2, p: 3, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: '#ccc', mr: 1 }} />,
                  sx: {
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#333',
                    },
                  },
                }}
                InputLabelProps={{
                  sx: { color: '#ccc' },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#ccc' }}>Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#333',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white',
                    },
                  }}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="anime">Anime</MenuItem>
                  <MenuItem value="manga">Manga</MenuItem>
                  <MenuItem value="movie">Movie</MenuItem>
                  <MenuItem value="show">Show</MenuItem>
                  <MenuItem value="webseries">Web Series</MenuItem>
                  <MenuItem value="shorts">Shorts</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#ccc' }}>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#333',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white',
                    },
                  }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterGenre('all');
                  setFilterStatus('all');
                }}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  py: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Content Grid */}
        <Box sx={{ backgroundColor: '#1a1a1a', borderRadius: 2, p: 3 }}>
          {filteredContent.length > 0 ? (
            <Grid container spacing={3}>
              {filteredContent.map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                  <Card
                    sx={{
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #333',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(229, 9, 20, 0.3)',
                      },
                    }}
                  >
                    {item.posterUrl ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={item.posterUrl}
                        alt={item.title}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 200,
                          backgroundColor: '#1a1a1a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#666',
                        }}
                      >
                        No Poster
                      </Box>
                    )}
                    <CardContent sx={{ p: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'white',
                          fontWeight: 'bold',
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#ccc',
                          mb: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.synopsis}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip
                          label={item.type}
                          size="small"
                          sx={{
                            backgroundColor: '#666',
                            color: 'white',
                          }}
                        />
                        <Chip
                          label={item.status}
                          size="small"
                          sx={{
                            backgroundColor: '#666',
                            color: 'white',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#ccc' }}>
                          {item.rating?.toFixed(1)}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {item.status === 'draft' ? (
                            <IconButton
                              size="small"
                              onClick={() => handlePublish(item._id)}
                              sx={{ color: '#4caf50' }}
                              title="Publish"
                            >
                              <Publish />
                            </IconButton>
                          ) : (
                            <IconButton
                              size="small"
                              onClick={() => handleUnpublish(item._id)}
                              sx={{ color: '#ff9800' }}
                              title="Unpublish"
                            >
                              <Unpublished />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            sx={{ color: '#f44336' }}
                            onClick={() => handleDelete(item._id)}
                            title="Delete"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
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
                No content found
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#888',
                }}
              >
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start by creating your first content'}
              </Typography>
            </Box>
          )}
        </Box>
      </Container>

      {/* Create Content Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            color: 'white',
          },
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>Create New Content</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                sx={{ mb: 2 }}
                InputProps={{
                  sx: {
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#333',
                    },
                  },
                }}
                InputLabelProps={{
                  sx: { color: '#ccc' },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Synopsis"
                multiline
                rows={3}
                value={formData.synopsis}
                onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                sx={{ mb: 2 }}
                InputProps={{
                  sx: {
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#333',
                    },
                  },
                }}
                InputLabelProps={{
                  sx: { color: '#ccc' },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel sx={{ color: '#ccc' }}>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#333',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white',
                    },
                  }}
                >
                  <MenuItem value="anime">Anime</MenuItem>
                  <MenuItem value="manga">Manga</MenuItem>
                  <MenuItem value="movie">Movie</MenuItem>
                  <MenuItem value="show">Show</MenuItem>
                  <MenuItem value="webseries">Web Series</MenuItem>
                  <MenuItem value="shorts">Shorts</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Poster URL"
                value={formData.posterUrl}
                onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                sx={{ mb: 2 }}
                InputProps={{
                  sx: {
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#333',
                    },
                  },
                }}
                InputLabelProps={{
                  sx: { color: '#ccc' },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Genres (comma-separated)"
                value={formData.genres}
                onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                placeholder="action, adventure, comedy"
                sx={{ mb: 2 }}
                InputProps={{
                  sx: {
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#333',
                    },
                  },
                }}
                InputLabelProps={{
                  sx: { color: '#ccc' },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Rating"
                type="number"
                inputProps={{ min: 0, max: 10, step: 0.1 }}
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                sx={{ mb: 2 }}
                InputProps={{
                  sx: {
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#333',
                    },
                  },
                }}
                InputLabelProps={{
                  sx: { color: '#ccc' },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Release Year"
                type="number"
                value={formData.releaseYear}
                onChange={(e) => setFormData({ ...formData, releaseYear: parseInt(e.target.value) })}
                sx={{ mb: 2 }}
                InputProps={{
                  sx: {
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#333',
                    },
                  },
                }}
                InputLabelProps={{
                  sx: { color: '#ccc' },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel sx={{ color: '#ccc' }}>Source</InputLabel>
                <Select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#333',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white',
                    },
                  }}
                >
                  <MenuItem value="manual">Manual</MenuItem>
                  <MenuItem value="anilist">Anilist</MenuItem>
                  <MenuItem value="jikan">Jikan</MenuItem>
                  <MenuItem value="tmdb">TMDB</MenuItem>
                  <MenuItem value="youtube">YouTube</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCreateDialogOpen(false)} sx={{ color: '#ccc' }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateContent}
            disabled={creating}
            variant="contained"
            sx={{
              backgroundColor: '#e50914',
              color: 'white',
              '&:hover': {
                backgroundColor: '#f40612',
              },
            }}
          >
            {creating ? 'Creating...' : 'Create Content'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminContentPage;
