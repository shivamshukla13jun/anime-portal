import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  LinearProgress,
  Tooltip,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  RecordVoiceOver,
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Download,
  Delete,
  Refresh,
  Settings,
} from '@mui/icons-material';
import apiClient from '../services/apiClient';
import ConfirmDialog from './ConfirmDialog';

interface Voice {
  _id: string;
  scriptId: string;
  script?: {
    _id: string;
    content: string;
    style: string;
    duration: string;
    status: string;
    episode?: {
      _id: string;
      title: string;
      episodeNumber: number;
      type: string;
    };
  };
  provider: string;
  audioUrl: string;
  durationSeconds: number;
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  error?: string;
  createdAt: string;
  updatedAt: string;
}

interface VoiceManagerProps {
  scriptId?: string;
  onVoiceSelect?: (voice: Voice) => void;
  onVoiceGenerated?: (voice: Voice) => void;
  compact?: boolean;
  showActions?: boolean;
}

const VoiceManager: React.FC<VoiceManagerProps> = ({
  scriptId,
  onVoiceSelect,
  onVoiceGenerated,
  compact = false,
  showActions = true,
}) => {
  const theme = useTheme();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [playDialog, setPlayDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [voiceToDelete, setVoiceToDelete] = useState<Voice | null>(null);
  const [generating, setGenerating] = useState(false);
  const [voiceForm, setVoiceForm] = useState({
    provider: 'google',
    voice: 'en-US-Standard-A',
    speed: 1.0,
    pitch: 0,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  useEffect(() => {
    loadVoices();
  }, [scriptId]);

  const loadVoices = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get voices from videos since voices are linked to videos
      const params = scriptId ? { playlistId: undefined } : {};
      const response = await apiClient.getVideos(params);
      
      if (response.success) {
        const videos = response.data?.videos || [];
        const extractedVoices = videos
          .filter((v: any) => v.voiceId)
          .map((v: any) => ({
            ...v.voiceId,
            scriptId: v.scriptId._id,
            script: {
              ...v.scriptId,
              episode: v.episodeId,
            },
          }));
        setVoices(extractedVoices);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load voices');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVoice = async () => {
    if (!scriptId) return;

    try {
      setGenerating(true);
      const voiceData = {
        scriptId,
        provider: voiceForm.provider,
        voice: voiceForm.voice,
        speed: voiceForm.speed,
        pitch: voiceForm.pitch,
      };

      const response = await apiClient.generateVoice(voiceData);
      if (response.success) {
        loadVoices();
        if (onVoiceGenerated) {
          onVoiceGenerated(response.data);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate voice');
    } finally {
      setGenerating(false);
    }
  };

  const handlePlayPause = (voice: Voice) => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.src = voice.audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleMuteToggle = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (event: Event, newValue: number | number[]) => {
    if (audioRef.current) {
      const time = Array.isArray(newValue) ? newValue[0] : newValue;
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleDeleteVoice = async (voice: Voice) => {
    // Voices are deleted when the associated video is deleted
    // This is just a placeholder for UI consistency
    setDeleteDialog(false);
    setVoiceToDelete(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#4caf50';
      case 'GENERATING': return '#2196f3';
      case 'PENDING': return '#ff9800';
      case 'FAILED': return '#f44336';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <RecordVoiceOver />;
      case 'GENERATING': return <CircularProgress size={20} />;
      case 'FAILED': return <VolumeUp />;
      default: return <VolumeUp />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'google': return '#4285f4';
      case 'amazon': return '#ff9900';
      case 'microsoft': return '#00a4ef';
      default: return '#757575';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
          Voices ({voices.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadVoices}
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
          {scriptId && showActions && (
            <Button
              variant="contained"
              startIcon={generating ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <RecordVoiceOver />}
              onClick={handleGenerateVoice}
              disabled={generating}
              sx={{
                backgroundColor: '#e50914',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#f40612',
                },
              }}
            >
              {generating ? 'Generating...' : 'Generate Voice'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Voices Grid */}
      <Grid container spacing={2}>
        {voices.map((voice) => (
          <Grid item xs={12} sm={6} md={4} key={voice._id}>
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
                    {voice.script?.episode && (
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                        Episode {voice.script.episode.episodeNumber}: {voice.script.episode.title}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 1 }}>
                      {voice.script?.content?.substring(0, 80)}...
                    </Typography>
                  </Box>
                  <Chip
                    label={voice.status}
                    size="small"
                    icon={getStatusIcon(voice.status)}
                    sx={{
                      backgroundColor: getStatusColor(voice.status),
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>

                {/* Metadata */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={voice.provider}
                    size="small"
                    sx={{
                      backgroundColor: getProviderColor(voice.provider),
                      color: 'white',
                      fontSize: '0.7rem',
                    }}
                  />
                  <Chip
                    label={formatDuration(voice.durationSeconds)}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>

                {/* Audio Controls */}
                {voice.status === 'COMPLETED' && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedVoice(voice);
                          handlePlayPause(voice);
                        }}
                        sx={{ color: 'white' }}
                      >
                        {isPlaying && selectedVoice?._id === voice._id ? <Pause /> : <PlayArrow />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={handleMuteToggle}
                        sx={{ color: 'white' }}
                      >
                        {isMuted ? <VolumeOff /> : <VolumeUp />}
                      </IconButton>
                      <Typography variant="caption" sx={{ color: '#b3b3b3' }}>
                        {formatDuration(currentTime)} / {formatDuration(duration)}
                      </Typography>
                    </Box>
                    {selectedVoice?._id === voice._id && (
                      <Slider
                        value={currentTime}
                        max={duration}
                        onChange={handleSeek}
                        sx={{
                          color: '#e50914',
                          '& .MuiSlider-thumb': {
                            width: 12,
                            height: 12,
                          },
                        }}
                      />
                    )}
                  </Box>
                )}

                {/* Actions */}
                {showActions && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {voice.status === 'COMPLETED' && (
                      <Tooltip title="Play Voice">
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<PlayArrow />}
                          onClick={() => {
                            setSelectedVoice(voice);
                            setPlayDialog(true);
                          }}
                          sx={{
                            backgroundColor: '#e50914',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#f40612',
                            },
                          }}
                        >
                          Play
                        </Button>
                      </Tooltip>
                    )}
                    
                    {voice.status === 'COMPLETED' && (
                      <Tooltip title="Download Voice">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Download />}
                          href={voice.audioUrl}
                          download
                          sx={{
                            borderColor: 'white',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                          }}
                        >
                          Download
                        </Button>
                      </Tooltip>
                    )}

                    <Tooltip title="Delete Voice">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Delete />}
                        onClick={() => {
                          setVoiceToDelete(voice);
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

                {/* Error Display */}
                {voice.error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {voice.error}
                  </Alert>
                )}

                {/* Timestamp */}
                <Typography variant="caption" sx={{ color: '#666', mt: 2, display: 'block' }}>
                  Created: {new Date(voice.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Play Voice Dialog */}
      <Dialog
        open={playDialog}
        onClose={() => setPlayDialog(false)}
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
          Voice Player
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedVoice && (
            <Box>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                {selectedVoice.script?.episode?.title}
              </Typography>
              
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <audio
                  controls
                  style={{ width: '100%' }}
                  src={selectedVoice.audioUrl}
                >
                  Your browser does not support the audio element.
                </audio>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Chip
                  label={selectedVoice.provider}
                  size="small"
                  sx={{
                    backgroundColor: getProviderColor(selectedVoice.provider),
                    color: 'white',
                  }}
                />
                <Chip
                  label={formatDuration(selectedVoice.durationSeconds)}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                  }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog}
        title="Delete Voice"
        message={`Are you sure you want to delete this voice? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
        onConfirm={() => voiceToDelete && handleDeleteVoice(voiceToDelete)}
        onCancel={() => {
          setDeleteDialog(false);
          setVoiceToDelete(null);
        }}
      />
    </Box>
  );
};

export default VoiceManager;
