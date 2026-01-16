import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  LinearProgress,
  Link,
  Tooltip,
} from '@mui/material';
import {
  YouTube,
  Upload,
  Link as LinkIcon,
  CheckCircle,
  Error as ErrorIcon,
  Pending,
  OpenInNew,
  Refresh,
} from '@mui/icons-material';
import apiClient from '../services/apiClient';

interface YouTubeUpload {
  _id: string;
  videoId: string;
  videoTitle: string;
  youtubeVideoId?: string;
  youtubeUrl?: string;
  title: string;
  description: string;
  tags: string[];
  status: 'PENDING' | 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress?: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

interface YouTubeManagerProps {
  videoId?: string;
  onUploadComplete?: (upload: YouTubeUpload) => void;
  compact?: boolean;
}

const YouTubeManager: React.FC<YouTubeManagerProps> = ({
  videoId,
  onUploadComplete,
  compact = false,
}) => {
  const theme = useTheme();
  const [uploads, setUploads] = useState<YouTubeUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [authDialog, setAuthDialog] = useState(false);
  const [authUrl, setAuthUrl] = useState<string>('');
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    tags: '',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadUploads();
  }, [videoId]);

  const loadUploads = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getYouTubeUploads();
      if (response.success) {
        setUploads(response.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load YouTube uploads');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    try {
      const response = await apiClient.getYouTubeAuthUrl();
      if (response.success) {
        setAuthUrl(response.data.authUrl);
        setAuthDialog(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get YouTube auth URL');
    }
  };

  const handleUpload = async () => {
    if (!videoId) return;

    try {
      setUploading(true);
      const uploadData = {
        videoId,
        title: uploadForm.title,
        description: uploadForm.description,
        tags: uploadForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      const response = await apiClient.uploadToYouTube(uploadData);
      if (response.success) {
        setUploadDialog(false);
        setUploadForm({ title: '', description: '', tags: '' });
        loadUploads();
        if (onUploadComplete) {
          onUploadComplete(response.data);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload to YouTube');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#4caf50';
      case 'UPLOADING': return '#2196f3';
      case 'PROCESSING': return '#ff9800';
      case 'PENDING': return '#9c27b0';
      case 'FAILED': return '#f44336';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle />;
      case 'UPLOADING': return <CircularProgress size={20} />;
      case 'PROCESSING': return <CircularProgress size={20} />;
      case 'FAILED': return <ErrorIcon />;
      default: return <Pending />;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.toLowerCase().replace(/_/g, ' ');
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
          YouTube Uploads
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadUploads}
            sx={{
              borderColor: 'white',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<YouTube />}
            onClick={handleAuth}
            sx={{
              borderColor: '#ff0000',
              color: '#ff0000',
              '&:hover': {
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
              },
            }}
          >
            Connect YouTube
          </Button>
          {videoId && (
            <Button
              variant="contained"
              startIcon={<Upload />}
              onClick={() => setUploadDialog(true)}
              sx={{
                backgroundColor: '#e50914',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#f40612',
                },
              }}
            >
              Upload to YouTube
            </Button>
          )}
        </Box>
      </Box>

      {/* Uploads Grid */}
      <Grid container spacing={2}>
        {uploads.map((upload) => (
          <Grid item xs={12} sm={6} md={4} key={upload._id}>
            <Card
              sx={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardMedia
                component="div"
                sx={{
                  height: 120,
                  backgroundColor: '#2a2a2a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <YouTube sx={{ fontSize: 48, color: '#ff0000' }} />
                <Chip
                  label={getStatusLabel(upload.status)}
                  size="small"
                  icon={getStatusIcon(upload.status)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: getStatusColor(upload.status),
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.7rem',
                  }}
                />
              </CardMedia>
              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                  {upload.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 2 }}>
                  {upload.videoTitle}
                </Typography>
                
                {upload.progress && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={upload.progress}
                      sx={{ backgroundColor: '#333', '& .MuiLinearProgress-bar': { backgroundColor: '#ff0000' } }}
                    />
                    <Typography variant="caption" sx={{ color: '#b3b3b3' }}>
                      {upload.progress}% Complete
                    </Typography>
                  </Box>
                )}

                {upload.youtubeUrl && (
                  <Box sx={{ mb: 2 }}>
                    <Link
                      href={upload.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: '#ff0000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      View on YouTube
                      <OpenInNew sx={{ fontSize: 16 }} />
                    </Link>
                  </Box>
                )}

                {upload.error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {upload.error}
                  </Alert>
                )}

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {upload.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: '0.6rem',
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialog}
        onClose={() => setUploadDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            color: 'white',
          },
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>
          Upload to YouTube
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            label="Title"
            value={uploadForm.title}
            onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
            sx={{
              mb: 2,
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
              '& .MuiInputLabel-root': {
                color: '#b3b3b3',
                '&.Mui-focused': {
                  color: '#e50914',
                },
              },
              '& .MuiInputBase-input': {
                color: 'white',
              },
            }}
          />
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={uploadForm.description}
            onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
            sx={{
              mb: 2,
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
              '& .MuiInputLabel-root': {
                color: '#b3b3b3',
                '&.Mui-focused': {
                  color: '#e50914',
                },
              },
              '& .MuiInputBase-input': {
                color: 'white',
              },
            }}
          />
          
          <TextField
            fullWidth
            label="Tags (comma-separated)"
            value={uploadForm.tags}
            onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
            placeholder="anime, manga, entertainment"
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
              '& .MuiInputLabel-root': {
                color: '#b3b3b3',
                '&.Mui-focused': {
                  color: '#e50914',
                },
              },
              '& .MuiInputBase-input': {
                color: 'white',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setUploadDialog(false)} sx={{ color: '#ccc' }}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={uploading}
            sx={{
              backgroundColor: '#e50914',
              color: 'white',
              '&:hover': {
                backgroundColor: '#f40612',
              },
            }}
          >
            {uploading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Auth Dialog */}
      <Dialog
        open={authDialog}
        onClose={() => setAuthDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            color: 'white',
          },
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>
          Connect YouTube Account
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ color: '#b3b3b3', mb: 3 }}>
            Click the button below to authorize this application to upload videos to your YouTube channel.
          </Typography>
          <Button
            fullWidth
            variant="contained"
            startIcon={<YouTube />}
            href={authUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              backgroundColor: '#ff0000',
              color: 'white',
              '&:hover': {
                backgroundColor: '#cc0000',
              },
            }}
          >
            Authorize YouTube Access
          </Button>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAuthDialog(false)} sx={{ color: '#ccc' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default YouTubeManager;
