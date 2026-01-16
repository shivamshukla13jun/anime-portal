import React from 'react';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  PlayArrow,
  Add,
  Info,
} from '@mui/icons-material';

interface ContentCardProps {
  content: {
    _id: string;
    title: string;
    synopsis: string;
    posterUrl: string;
    type: string;
    genres: string[];
    rating: number;
    status: string;
  };
  onClick: () => void;
  showActions?: boolean;
}

const ContentCard: React.FC<ContentCardProps> = ({ content, onClick, showActions = true }) => {
  const theme = useTheme();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'anime': return '#e50914';
      case 'manga': return '#f4c430';
      case 'movie': return '#2196f3';
      case 'show': return '#4caf50';
      case 'webseries': return '#ff9800';
      case 'shorts': return '#9c27b0';
      default: return '#757575';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return '#4caf50';
      case 'draft': return '#ff9800';
      case 'archived': return '#f44336';
      default: return '#757575';
    }
  };

  return (
    <Card
      sx={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #333',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(229, 9, 20, 0.3)',
          borderColor: '#e50914',
          '& .content-card-actions': {
            opacity: 1,
          },
        },
      }}
      onClick={onClick}
    >
      <Box sx={{ position: 'relative' }}>
        {content.posterUrl ? (
          <CardMedia
            component="img"
            height="450"
            image={content.posterUrl}
            alt={content.title}
            sx={{ objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              height: 450,
              backgroundColor: '#2a2a2a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
            }}
          >
            No Image
          </Box>
        )}
        
        {/* Status Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
          }}
        >
          <Chip
            label={content.status}
            size="small"
            sx={{
              backgroundColor: getStatusColor(content.status),
              color: 'white',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: '0.7rem',
            }}
          />
        </Box>

        {/* Hover Actions */}
        {showActions && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              right: 8,
              display: 'flex',
              gap: 1,
              opacity: 0,
              transition: 'opacity 0.3s ease',
            }}
            className="content-card-actions"
          >
            <IconButton
              size="small"
              sx={{
                backgroundColor: 'rgba(229, 9, 20, 0.9)',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#e50914',
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              <PlayArrow />
            </IconButton>
            <IconButton
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: 'black',
                '&:hover': {
                  backgroundColor: 'white',
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Add to playlist logic
              }}
            >
              <Add />
            </IconButton>
            <IconButton
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: 'black',
                '&:hover': {
                  backgroundColor: 'white',
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Show more info logic
              }}
            >
              <Info />
            </IconButton>
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {content.title}
        </Typography>
        
        <Typography
          variant="body2"
          sx={{
            color: '#ccc',
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.4,
          }}
        >
          {content.synopsis}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={content.type}
            size="small"
            sx={{
              backgroundColor: getTypeColor(content.type),
              color: 'white',
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}
          />
          <Typography
            variant="body2"
            sx={{
              color: '#ccc',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ⭐ {content.rating?.toFixed(1) || 'N/A'}
          </Typography>
        </Box>

        {content.genres && content.genres.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {content.genres.slice(0, 2).map((genre, index) => (
              <Chip
                key={index}
                label={genre}
                size="small"
                sx={{
                  backgroundColor: '#333',
                  color: '#ccc',
                  fontSize: '0.7rem',
                }}
              />
            ))}
            {content.genres.length > 2 && (
              <Chip
                label={`+${content.genres.length - 2}`}
                size="small"
                sx={{
                  backgroundColor: '#333',
                  color: '#ccc',
                  fontSize: '0.7rem',
                }}
              />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentCard;
