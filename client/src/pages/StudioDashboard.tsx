import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  useTheme,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  VideoLibrary,
  Pending,
  CheckCircle,
  HourglassEmpty,
  TrendingUp,
  AutoAwesome,
  RecordVoiceOver,
  VideoSettings,
  YouTube,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import apiClient from '../services/apiClient';

interface VideoStats {
  total: number;
  draft: number;
  processing: number;
  review: number;
  approved: number;
  published: number;
  failed: number;
}

interface RecentActivity {
  _id: string;
  type: 'video' | 'script' | 'voice' | 'upload';
  title: string;
  status: string;
  createdAt: string;
}

interface SystemStats {
  totalVideos: number;
  totalScripts: number;
  totalVoices: number;
  totalUploads: number;
  processingCount: number;
  failedCount: number;
  avgProcessingTime: number;
  successRate: number;
}

const StudioDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<VideoStats>({
    total: 0,
    draft: 0,
    processing: 0,
    review: 0,
    approved: 0,
    published: 0,
    failed: 0,
  });
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalVideos: 0,
    totalScripts: 0,
    totalVoices: 0,
    totalUploads: 0,
    processingCount: 0,
    failedCount: 0,
    avgProcessingTime: 0,
    successRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    loadUser();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load video stats
      const [draftRes, processingRes, reviewRes, approvedRes, publishedRes, failedRes] = await Promise.all([
        apiClient.getVideos({ status: 'DRAFT_READY' }),
        apiClient.getVideos({ status: 'AI_PROCESSING' }),
        apiClient.getVideos({ status: 'IN_REVIEW' }),
        apiClient.getVideos({ status: 'FINAL_APPROVED' }),
        apiClient.getVideos({ status: 'PUBLISHED' }),
        apiClient.getVideos({ status: 'FAILED' }),
      ]);

      const newStats: VideoStats = {
        total: 0,
        draft: draftRes.success ? (draftRes.data?.videos || []).length : 0,
        processing: processingRes.success ? (processingRes.data?.videos || []).length : 0,
        review: reviewRes.success ? (reviewRes.data?.videos || []).length : 0,
        approved: approvedRes.success ? (approvedRes.data?.videos || []).length : 0,
        published: publishedRes.success ? (publishedRes.data?.videos || []).length : 0,
        failed: failedRes.success ? (failedRes.data?.videos || []).length : 0,
      };

      newStats.total = Object.values(newStats).reduce((sum, count) => sum + count, 0);
      setStats(newStats);

      // Load system stats
      const allVideosRes = await apiClient.getVideos();
      const uploadsRes = await apiClient.getYouTubeUploads();
      
      if (allVideosRes.success) {
        const allVideos = allVideosRes.data?.videos || [];
        const totalVideos = allVideos.length;
        const totalScripts = allVideos.filter((v: any) => v.scriptId).length;
        const totalVoices = allVideos.filter((v: any) => v.voiceId).length;
        const processingCount = allVideos.filter((v: any) => v.status === 'AI_PROCESSING').length;
        const failedCount = allVideos.filter((v: any) => v.status === 'FAILED').length;
        const successCount = allVideos.filter((v: any) => v.status === 'PUBLISHED').length;
        const successRate = totalVideos > 0 ? (successCount / totalVideos) * 100 : 0;

        setSystemStats({
          totalVideos,
          totalScripts,
          totalVoices,
          totalUploads: uploadsRes.success ? (uploadsRes.data || []).length : 0,
          processingCount,
          failedCount,
          avgProcessingTime: 0, // Would need backend implementation
          successRate,
        });
      }

      // Load recent activity (mock data for now)
      const activities: RecentActivity[] = [
        {
          _id: '1',
          type: 'video',
          title: 'Episode 1: Introduction',
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        },
        {
          _id: '2',
          type: 'script',
          title: 'Episode 2 Script',
          status: 'GENERATING',
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        {
          _id: '3',
          type: 'voice',
          title: 'Episode 1 Voice',
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          _id: '4',
          type: 'upload',
          title: 'YouTube Upload - Episode 1',
          status: 'PROCESSING',
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
      ];
      setRecentActivity(activities);

    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
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

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    onClick?: () => void;
  }> = ({ title, value, icon, color, onClick }) => (
    <Card
      sx={{
        backgroundColor: '#1a1a1a',
        color: 'white',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'scale(1.02)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: '50%',
              p: 1,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

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
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              mb: 2,
            }}
          >
            Studio Dashboard
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#ccc',
            }}
          >
            Manage your video content and production workflow
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 4 }}
            action={
              <button onClick={loadDashboardData} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                Retry
              </button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Enhanced Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Videos"
              value={systemStats.totalVideos}
              icon={<VideoLibrary />}
              color="#2196f3"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Scripts"
              value={systemStats.totalScripts}
              icon={<AutoAwesome />}
              color="#9c27b0"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Voices"
              value={systemStats.totalVoices}
              icon={<RecordVoiceOver />}
              color="#4caf50"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="YouTube Uploads"
              value={systemStats.totalUploads}
              icon={<YouTube />}
              color="#ff0000"
            />
          </Grid>
        </Grid>

        {/* Production Pipeline Stats */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Draft Ready"
              value={stats.draft}
              icon={<Pending />}
              color="#9c27b0"
              onClick={() => navigate('/studio/review')}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Processing"
              value={stats.processing}
              icon={<HourglassEmpty />}
              color="#ff9800"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="In Review"
              value={stats.review}
              icon={<TrendingUp />}
              color="#f4c430"
              onClick={() => navigate('/studio/review')}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Published"
              value={stats.published}
              icon={<CheckCircle />}
              color="#e50914"
              onClick={() => navigate('/shorts')}
            />
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              Quick Actions
            </Typography>
            <Button
              variant="outlined"
              startIcon={refreshing ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Refresh />}
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/studio/review')}
                sx={{
                  backgroundColor: '#e50914',
                  color: 'white',
                  py: 2,
                  '&:hover': {
                    backgroundColor: '#f40612',
                  },
                }}
              >
                Review Queue
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  py: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'white',
                  },
                }}
              >
                Browse Content
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/shorts')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  py: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'white',
                  },
                }}
              >
                View Shorts
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/admin/categories')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  py: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'white',
                  },
                }}
              >
                Admin Panel
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Enhanced Production Overview */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={8}>
            <Card sx={{ backgroundColor: '#1a1a1a', color: 'white' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Production Pipeline
                </Typography>
                
                {/* Pipeline Progress */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                      Overall Progress
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                      {systemStats.successRate.toFixed(1)}% Success Rate
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={systemStats.successRate}
                    sx={{ backgroundColor: '#333', '& .MuiLinearProgress-bar': { backgroundColor: '#e50914' } }}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#0a0a0a', borderRadius: 1 }}>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#b3b3b3' }}>Draft Ready</Typography>
                        <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 'bold' }}>{stats.draft}</Typography>
                      </Box>
                      <Pending sx={{ color: '#9c27b0' }} />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#0a0a0a', borderRadius: 1 }}>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#b3b3b3' }}>In Review</Typography>
                        <Typography variant="h6" sx={{ color: '#f4c430', fontWeight: 'bold' }}>{stats.review}</Typography>
                      </Box>
                      <TrendingUp sx={{ color: '#f4c430' }} />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#0a0a0a', borderRadius: 1 }}>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#b3b3b3' }}>Approved</Typography>
                        <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold' }}>{stats.approved}</Typography>
                      </Box>
                      <CheckCircle sx={{ color: '#4caf50' }} />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#0a0a0a', borderRadius: 1 }}>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#b3b3b3' }}>Published</Typography>
                        <Typography variant="h6" sx={{ color: '#e50914', fontWeight: 'bold' }}>{stats.published}</Typography>
                      </Box>
                      <VideoLibrary sx={{ color: '#e50914' }} />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ backgroundColor: '#1a1a1a', color: 'white' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  System Status
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#b3b3b3' }}>Processing</Typography>
                    <Chip
                      label={systemStats.processingCount}
                      size="small"
                      sx={{
                        backgroundColor: systemStats.processingCount > 0 ? '#ff9800' : '#4caf50',
                        color: 'white',
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#b3b3b3' }}>Failed</Typography>
                    <Chip
                      label={systemStats.failedCount}
                      size="small"
                      sx={{
                        backgroundColor: systemStats.failedCount > 0 ? '#f44336' : '#4caf50',
                        color: 'white',
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#b3b3b3' }}>Success Rate</Typography>
                    <Typography variant="body2" sx={{ color: systemStats.successRate >= 80 ? '#4caf50' : '#ff9800', fontWeight: 'bold' }}>
                      {systemStats.successRate.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Box>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              color: 'white',
              mb: 3,
              fontWeight: 'bold',
            }}
          >
            Recent Activity
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                <CardContent sx={{ p: 3 }}>
                  <List sx={{ p: 0 }}>
                    {recentActivity.map((activity, index) => (
                      <React.Fragment key={activity._id}>
                        <ListItem sx={{ px: 0, py: 1 }}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {activity.type === 'video' && <VideoSettings sx={{ fontSize: 20, color: '#e50914' }} />}
                                {activity.type === 'script' && <AutoAwesome sx={{ fontSize: 20, color: '#9c27b0' }} />}
                                {activity.type === 'voice' && <RecordVoiceOver sx={{ fontSize: 20, color: '#4caf50' }} />}
                                {activity.type === 'upload' && <YouTube sx={{ fontSize: 20, color: '#ff0000' }} />}
                                <Typography variant="body1" sx={{ color: 'white', fontWeight: 'medium' }}>
                                  {activity.title}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Chip
                                  label={activity.status}
                                  size="small"
                                  sx={{
                                    backgroundColor: activity.status === 'COMPLETED' ? '#4caf50' : 
                                                     activity.status === 'GENERATING' || activity.status === 'PROCESSING' ? '#ff9800' : '#757575',
                                    color: 'white',
                                    fontSize: '0.7rem',
                                  }}
                                />
                                <Typography variant="caption" sx={{ color: '#666' }}>
                                  {new Date(activity.createdAt).toLocaleString()}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < recentActivity.length - 1 && <Divider sx={{ borderColor: '#333' }} />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    AI Workflow Summary
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#0a0a0a', borderRadius: 1 }}>
                      <AutoAwesome sx={{ fontSize: 32, color: '#9c27b0', mb: 1 }} />
                      <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 'bold' }}>
                        {systemStats.totalScripts}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                        Scripts Generated
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#0a0a0a', borderRadius: 1 }}>
                      <RecordVoiceOver sx={{ fontSize: 32, color: '#4caf50', mb: 1 }} />
                      <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                        {systemStats.totalVoices}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                        Voices Created
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#0a0a0a', borderRadius: 1 }}>
                      <VideoSettings sx={{ fontSize: 32, color: '#e50914', mb: 1 }} />
                      <Typography variant="h6" sx={{ color: '#e50914', fontWeight: 'bold' }}>
                        {systemStats.totalVideos}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                        Videos Produced
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default StudioDashboard;
