import React from 'react';
import { CircularProgress } from '@mui/material';

const LoadingSpinner: React.FC<{size?:number}> = ({size=20}) => {
  return (
    <CircularProgress  size={size} />
  );
}

export default LoadingSpinner;