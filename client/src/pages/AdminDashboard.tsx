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
} from '@mui/material';
import {
  People,
  VideoLibrary,
  Category,
  PlaylistPlay,
  TrendingUp,
  Dashboard as DashboardIcon,
  Schedule,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import apiClient from '../services/apiClient';

interface DashboardStats {
  totalUsers: number;
  totalContent: number;
  totalCategories: number;
  totalPlaylists: number;
  trendingContent: number;
  recentActivity: any[];
}

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalContent: 0,
    totalCategories: 0,
    totalPlaylists: 0,
    trendingContent: 0,
    recentActivity: [],
  });

  useEffect(() => {
    loadDashboardData();
    loadUser();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load data in parallel
      const [usersRes, contentRes, categoriesRes, playlistsRes, trendingRes] = await Promise.all([
        apiClient.getUsers().catch(() => ({ data: [] })),
        apiClient.getContent().catch(() => ({ data: [] })),
        apiClient.getCategories().catch(() => ({ data: [] })),
        apiClient.getPlaylists().catch(() => ({ data: [] })),
        apiClient.getTrendingContent(10).catch(() => ({ data: [] })),
      ]);

      setStats({
        totalUsers: usersRes.data?.length || 0,
        totalContent: contentRes.data?.length || 0,
        totalCategories: categoriesRes.data?.length || 0,
        totalPlaylists: playlistsRes.data?.length || 0,
        trendingContent: trendingRes.data?.length || 0,
        recentActivity: [],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadUser = async () => {
    try {
      // User is now handled by AuthContext
    } catch (err) {
      // User not logged in
    }
  };


  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <People />,
      color: '#2196f3',
      path: '/admin/users',
    },
    {
      title: 'Total Content',
      value: stats.totalContent,
      icon: <VideoLibrary />,
      color: '#4caf50',
      path: '/admin/content',
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      icon: <Category />,
      color: '#ff9800',
      path: '/admin/categories',
    },
    {
      title: 'Playlists',
      value: stats.totalPlaylists,
      icon: <PlaylistPlay />,
      color: '#9c27b0',
      path: '/admin/collections',
    },
    {
      title: 'Trending',
      value: stats.trendingContent,
      icon: <TrendingUp />,
      color: '#f44336',
      path: '/admin/content',
    },
    {
      title: 'Cron Jobs',
      value: 'Manage',
      icon: <Schedule />,
      color: '#00bcd4',
      path: '/admin/cron',
    },
  ];

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
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <DashboardIcon />
            Admin Dashboard
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#ccc',
            }}
          >
            Overview of your anime streaming platform
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

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
              <Card
                sx={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#2a2a2a',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(229, 9, 20, 0.3)',
                  },
                }}
                onClick={() => {
                  if (card.path) {
                    window.location.href = card.path;
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ color: card.color, fontSize: 32 }}>
                      {card.icon}
                    </Box>
                  </Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                    {card.value.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#ccc' }}>
                    {card.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ backgroundColor: '#1a1a1a', borderRadius: 2, p: 3, mb: 4 }}>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 3 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                href="/admin/categories"
                sx={{
                  backgroundColor: '#e50914',
                  color: 'white',
                  py: 2,
                  '&:hover': {
                    backgroundColor: '#f40612',
                  },
                }}
              >
                Manage Categories
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                href="/admin/collections"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  py: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Manage Collections
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                href="/admin/users"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  py: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Manage Users
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                href="/admin/content"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  py: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Manage Content
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                href="/admin/cron"
                sx={{
                  borderColor: '#00bcd4',
                  color: '#00bcd4',
                  py: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 188, 212, 0.1)',
                  },
                }}
              >
                Cron Jobs
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Recent Activity Placeholder */}
        <Box sx={{ backgroundColor: '#1a1a1a', borderRadius: 2, p: 3 }}>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 3 }}>
            Recent Activity
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: '#888' }}>
              No recent activity to display
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
