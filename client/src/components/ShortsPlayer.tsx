import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Slider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  SkipNext,
  SkipPrevious,
  Fullscreen,
  FullscreenExit,
} from '@mui/icons-material';

interface Video {
  _id: string;
  episodeId: {
    _id: string;
    title: string;
    episodeNumber: number;
    type: string;
  };
  videoUrl?: string;
  thumbnailUrl?: string;
  voiceId: {
    durationSeconds: number;
  };
}

interface ShortsPlayerProps {
  videos: Video[];
  initialIndex?: number;
  onVideoEnd?: (videoIndex: number) => void;
  onVideoChange?: (videoIndex: number) => void;
}

const ShortsPlayer: React.FC<ShortsPlayerProps> = ({
  videos,
  initialIndex = 0,
  onVideoEnd,
  onVideoChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const currentVideo = videos[currentIndex];

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      onVideoEnd?.(currentIndex);
      // Auto-play next video
      if (currentIndex < videos.length - 1) {
        handleNext();
      }
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentVideo, currentIndex, videos.length, onVideoEnd]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleSeek = (event: any, newValue: number | number[]) => {
    const time = Array.isArray(newValue) ? newValue[0] : newValue;
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onVideoChange?.(newIndex);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onVideoChange?.(newIndex);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentVideo) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100vh',
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <Typography>No videos available</Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100vh',
        backgroundColor: '#000',
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={showControlsTemporarily}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={currentVideo.videoUrl}
        poster={currentVideo.thumbnailUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
        onClick={handlePlayPause}
      />

      {/* Controls Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: showControls
            ? 'linear-gradient(transparent 0%, transparent 70%, rgba(0,0,0,0.7) 100%)'
            : 'transparent',
          transition: 'background 0.3s',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: 2,
          opacity: showControls ? 1 : 0,
        }}
      >
        {/* Video Info */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            Episode {currentVideo.episodeId.episodeNumber}: {currentVideo.episodeId.title}
          </Typography>
          <Typography variant="body2" sx={{ color: '#ccc' }}>
            {currentIndex + 1} / {videos.length}
          </Typography>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Slider
            value={currentTime}
            max={duration || 100}
            onChange={handleSeek}
            sx={{
              color: '#e50914',
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" sx={{ color: 'white' }}>
              {formatTime(currentTime)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'white' }}>
              {formatTime(duration)}
            </Typography>
          </Box>
        </Box>

        {/* Control Buttons */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              sx={{ color: 'white' }}
            >
              <SkipPrevious />
            </IconButton>
            
            <IconButton
              onClick={handlePlayPause}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                },
              }}
            >
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
            
            <IconButton
              onClick={handleNext}
              disabled={currentIndex === videos.length - 1}
              sx={{ color: 'white' }}
            >
              <SkipNext />
            </IconButton>
          </Box>

          {/* Right Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handleMuteToggle} sx={{ color: 'white' }}>
              {isMuted ? <VolumeOff /> : <VolumeUp />}
            </IconButton>
            
            {!isMobile && (
              <IconButton onClick={handleFullscreen} sx={{ color: 'white' }}>
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>

      {/* Swipe Indicators */}
      {showControls && (
        <>
          {currentIndex > 0 && (
            <Box
              sx={{
                position: 'absolute',
                left: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'white',
                fontSize: 40,
                opacity: 0.5,
              }}
            >
              ‹
            </Box>
          )}
          
          {currentIndex < videos.length - 1 && (
            <Box
              sx={{
                position: 'absolute',
                right: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'white',
                fontSize: 40,
                opacity: 0.5,
              }}
            >
              ›
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ShortsPlayer;
