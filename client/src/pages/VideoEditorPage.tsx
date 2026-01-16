import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Button,
  TextField,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Save,
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Add,
  Delete,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ConfirmDialog from '../components/ConfirmDialog';
import apiClient from '../services/apiClient';

interface Scene {
  sceneId: string;
  start: number;
  end: number;
  image: string;
  text: string;
  caption: string;
  style: {
    fontSize: number;
    x: number;
    y: number;
  };
}

interface VideoProject {
  _id: string;
  videoId: string;
  title: string;
  orientation: 'vertical' | 'horizontal';
  status: string;
  projectJson: {
    title: string;
    scenes: Scene[];
    audio: {
      voice: string;
      bgm: string;
      bgmVolume: number;
    };
  };
  createdBy: {
    name: string;
    email: string;
  };
  updatedBy: {
    name: string;
    email: string;
  };
}

interface Video {
  _id: string;
  episodeId: {
    _id: string;
    title: string;
    episodeNumber: number;
    type: string;
  };
  scriptId: {
    content: string;
    style: string;
    duration: string;
  };
  voiceId: {
    audioUrl: string;
    durationSeconds: number;
    provider: string;
  };
  type: string;
  orientation: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  status: string;
}

const VideoEditorPage: React.FC = () => {
  const theme = useTheme();
  const { videoId } = useParams<{ videoId: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<VideoProject | null>(null);
  const [video, setVideo] = useState<Video | null>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedScene, setSelectedScene] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rerenderDialog, setRerenderDialog] = useState(false);
  const [rerendering, setRerendering] = useState(false);

  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoId) {
      loadData();
    }
    loadUser();
  }, [videoId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [projectRes, videoRes] = await Promise.all([
        apiClient.getProject(videoId!),
        apiClient.getVideo(videoId!),
      ]);

      if (projectRes.success) {
        setProject(projectRes.data);
      }

      if (videoRes.success) {
        setVideo(videoRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load editor data');
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

  const handleSave = async () => {
    if (!project) return;

    setSaving(true);
    try {
      await apiClient.updateProject(videoId!, {
        title: project.projectJson.title,
        projectJson: project.projectJson,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleRerender = async () => {
    setRerendering(true);
    try {
      await apiClient.rerenderProject(videoId!);
      setRerenderDialog(false);
      loadData(); // Reload data
    } catch (err: any) {
      setError(err.message || 'Failed to rerender video');
    } finally {
      setRerendering(false);
    }
  };

  const updateScene = (index: number, updates: Partial<Scene>) => {
    if (!project) return;

    const updatedScenes = [...project.projectJson.scenes];
    updatedScenes[index] = { ...updatedScenes[index], ...updates };
    
    setProject({
      ...project,
      projectJson: {
        ...project.projectJson,
        scenes: updatedScenes,
      },
    });
  };

  const addScene = () => {
    if (!project) return;

    const newScene: Scene = {
      sceneId: `scene-${Date.now()}`,
      start: project.projectJson.scenes.length * 5,
      end: (project.projectJson.scenes.length + 1) * 5,
      image: '/uploads/images/default-scene.jpg',
      text: 'New Scene',
      caption: 'Scene Caption',
      style: {
        fontSize: 24,
        x: 50,
        y: 100,
      },
    };

    setProject({
      ...project,
      projectJson: {
        ...project.projectJson,
        scenes: [...project.projectJson.scenes, newScene],
      },
    });
  };

  const deleteScene = (index: number) => {
    if (!project || project.projectJson.scenes.length <= 1) return;

    const updatedScenes = project.projectJson.scenes.filter((_, i) => i !== index);
    
    setProject({
      ...project,
      projectJson: {
        ...project.projectJson,
        scenes: updatedScenes,
      },
    });

    if (selectedScene >= updatedScenes.length) {
      setSelectedScene(updatedScenes.length - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  if (!project || !video) {
    return (
      <Box sx={{ backgroundColor: '#141414', minHeight: '100vh' }}>
        <Navbar onLogout={handleLogout} />
        <Container maxWidth="xl" sx={{ pt: 4 }}>
          <Alert severity="error">
            Project or video not found
          </Alert>
        </Container>
      </Box>
    );
  }

  const currentScene = project.projectJson.scenes[selectedScene];

  return (
    <Box sx={{ backgroundColor: '#141414', minHeight: '100vh' }}>
      <Navbar onLogout={handleLogout} />
      
      <Container maxWidth="xl" sx={{ pt: 4, pb: 8 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                mb: 1,
              }}
            >
              Video Editor
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#ccc',
              }}
            >
              {video.episodeId.title} - {project.projectJson.title}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleSave}
              disabled={saving}
              startIcon={<Save />}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
            
            <Button
              variant="contained"
              onClick={() => setRerenderDialog(true)}
              sx={{
                backgroundColor: '#e50914',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#f40612',
                },
              }}
            >
              Re-render Video
            </Button>
          </Box>
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

        {/* Main Editor Layout */}
        <Grid container spacing={3}>
          {/* Left Panel - Scene List */}
          <Grid item xs={12} md={3}>
            <Box sx={{ backgroundColor: '#1a1a1a', p: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'white' }}>
                  Scenes
                </Typography>
                <IconButton onClick={addScene} sx={{ color: 'white' }}>
                  <Add />
                </IconButton>
              </Box>
              
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {project.projectJson.scenes.map((scene, index) => (
                  <Box
                    key={scene.sceneId}
                    onClick={() => setSelectedScene(index)}
                    sx={{
                      p: 2,
                      mb: 1,
                      backgroundColor: selectedScene === index ? '#e50914' : '#2a2a2a',
                      borderRadius: 1,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {scene.text}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#ccc' }}>
                        {formatTime(scene.start)} - {formatTime(scene.end)}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteScene(index);
                      }}
                      sx={{ color: 'white' }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Center Panel - Video Preview */}
          <Grid item xs={12} md={6}>
            <Box sx={{ backgroundColor: '#1a1a1a', p: 2, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Preview
              </Typography>
              
              <Box sx={{ position: 'relative', backgroundColor: '#000', borderRadius: 1, overflow: 'hidden' }}>
                {video.videoUrl ? (
                  <video
                    ref={videoRef}
                    src={video.videoUrl}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '400px',
                    }}
                    onTimeUpdate={() => {
                      if (videoRef.current) {
                        setCurrentTime(videoRef.current.currentTime);
                      }
                    }}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        setDuration(videoRef.current.duration);
                      }
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: '300px',
                      backgroundImage: `url(${currentScene.image || '/placeholder-video.jpg'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography sx={{ color: 'white', fontSize: 24 }}>
                      No video available
                    </Typography>
                  </Box>
                )}

                {/* Video Controls */}
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <IconButton onClick={() => {
                      if (videoRef.current) {
                        if (isPlaying) {
                          videoRef.current.pause();
                        } else {
                          videoRef.current.play();
                        }
                        setIsPlaying(!isPlaying);
                      }
                    }} sx={{ color: 'white' }}>
                      {isPlaying ? <Pause /> : <PlayArrow />}
                    </IconButton>
                    
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </Typography>
                    
                    <IconButton onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.muted = !isMuted;
                        setIsMuted(!isMuted);
                      }
                    }} sx={{ color: 'white' }}>
                      {isMuted ? <VolumeOff /> : <VolumeUp />}
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right Panel - Properties */}
          <Grid item xs={12} md={3}>
            <Box sx={{ backgroundColor: '#1a1a1a', p: 2, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Scene Properties
              </Typography>
              
              <TextField
                fullWidth
                label="Scene Text"
                value={currentScene.text}
                onChange={(e) => updateScene(selectedScene, { text: e.target.value })}
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
              
              <TextField
                fullWidth
                label="Caption"
                value={currentScene.caption}
                onChange={(e) => updateScene(selectedScene, { caption: e.target.value })}
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
              
              <TextField
                fullWidth
                label="Image URL"
                value={currentScene.image}
                onChange={(e) => updateScene(selectedScene, { image: e.target.value })}
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
              
              <TextField
                fullWidth
                label="Font Size"
                type="number"
                value={currentScene.style.fontSize}
                onChange={(e) => updateScene(selectedScene, {
                  style: { ...currentScene.style, fontSize: parseInt(e.target.value) }
                })}
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
              
              <TextField
                fullWidth
                label="X Position"
                type="number"
                value={currentScene.style.x}
                onChange={(e) => updateScene(selectedScene, {
                  style: { ...currentScene.style, x: parseInt(e.target.value) }
                })}
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
              
              <TextField
                fullWidth
                label="Y Position"
                type="number"
                value={currentScene.style.y}
                onChange={(e) => updateScene(selectedScene, {
                  style: { ...currentScene.style, y: parseInt(e.target.value) }
                })}
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
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Rerender Dialog */}
      <ConfirmDialog
        open={rerenderDialog}
        title="Re-render Video"
        message="This will re-render the video with the current project settings. The process may take several minutes. Continue?"
        confirmText="Re-render"
        cancelText="Cancel"
        severity="info"
        loading={rerendering}
        onConfirm={handleRerender}
        onCancel={() => setRerenderDialog(false)}
      />
    </Box>
  );
};

export default VideoEditorPage;
