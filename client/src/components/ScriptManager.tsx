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
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  Paper,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  AutoAwesome,
  Edit,
  Delete,
  CheckCircle,
  Pending,
  Error as ErrorIcon,
  Visibility,
  Close,
  ThumbUp,
  ThumbDown,
} from '@mui/icons-material';
import apiClient from '../services/apiClient';
import ConfirmDialog from './ConfirmDialog';

interface Script {
  _id: string;
  episodeId: string;
  episode?: {
    _id: string;
    title: string;
    episodeNumber: number;
    type: string;
  };
  duration: string;
  style: string;
  content: string;
  status: 'DRAFT' | 'APPROVED';
  createdAt: string;
  updatedAt: string;
}

interface ScriptManagerProps {
  episodeId?: string;
  onScriptSelect?: (script: Script) => void;
  onScriptApprove?: (script: Script) => void;
  compact?: boolean;
  showActions?: boolean;
}

const ScriptManager: React.FC<ScriptManagerProps> = ({
  episodeId,
  onScriptSelect,
  onScriptApprove,
  compact = false,
  showActions = true,
}) => {
  const theme = useTheme();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [scriptToDelete, setScriptToDelete] = useState<Script | null>(null);
  const [generating, setGenerating] = useState(false);
  const [scriptForm, setScriptForm] = useState({
    duration: 'short',
    style: 'explained',
    content: '',
  });

  useEffect(() => {
    loadScripts();
  }, [episodeId]);

  const loadScripts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get scripts from videos since scripts are linked to videos
      const params = episodeId ? { playlistId: undefined } : {};
      const response = await apiClient.getVideos(params);
      
      if (response.success) {
        const videos = response.data?.videos || [];
        const extractedScripts = videos
          .filter((v: any) => v.scriptId)
          .map((v: any) => ({
            ...v.scriptId,
            episodeId: v.episodeId._id,
            episode: v.episodeId,
          }));
        setScripts(extractedScripts);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load scripts');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!episodeId) return;

    try {
      setGenerating(true);
      const scriptData = {
        episodeId,
        duration: scriptForm.duration,
        style: scriptForm.style,
      };

      const response = await apiClient.generateScript(scriptData);
      if (response.success) {
        loadScripts();
        if (onScriptSelect) {
          onScriptSelect(response.data);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate script');
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateScript = async () => {
    if (!selectedScript) return;

    try {
      const response = await apiClient.updateScript(selectedScript._id, scriptForm);
      if (response.success) {
        setEditDialog(false);
        setSelectedScript(null);
        loadScripts();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update script');
    }
  };

  const handleApproveScript = async (script: Script) => {
    try {
      const response = await apiClient.approveScript(script._id);
      if (response.success) {
        loadScripts();
        if (onScriptApprove) {
          onScriptApprove(script);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to approve script');
    }
  };

  const handleDeleteScript = async (script: Script) => {
    // Scripts are deleted when the associated video is deleted
    // This is just a placeholder for UI consistency
    setDeleteDialog(false);
    setScriptToDelete(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#4caf50';
      case 'DRAFT': return '#ff9800';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle />;
      case 'DRAFT': return <Pending />;
      default: return <Pending />;
    }
  };

  const getDurationColor = (duration: string) => {
    switch (duration) {
      case 'short': return '#2196f3';
      case 'medium': return '#ff9800';
      case 'long': return '#4caf50';
      default: return '#757575';
    }
  };

  const getStyleColor = (style: string) => {
    switch (style) {
      case 'explained': return '#9c27b0';
      case 'narrative': return '#e50914';
      case 'conversational': return '#00bcd4';
      default: return '#757575';
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
          Scripts ({scripts.length})
        </Typography>
        {episodeId && showActions && (
          <Button
            variant="contained"
            startIcon={generating ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <AutoAwesome />}
            onClick={handleGenerateScript}
            disabled={generating}
            sx={{
              backgroundColor: '#e50914',
              color: 'white',
              '&:hover': {
                backgroundColor: '#f40612',
              },
            }}
          >
            {generating ? 'Generating...' : 'Generate Script'}
          </Button>
        )}
      </Box>

      {/* Scripts Grid */}
      <Grid container spacing={2}>
        {scripts.map((script) => (
          <Grid item xs={12} sm={6} md={4} key={script._id}>
            <Card
              sx={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    {script.episode && (
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                        Episode {script.episode.episodeNumber}: {script.episode.title}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 1 }}>
                      {script.content.substring(0, 100)}...
                    </Typography>
                  </Box>
                  <Chip
                    label={script.status}
                    size="small"
                    icon={getStatusIcon(script.status)}
                    sx={{
                      backgroundColor: getStatusColor(script.status),
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>

                {/* Metadata */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={script.duration}
                    size="small"
                    sx={{
                      backgroundColor: getDurationColor(script.duration),
                      color: 'white',
                      fontSize: '0.7rem',
                    }}
                  />
                  <Chip
                    label={script.style}
                    size="small"
                    sx={{
                      backgroundColor: getStyleColor(script.style),
                      color: 'white',
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>

                {/* Actions */}
                {showActions && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Tooltip title="View Script">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => {
                          setSelectedScript(script);
                          setViewDialog(true);
                        }}
                        sx={{
                          borderColor: 'white',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      >
                        View
                      </Button>
                    </Tooltip>
                    
                    <Tooltip title="Edit Script">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => {
                          setSelectedScript(script);
                          setScriptForm({
                            duration: script.duration,
                            style: script.style,
                            content: script.content,
                          });
                          setEditDialog(true);
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
                    </Tooltip>

                    {script.status === 'DRAFT' && (
                      <Tooltip title="Approve Script">
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<ThumbUp />}
                          onClick={() => handleApproveScript(script)}
                          sx={{
                            backgroundColor: '#4caf50',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#45a049',
                            },
                          }}
                        >
                          Approve
                        </Button>
                      </Tooltip>
                    )}

                    <Tooltip title="Delete Script">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Delete />}
                        onClick={() => {
                          setScriptToDelete(script);
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
                    </Tooltip>
                  </Box>
                )}

                {/* Timestamp */}
                <Typography variant="caption" sx={{ color: '#666', mt: 2, display: 'block' }}>
                  Created: {new Date(script.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* View Script Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            color: 'white',
          },
        }}
      >
        <DialogTitle sx={{ color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Script Content
          <IconButton onClick={() => setViewDialog(false)} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedScript && (
            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={selectedScript.duration}
                  size="small"
                  sx={{
                    backgroundColor: getDurationColor(selectedScript.duration),
                    color: 'white',
                  }}
                />
                <Chip
                  label={selectedScript.style}
                  size="small"
                  sx={{
                    backgroundColor: getStyleColor(selectedScript.style),
                    color: 'white',
                  }}
                />
                <Chip
                  label={selectedScript.status}
                  size="small"
                  icon={getStatusIcon(selectedScript.status)}
                  sx={{
                    backgroundColor: getStatusColor(selectedScript.status),
                    color: 'white',
                  }}
                />
              </Box>
              
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #333',
                  maxHeight: '400px',
                  overflow: 'auto',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ color: 'white', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                >
                  {selectedScript.content}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Script Dialog */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
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
          Edit Script
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={8}
            label="Script Content"
            value={scriptForm.content}
            onChange={(e) => setScriptForm({ ...scriptForm, content: e.target.value })}
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
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditDialog(false)} sx={{ color: '#ccc' }}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateScript}
            variant="contained"
            sx={{
              backgroundColor: '#e50914',
              color: 'white',
              '&:hover': {
                backgroundColor: '#f40612',
              },
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog}
        title="Delete Script"
        message={`Are you sure you want to delete this script? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
        onConfirm={() => scriptToDelete && handleDeleteScript(scriptToDelete)}
        onCancel={() => {
          setDeleteDialog(false);
          setScriptToDelete(null);
        }}
      />
    </Box>
  );
};

export default ScriptManager;
