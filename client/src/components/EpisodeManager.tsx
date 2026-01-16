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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  PlayArrow,
  AutoAwesome,
  RecordVoiceOver,
  VideoSettings,
  CheckCircle,
  Pending,
  Error as ErrorIcon,
} from '@mui/icons-material';
import apiClient from '../services/apiClient';
import ConfirmDialog from './ConfirmDialog';

interface Episode {
  _id: string;
  playlistId: string;
  episodeNumber: number;
  title: string;
  type: 'short' | 'long';
  status: 'draft' | 'published';
  videoId?: any;
  createdAt: string;
  updatedAt: string;
}

interface Video {
  _id: string;
  episodeId: {
    _id: string;
    title: string;
    episodeNumber: number;
    type: string;
  };
  scriptId?: {
    _id: string;
    content: string;
    style: string;
    duration: string;
    status: string;
  };
  voiceId?: {
    _id: string;
    audioUrl: string;
    durationSeconds: number;
    provider: string;
  };
  type: string;
  orientation: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  status: 'AI_PROCESSING' | 'DRAFT_READY' | 'IN_REVIEW' | 'FINAL_APPROVED' | 'PUBLISHED' | 'FAILED';
  error?: string;
  createdAt: string;
}

interface EpisodeManagerProps {
  playlistId: string;
  onEpisodeSelect?: (episode: Episode) => void;
  onVideoSelect?: (video: Video) => void;
  compact?: boolean;
}

