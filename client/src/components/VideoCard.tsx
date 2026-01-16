import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
} from '@mui/icons-material';

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

interface VideoCardProps {
  video: Video;
  onClick?: () => void;
  onPlay?: () => void;
  showControls?: boolean;
  compact?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onClick,
  onPlay,
  showControls = true,
  compact = false,
}) => {
  const theme = useTheme();
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return '#4caf50';
      case 'FINAL_APPROVED':
        return '#2196f3';
      case 'IN_REVIEW':
        return '#ff9800';
      case 'DRAFT_READY':
        return '#9c27b0';
      case 'AI_PROCESSING':
        return '#f4c430';
      case 'FAILED':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
    
    if (onPlay) {
      onPlay();
    }
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card
      sx={{
        height: '100%',
        backgroundColor: '#141414',
        color: 'white',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
        },
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={onClick}
    >
      {/* Video Thumbnail/Player */}
      <Box sx={{ position: 'relative', paddingTop: compact ? '177.78%' : '56.25%' }}>
        {video.videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={video.videoUrl}
              poster={video.thumbnailUrl}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onEnded={() => setIsPlaying(false)}
            />
            
            {showControls && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <IconButton
                  size="small"
                  onClick={handlePlayPause}
                  sx={{ color: 'white' }}
                >
                  {isPlaying ? <Pause /> : <PlayArrow />}
                </IconButton>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: 'white' }}>
                    {formatDuration(video.voiceId.durationSeconds)}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={handleMuteToggle}
                    sx={{ color: 'white' }}
                  >
                    {isMuted ? <VolumeOff /> : <VolumeUp />}
                  </IconButton>
                </Box>
              </Box>
            )}
          </>
        ) : (
          <CardMedia
            image={video.thumbnailUrl || '/placeholder-video.jpg'}
            title={video.episodeId.title}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}

        {/* Status Badge */}
        <Chip
          label={getStatusLabel(video.status)}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: getStatusColor(video.status),
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.7rem',
          }}
        />

        {/* Type Badge */}
        <Chip
          label={video.type.toUpperCase()}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.7rem',
          }}
        />

        {/* Duration Badge */}
        <Chip
          label={formatDuration(video.voiceId.durationSeconds)}
          size="small"
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.7rem',
          }}
        />
      </Box>

      {/* Content */}
      <CardContent sx={{ p: compact ? 1 : 2, flexGrow: 1 }}>
        <Typography
          variant={compact ? 'body2' : 'h6'}
          component="h3"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: compact ? 1 : 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: compact ? 1.2 : 1.4,
          }}
        >
          Episode {video.episodeId.episodeNumber}: {video.episodeId.title}
        </Typography>

        {!compact && (
          <Typography
            variant="body2"
            sx={{
              color: '#b3b3b3',
              mb: 1,
            }}
          >
            Style: {video.scriptId.style} • Duration: {video.scriptId.duration}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={video.orientation}
            size="small"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '0.6rem',
            }}
          />
          <Chip
            label={video.voiceId.provider}
            size="small"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '0.6rem',
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default VideoCard;
