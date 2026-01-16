import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  useTheme,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Refresh,
  Schedule,
  AccessTime,
  CheckCircle,
  Error,
  Warning,
  Settings,
  Add,
  Edit,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import apiClient from '../services/apiClient';

interface JobStatus {
  name: string;
  status: 'running' | 'stopped' | 'idle' | 'error';
  lastRun?: string;
  nextRun?: string;
  interval: string;
  cronExpression: string;
  isActive: boolean;
  description: string;
}

interface ScheduleConfig {
  jobName: string;
  interval: 'minutes' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';
  customInterval?: number;
  hour?: number;
  minute?: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
  isActive: boolean;
  description: string;
}

const AdminCronPage: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobStatuses, setJobStatuses] = useState<JobStatus[]>([]);
  const [schedules, setSchedules] = useState<ScheduleConfig[]>([]);
  const [scheduleDialog, setScheduleDialog] = useState<{
    open: boolean;
    job?: JobStatus;
    mode: 'create' | 'edit';
  }>({
    open: false,
    mode: 'create',
  });
  const [formData, setFormData] = useState<ScheduleConfig>({
    jobName: '',
    interval: 'daily',
    customInterval: 5,
    hour: 1,
    minute: 0,
    dayOfWeek: 0,
    dayOfMonth: 1,
    isActive: true,
    description: '',
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: string;
    job?: JobStatus;
  }>({
    open: false,
    action: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statusRes, schedulesRes] = await Promise.all([
        apiClient.getCronJobStatus(),
        apiClient.getAllCronSchedules(),
      ]);

      if (statusRes.success) {
        setJobStatuses(statusRes.data || []);
      }

      if (schedulesRes.success) {
        setSchedules(schedulesRes.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load cron data');
    } finally {
      setLoading(false);
    }
  };

  const handleRunJob = async (job: string) => {
    try {
      await apiClient.runCronJob(job);
      loadData(); // Refresh status
    } catch (err: any) {
      setError(err.message || 'Failed to run job');
    }
  };

  const handleStartAllJobs = async () => {
    try {
      await apiClient.startAllCronJobs();
      loadData(); // Refresh status
    } catch (err: any) {
      setError(err.message || 'Failed to start all jobs');
    }
  };

  const handleStopAllJobs = async () => {
    try {
      await apiClient.stopAllCronJobs();
      loadData(); // Refresh status
    } catch (err: any) {
      setError(err.message || 'Failed to stop all jobs');
    }
  };

  const handleToggleSchedule = async (jobName: string, isActive: boolean) => {
    try {
      await apiClient.toggleCronSchedule(jobName, isActive);
      loadData(); // Refresh data
    } catch (err: any) {
      setError(err.message || 'Failed to toggle schedule');
    }
  };

  const handleOpenScheduleDialog = (job?: JobStatus, mode: 'create' | 'edit' = 'edit') => {
    if (job && mode === 'edit') {
      const schedule = schedules.find(s => s.jobName === job.name);
      if (schedule) {
        setFormData({
          jobName: schedule.jobName,
          interval: schedule.interval,
          customInterval: schedule.customInterval || 5,
          hour: schedule.hour || 1,
          minute: schedule.minute || 0,
          dayOfWeek: schedule.dayOfWeek || 0,
          dayOfMonth: schedule.dayOfMonth || 1,
          isActive: schedule.isActive,
          description: schedule.description,
        });
      }
    } else {
      setFormData({
        jobName: job?.name || '',
        interval: 'daily',
        customInterval: 5,
        hour: 1,
        minute: 0,
        dayOfWeek: 0,
        dayOfMonth: 1,
        isActive: true,
        description: '',
      });
    }
    setScheduleDialog({ open: true, job, mode });
  };

  const handleSaveSchedule = async () => {
    try {
      if (!formData.jobName || !formData.description) {
        setError('Job name and description are required');
        return;
      }

      await apiClient.updateCronSchedule(formData.jobName, formData);
      setScheduleDialog({ open: false, mode: 'create' });
      setFormData({
        jobName: '',
        interval: 'daily',
        customInterval: 5,
        hour: 1,
        minute: 0,
        dayOfWeek: 0,
        dayOfMonth: 1,
        isActive: true,
        description: '',
      });
      loadData(); // Refresh data
    } catch (err: any) {
      setError(err.message || 'Failed to save schedule');
    }
  };

  const handleInitializeDefaults = async () => {
    try {
      await apiClient.initializeDefaultCronSchedules();
      loadData(); // Refresh data
    } catch (err: any) {
      setError(err.message || 'Failed to initialize default schedules');
    }
  };

  const getIntervalDisplay = (interval: string, customInterval?: number, hour?: number, minute?: number, dayOfWeek?: number, dayOfMonth?: number) => {
    const timeStr = hour !== undefined && minute !== undefined ? ` at ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}` : '';
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    switch (interval) {
      case 'minutes':
        return `Every ${customInterval || 5} minutes`;
      case 'hourly':
        return `Every ${customInterval || 1} hour${customInterval && customInterval > 1 ? 's' : ''}`;
      case 'daily':
        return `Daily${timeStr}`;
      case 'weekly':
        return `Weekly on ${dayNames[dayOfWeek || 0]}${timeStr}`;
      case 'monthly':
        return `Monthly on the ${dayOfMonth || 1}${timeStr}`;
      default:
        return `Custom${timeStr}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return '#4caf50';
      case 'stopped':
        return '#f44336';
      case 'idle':
        return '#ff9800';
      case 'error':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle sx={{ color: '#4caf50' }} />;
      case 'stopped':
        return <Stop sx={{ color: '#f44336' }} />;
      case 'idle':
        return <AccessTime sx={{ color: '#ff9800' }} />;
      case 'error':
        return <Error sx={{ color: '#f44336' }} />;
      default:
        return <Warning sx={{ color: '#757575' }} />;
    }
  };

  const handleConfirmAction = () => {
    setConfirmDialog({ open: false, action: '' });

    switch (confirmDialog.action) {
      case 'run':
        if (confirmDialog.job && typeof confirmDialog.job === 'object') {
          handleRunJob(confirmDialog.job.name);
        }
        break;
      case 'startAll':
        handleStartAllJobs();
        break;
      case 'stopAll':
        handleStopAllJobs();
        break;
    }
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
              Cron Job Management
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#ccc',
              }}
            >
              Manage scheduled tasks and configure job intervals
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={() => setConfirmDialog({ open: true, action: 'startAll' })}
              sx={{
                backgroundColor: '#4caf50',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#45a049',
                },
              }}
            >
              Start All Jobs
            </Button>
            <Button
              variant="contained"
              startIcon={<Stop />}
              onClick={() => setConfirmDialog({ open: true, action: 'stopAll' })}
              sx={{
                backgroundColor: '#f44336',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#d32f2f',
                },
              }}
            >
              Stop All Jobs
            </Button>
            <Button
              variant="contained"
              startIcon={<Settings />}
              onClick={handleInitializeDefaults}
              sx={{
                backgroundColor: '#00bcd4',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#00acc1',
                },
              }}
            >
              Initialize Defaults
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadData}
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

        {/* Schedule Configuration */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              mb: 2,
            }}
          >
            Schedule Configuration
          </Typography>

          <Grid container spacing={3}>
            {jobStatuses.map((job) => {
              const schedule = schedules.find(s => s.jobName === job.name);
              return (
                <Grid item xs={12} md={6} key={job.name}>
                  <Card
                    sx={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Schedule sx={{ color: '#e50914', fontSize: 28 }} />
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{
                                color: 'white',
                                fontWeight: 'bold',
                                mb: 0.5,
                              }}
                            >
                              {job.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#ccc',
                                mb: 1,
                              }}
                            >
                              {job.description}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#888',
                                mb: 1,
                              }}
                            >
                              <strong>Interval:</strong> {getIntervalDisplay(job.interval, schedule?.customInterval, schedule?.hour, schedule?.minute, schedule?.dayOfWeek, schedule?.dayOfMonth)}
                            </Typography>
                            {job.lastRun && (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#888',
                                  mb: 1,
                                }}
                              >
                                <strong>Last Run:</strong> {new Date(job.lastRun).toLocaleString()}
                              </Typography>
                            )}
                            {job.nextRun && (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#888',
                                }}
                              >
                                <strong>Next Run:</strong> {new Date(job.nextRun).toLocaleString()}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(job.status)}
                          <Chip
                            label={job.status}
                            size="small"
                            sx={{
                              backgroundColor: getStatusColor(job.status),
                              color: 'white',
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                            }}
                          />
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={job.isActive}
                              onChange={(e) => handleToggleSchedule(job.name, e.target.checked)}
                              sx={{ color: '#ccc' }}
                            />
                          }
                          label="Active"
                          sx={{ color: '#ccc' }}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenScheduleDialog(job, 'edit')}
                            sx={{
                              color: 'white',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              },
                            }}
                          >
                            <Edit />
                          </IconButton>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<PlayArrow />}
                            onClick={() => setConfirmDialog({ open: true, action: 'run', job: job })}
                            sx={{
                              borderColor: 'white',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              },
                            }}
                          >
                            Run Now
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* System Status */}
        <Box sx={{ mt: 4 }}>
          <Card
            sx={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h5"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  mb: 3,
                }}
              >
                System Status
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Total Jobs"
                    secondary={`${jobStatuses.length} configured jobs`}
                    primaryTypographyProps={{ color: 'white' }}
                    secondaryTypographyProps={{ color: '#ccc' }}
                  />
                </ListItem>
                <Divider sx={{ backgroundColor: '#333', my: 1 }} />
                <ListItem>
                  <ListItemText
                    primary="Active Jobs"
                    secondary={`${jobStatuses.filter(job => job.isActive).length} jobs currently active`}
                    primaryTypographyProps={{ color: 'white' }}
                    secondaryTypographyProps={{ color: '#ccc' }}
                  />
                </ListItem>
                <Divider sx={{ backgroundColor: '#333', my: 1 }} />
                <ListItem>
                  <ListItemText
                    primary="Running Jobs"
                    secondary={`${jobStatuses.filter(job => job.status === 'running').length} jobs currently running`}
                    primaryTypographyProps={{ color: 'white' }}
                    secondaryTypographyProps={{ color: '#ccc' }}
                  />
                </ListItem>
                <Divider sx={{ backgroundColor: '#333', my: 1 }} />
                <ListItem>
                  <ListItemText
                    primary="Failed Jobs"
                    secondary={`${jobStatuses.filter(job => job.status === 'error').length} jobs with errors`}
                    primaryTypographyProps={{ color: 'white' }}
                    secondaryTypographyProps={{ color: '#ccc' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* Schedule Configuration Dialog */}
      <Dialog
        open={scheduleDialog.open}
        onClose={() => setScheduleDialog({ open: false, mode: 'create' })}
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
          {scheduleDialog.mode === 'create' ? 'Configure New Job' : `Configure Job: ${scheduleDialog.job?.name}`}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Name"
                value={formData.jobName}
                onChange={(e) => setFormData({ ...formData, jobName: e.target.value })}
                disabled={scheduleDialog.mode === 'edit'}
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
                label="Description"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                <InputLabel sx={{ color: '#ccc' }}>Interval</InputLabel>
                <Select
                  value={formData.interval}
                  onChange={(e) => setFormData({ ...formData, interval: e.target.value as any })}
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
                  <MenuItem value="minutes">Every X Minutes</MenuItem>
                  <MenuItem value="hourly">Every X Hours</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {(formData.interval === 'minutes' || formData.interval === 'hourly') && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={formData.interval === 'minutes' ? 'Minutes' : 'Hours'}
                  type="number"
                  value={formData.customInterval || ''}
                  onChange={(e) => setFormData({ ...formData, customInterval: parseInt(e.target.value) || 5 })}
                  inputProps={{
                    min: formData.interval === 'minutes' ? 1 : 1,
                    max: formData.interval === 'minutes' ? 59 : 23,
                  }}
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
            )}
            {(formData.interval === 'daily' || formData.interval === 'weekly' || formData.interval === 'monthly') && (
              <>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Hour (0-23)"
                    type="number"
                    value={formData.hour || ''}
                    onChange={(e) => setFormData({ ...formData, hour: parseInt(e.target.value) || 0 })}
                    inputProps={{ min: 0, max: 23 }}
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
                    label="Minute (0-59)"
                    type="number"
                    value={formData.minute || ''}
                    onChange={(e) => setFormData({ ...formData, minute: parseInt(e.target.value) || 0 })}
                    inputProps={{ min: 0, max: 59 }}
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
                {formData.interval === 'weekly' && (
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel sx={{ color: '#ccc' }}>Day of Week</InputLabel>
                      <Select
                        value={formData.dayOfWeek || 0}
                        onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value as number })}
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
                        <MenuItem value={0}>Sunday</MenuItem>
                        <MenuItem value={1}>Monday</MenuItem>
                        <MenuItem value={2}>Tuesday</MenuItem>
                        <MenuItem value={3}>Wednesday</MenuItem>
                        <MenuItem value={4}>Thursday</MenuItem>
                        <MenuItem value={5}>Friday</MenuItem>
                        <MenuItem value={6}>Saturday</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                {formData.interval === 'monthly' && (
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Day of Month (1-31)"
                      type="number"
                      value={formData.dayOfMonth || ''}
                      onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) || 1 })}
                      inputProps={{ min: 1, max: 31 }}
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
                )}
              </>
            )}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    sx={{ color: '#ccc' }}
                  />
                }
                label="Active"
                sx={{ color: '#ccc' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setScheduleDialog({ open: false, mode: 'create' })} sx={{ color: '#ccc' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveSchedule}
            variant="contained"
            sx={{
              backgroundColor: '#e50914',
              color: 'white',
              '&:hover': {
                backgroundColor: '#f40612',
              },
            }}
          >
            Save Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: '' })}
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            color: 'white',
          },
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>
          Confirm Action
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography sx={{ color: '#ccc' }}>
            {confirmDialog.action === 'run' && `Are you sure you want to run the job "${typeof confirmDialog.job === 'object' ? confirmDialog.job.name : confirmDialog.job}"?`}
            {confirmDialog.action === 'startAll' && 'Are you sure you want to start all cron jobs?'}
            {confirmDialog.action === 'stopAll' && 'Are you sure you want to stop all cron jobs?'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setConfirmDialog({ open: false, action: '' })} sx={{ color: '#ccc' }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            sx={{
              backgroundColor: '#e50914',
              color: 'white',
              '&:hover': {
                backgroundColor: '#f40612',
              },
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCronPage;
