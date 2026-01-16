import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  useTheme,
} from '@mui/material';
import { PlayArrow } from '@mui/icons-material';

interface Playlist {
  _id: string;
  title: string;
  description: string;
  posterUrl: string;
  type: string;
  categoryId: string;
  collectionId?: string;
}

interface PlaylistCardProps {
  playlist: Playlist;
  onClick?: () => void;
  compact?: boolean;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  onClick,
  compact = false,
}) => {
  const theme = useTheme();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'anime':
        return '#e50914';
      case 'manga':
        return '#f4c430';
      case 'movie':
        return '#2196f3';
      case 'show':
        return '#4caf50';
      case 'webseries':
        return '#ff9800';
      case 'shorts':
        return '#9c27b0';
      default:
        return '#757575';
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
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
          transform: 'scale(1.05)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
          '& .play-overlay': {
            opacity: 1,
          },
        },
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={onClick}
    >
      {/* Poster Image */}
      <Box sx={{ position: 'relative', paddingTop: compact ? '150%' : '56.25%' }}>
        <CardMedia
          image={playlist.posterUrl || '/placeholder-poster.jpg'}
          title={playlist.title}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        
        {/* Play Overlay */}
        <Box
          className="play-overlay"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.2s',
          }}
        >
          <PlayArrow
            sx={{
              fontSize: compact ? 40 : 60,
              color: 'white',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
            }}
          />
        </Box>

        {/* Type Badge */}
        <Chip
          label={getTypeLabel(playlist.type)}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: getTypeColor(playlist.type),
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
          {playlist.title}
        </Typography>

        {!compact && (
          <Typography
            variant="body2"
            sx={{
              color: '#b3b3b3',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.4,
            }}
          >
            {playlist.description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default PlaylistCard;
