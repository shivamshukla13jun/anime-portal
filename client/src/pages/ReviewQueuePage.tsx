import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
} from '@mui/material';
import {
  Visibility,
  CheckCircle,
  Cancel,
  Edit,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import ConfirmDialog from '../components/ConfirmDialog';
import apiClient from '../services/apiClient';

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
  project?: {
    title: string;
    status: string;
    createdBy: {
      name: string;
      email: string;
    };
  };
}

const ReviewQueuePage: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [user, setUser] = useState<any>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  useEffect(() => {
    loadVideos();
    loadUser();
  }, [pagination.page]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getReviewQueue({
        status: 'DRAFT_READY',
        page: pagination.page,
        limit: pagination.limit,
      });

      if (response.success) {
        setVideos(response.data?.videos || []);
        setPagination(prev => ({
          ...prev,
          total: response.data?.total || 0,
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load review queue');
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

  const handleStartReview = async (video: Video) => {
    try {
      await apiClient.startReview(video._id);
      loadVideos();
    } catch (err: any) {
      setError(err.message || 'Failed to start review');
    }
  };

  const handleApprove = async () => {
    if (!selectedVideo) return;

    setProcessing(true);
    try {
      await apiClient.approveVideo(selectedVideo._id, {
        note: 'Approved for publication',
        publishNow: true,
      });
      setApproveDialog(false);
      setSelectedVideo(null);
      loadVideos();
    } catch (err: any) {
      setError(err.message || 'Failed to approve video');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVideo || !rejectionNote.trim()) return;

    setProcessing(true);
    try {
      await apiClient.rejectVideo(selectedVideo._id, rejectionNote);
      setRejectDialog(false);
      setSelectedVideo(null);
      setRejectionNote('');
      loadVideos();
    } catch (err: any) {
      setError(err.message || 'Failed to reject video');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT_READY': return '#9c27b0';
      case 'IN_REVIEW': return '#f4c430';
      case 'FINAL_APPROVED': return '#4caf50';
      case 'PUBLISHED': return '#e50914';
      case 'AI_PROCESSING': return '#ff9800';
      case 'FAILED': return '#f44336';
      default: return '#757575';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  return (
    <Box sx={{ backgroundColor: '#141414', minHeight: '100vh' }}>
      <Navbar onLogout={handleLogout} />
      
      <Container maxWidth="xl" sx={{ pt: 4, pb: 8 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              mb: 2,
            }}
          >
            Review Queue
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#ccc',
            }}
          >
            Review and approve AI-generated videos before publication
          </Typography>
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

        {/* Table */}
        <Box sx={{ mb: 2 }}>
          <TableContainer
            component={Paper}
            sx={{
              backgroundColor: '#1a1a1a',
              color: 'white',
              border: '1px solid #333',
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#2a2a2a' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Episode</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Orientation</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Duration</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Project</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {videos.map((video) => (
                  <TableRow
                    key={video._id}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      },
                      borderBottom: '1px solid #333',
                    }}
                  >
                    <TableCell sx={{ color: 'white' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          Episode {video.episodeId.episodeNumber}: {video.episodeId.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#ccc' }}>
                          {video.episodeId.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'white', textTransform: 'uppercase' }}>
                      {video.type}
                    </TableCell>
                    <TableCell sx={{ color: 'white', textTransform: 'capitalize' }}>
                      {video.orientation}
                    </TableCell>
                    <TableCell sx={{ color: 'white' }}>
                      {formatDuration(video.voiceId.durationSeconds)}
                    </TableCell>
                    <TableCell sx={{ color: 'white' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {video.project?.title || 'Untitled'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#ccc' }}>
                          by {video.project?.createdBy?.name || 'Unknown'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'white' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: getStatusColor(video.status),
                          fontWeight: 'bold',
                        }}
                      >
                        {video.status.replace(/_/g, ' ')}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: 'white' }}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => window.open(`/studio/editor/${video._id}`, '_blank')}
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
                        
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CheckCircle />}
                          onClick={() => {
                            setSelectedVideo(video);
                            setApproveDialog(true);
                          }}
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
                        
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<Cancel />}
                          onClick={() => {
                            setSelectedVideo(video);
                            setRejectDialog(true);
                          }}
                          sx={{
                            backgroundColor: '#f44336',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#da190b',
                            },
                          }}
                        >
                          Reject
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#ccc' }}>
              Total: {pagination.total} videos
            </Typography>
            <Typography variant="body2" sx={{ color: '#ccc' }}>
              Page: {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
            </Typography>
          </Box>
          
          {pagination.total > pagination.limit && (
            <Pagination
              count={Math.ceil(pagination.total / pagination.limit)}
              page={pagination.page}
              onChange={(event, page) => {
                setPagination(prev => ({ ...prev, page }));
              }}
              sx={{
                '& .MuiPaginationItem-root': {
                  color: 'white',
                },
                '& .MuiPaginationItem-page.Mui-selected': {
                  backgroundColor: '#e50914',
                },
              }}
            />
          )}
        </Box>
      </Container>

      {/* Approve Dialog */}
      <ConfirmDialog
        open={approveDialog}
        title="Approve Video"
        message={`Are you sure you want to approve "${selectedVideo?.episodeId.title}"? This will publish the video immediately.`}
        confirmText="Approve"
        cancelText="Cancel"
        severity="success"
        loading={processing}
        onConfirm={handleApprove}
        onCancel={() => {
          setApproveDialog(false);
          setSelectedVideo(null);
        }}
      />

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialog}
        onClose={() => {
          setRejectDialog(false);
          setSelectedVideo(null);
          setRejectionNote('');
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
          Reject Video
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography sx={{ mb: 2, color: '#ccc' }}>
            Please provide a reason for rejecting "{selectedVideo?.episodeId.title}":
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={rejectionNote}
            onChange={(e) => setRejectionNote(e.target.value)}
            placeholder="Enter rejection reason..."
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: '#333',
                },
                '&:hover fieldset': {
                  borderColor: '#555',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#e50914',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#ccc',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setRejectDialog(false);
              setSelectedVideo(null);
              setRejectionNote('');
            }}
            sx={{ color: '#ccc' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            disabled={!rejectionNote.trim() || processing}
            variant="contained"
            sx={{
              backgroundColor: '#f44336',
              color: 'white',
              '&:hover': {
                backgroundColor: '#da190b',
              },
            }}
          >
            {processing ? 'Rejecting...' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewQueuePage;