const EpisodeManager: React.FC<EpisodeManagerProps> = ({
  playlistId,
  onEpisodeSelect,
  onVideoSelect,
  compact = false,
}) => {
  const theme = useTheme();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [episodeToDelete, setEpisodeToDelete] = useState<Episode | null>(null);
  const [episodeForm, setEpisodeForm] = useState({
    title: '',
    type: 'short' as 'short' | 'long',
  });

  useEffect(() => {
    if (playlistId) {
      loadData();
    }
  }, [playlistId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [episodesRes, videosRes] = await Promise.all([
        apiClient.getEpisodes(playlistId),
        apiClient.getVideos({ playlistId }),
      ]);

      if (episodesRes.success) {
        setEpisodes(episodesRes.data || []);
      }

      if (videosRes.success) {
        setVideos(videosRes.data?.videos || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load episodes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEpisode = async () => {
    if (!playlistId) return;

    try {
      const episodeNumber = episodes.length + 1;
      const episodeData = {
        playlistId,
        episodeNumber,
        title: episodeForm.title || `Episode ${episodeNumber}`,
        type: episodeForm.type,
        status: 'draft',
      };

      const response = await apiClient.createEpisode(episodeData);
      if (response.success) {
        setDialogOpen(false);
        setEpisodeForm({ title: '', type: 'short' });
        loadData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create episode');
    }
  };

  const handleUpdateEpisode = async () => {
    if (!editingEpisode) return;

    try {
      const response = await apiClient.updateEpisode(editingEpisode._id, episodeForm);
      if (response.success) {
        setDialogOpen(false);
        setEditingEpisode(null);
        setEpisodeForm({ title: '', type: 'short' });
        loadData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update episode');
    }
  };

  const handleDeleteEpisode = async (episode: Episode) => {
    try {
      await apiClient.deleteEpisode(episode._id);
      setDeleteDialog(false);
      setEpisodeToDelete(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete episode');
    }
  };

  const handleGenerateAIDraft = async (episode: Episode) => {
    // This would open the AI generation dialog
    if (onEpisodeSelect) {
      onEpisodeSelect(episode);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return '#4caf50';
      case 'draft': return '#ff9800';
      case 'AI_PROCESSING': return '#2196f3';
      case 'DRAFT_READY': return '#9c27b0';
      case 'IN_REVIEW': return '#f4c430';
      case 'FINAL_APPROVED': return '#4caf50';
      case 'PUBLISHED': return '#e50914';
      case 'FAILED': return '#f44336';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle />;
      case 'draft': return <Pending />;
      case 'AI_PROCESSING': return <CircularProgress size={20} />;
      case 'FAILED': return <ErrorIcon />;
      default: return <Pending />;
    }
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
          Episodes ({episodes.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          sx={{
            backgroundColor: '#e50914',
            color: 'white',
            '&:hover': {
              backgroundColor: '#f40612',
            },
          }}
        >
          Add Episode
        </Button>
      </Box>

      {/* Episodes Grid */}
      <Grid container spacing={2}>
        {episodes.map((episode) => {
          const episodeVideo = videos.find(v => v.episodeId._id === episode._id);
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={episode._id}>
              <Card
                sx={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    border: '1px solid #e50914',
                  },
                }}
                onClick={() => onEpisodeSelect && onEpisodeSelect(episode)}
              >
                <CardMedia
                  component="div"
                  sx={{
                    height: compact ? 120 : 200,
                    backgroundColor: '#2a2a2a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {episodeVideo?.thumbnailUrl ? (
                    <img
                      src={episodeVideo.thumbnailUrl}
                      alt={episode.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <PlayArrow sx={{ fontSize: compact ? 32 : 48, color: '#666' }} />
                  )}
                  {episodeVideo && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: getStatusColor(episodeVideo.status),
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {episodeVideo.status.replace(/_/g, ' ')}
                    </Box>
                  )}
                </CardMedia>
                <CardContent sx={{ flexGrow: 1, p: compact ? 1 : 2 }}>
                  <Typography variant={compact ? 'body2' : 'h6'} sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                    {episode.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 1 }}>
                    Episode {episode.episodeNumber} • {episode.type}
                  </Typography>
                  
                  {/* AI Status Indicators */}
                  {!compact && (
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      {episodeVideo?.scriptId && (
                        <Chip
                          icon={<AutoAwesome />}
                          label="Script"
                          size="small"
                          sx={{
                            backgroundColor: '#4caf50',
                            color: 'white',
                            fontSize: '0.7rem',
                          }}
                        />
                      )}
                      {episodeVideo?.voiceId && (
                        <Chip
                          icon={<RecordVoiceOver />}
                          label="Voice"
                          size="small"
                          sx={{
                            backgroundColor: '#2196f3',
                            color: 'white',
                            fontSize: '0.7rem',
                          }}
                        />
                      )}
                      {episodeVideo && (
                        <Chip
                          icon={<VideoSettings />}
                          label="Video"
                          size="small"
                          sx={{
                            backgroundColor: '#9c27b0',
                            color: 'white',
                            fontSize: '0.7rem',
                          }}
                        />
                      )}
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<AutoAwesome />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateAIDraft(episode);
                      }}
                      sx={{
                        backgroundColor: '#e50914',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#f40612',
                        },
                      }}
                    >
                      AI Draft
                    </Button>
                    {episodeVideo && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PlayArrow />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onVideoSelect && onVideoSelect(episodeVideo);
                        }}
                        sx={{
                          borderColor: 'white',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      >
                        Edit
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingEpisode(episode);
                        setEpisodeForm({
                          title: episode.title,
                          type: episode.type,
                        });
                        setDialogOpen(true);
                      }}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Delete />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEpisodeToDelete(episode);
                        setDeleteDialog(true);
                      }}
                      sx={{
                        borderColor: '#f44336',
                        color: '#f44336',
                        '&:hover': {
                          backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        },
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Episode Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingEpisode(null);
          setEpisodeForm({ title: '', type: 'short' });
        }}
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
          {editingEpisode ? 'Edit Episode' : 'Create Episode'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            label="Title"
            value={episodeForm.title}
            onChange={(e) => setEpisodeForm({ ...episodeForm, title: e.target.value })}
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
          
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#b3b3b3', '&.Mui-focused': { color: '#e50914' } }}>
              Type
            </InputLabel>
            <Select
              value={episodeForm.type}
              onChange={(e) => setEpisodeForm({ ...episodeForm, type: e.target.value as 'short' | 'long' })}
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
              <MenuItem value="short">Short</MenuItem>
              <MenuItem value="long">Long</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => {
            setDialogOpen(false);
            setEditingEpisode(null);
            setEpisodeForm({ title: '', type: 'short' });
          }} sx={{ color: '#ccc' }}>
            Cancel
          </Button>
          <Button
            onClick={editingEpisode ? handleUpdateEpisode : handleCreateEpisode}
            variant="contained"
            sx={{
              backgroundColor: '#e50914',
              color: 'white',
              '&:hover': {
                backgroundColor: '#f40612',
              },
            }}
          >
            {editingEpisode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog}
        title="Delete Episode"
        message={`Are you sure you want to delete "${episodeToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
        onConfirm={() => episodeToDelete && handleDeleteEpisode(episodeToDelete)}
        onCancel={() => {
          setDeleteDialog(false);
          setEpisodeToDelete(null);
        }}
      />
    </Box>
  );
};

export default EpisodeManager;
