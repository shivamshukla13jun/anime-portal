import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { useState } from 'react';
import PlaylistCard from './PlaylistCard';

interface Collection {
  _id: string;
  title: string;
  categoryId: {
    _id: string;
    name: string;
    slug: string;
    type: string;
  };
  isFeatured: boolean;
  sortOrder: number;
}

interface Playlist {
  _id: string;
  title: string;
  description: string;
  posterUrl: string;
  type: string;
  categoryId: string;
  collectionId?: string;
}

interface CollectionRowProps {
  collection: Collection;
  playlists: Playlist[];
  onPlaylistClick?: (playlist: Playlist) => void;
}

const CollectionRow: React.FC<CollectionRowProps> = ({
  collection,
  playlists,
  onPlaylistClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = isMobile ? 200 : 300;
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth',
      });
      setScrollPosition(newPosition);
    }
  };

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollContainerRef.current 
    ? scrollPosition < scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth
    : false;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant={collection.isFeatured ? 'h4' : 'h5'}
        component="h2"
        sx={{
          color: 'white',
          mb: 2,
          fontWeight: collection.isFeatured ? 'bold' : 'medium',
          px: 2,
        }}
      >
        {collection.title}
      </Typography>

      <Box sx={{ position: 'relative' }}>
        {/* Left scroll button */}
        {canScrollLeft && (
          <IconButton
            onClick={() => scroll('left')}
            sx={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
              },
              borderRadius: '50%',
            }}
          >
            <ChevronLeft />
          </IconButton>
        )}

        {/* Right scroll button */}
        {canScrollRight && (
          <IconButton
            onClick={() => scroll('right')}
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
              },
              borderRadius: '50%',
            }}
          >
            <ChevronRight />
          </IconButton>
        )}

        {/* Scrollable content */}
        <Box
          ref={scrollContainerRef}
          sx={{
            display: 'flex',
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none', // Firefox
            '&::-webkit-scrollbar': {
              display: 'none', // Chrome, Safari, Edge
            },
            gap: 2,
            px: canScrollLeft ? 6 : 2,
            pr: canScrollRight ? 6 : 2,
          }}
        >
          {playlists.map((playlist) => (
            <Box
              key={playlist._id}
              sx={{
                flexShrink: 0,
                width: isMobile ? 150 : 200,
              }}
            >
              <PlaylistCard
                playlist={playlist}
                onClick={() => onPlaylistClick?.(playlist)}
                compact={true}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default CollectionRow;
