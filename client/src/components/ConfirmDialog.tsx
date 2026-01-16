import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  severity?: 'info' | 'warning' | 'error' | 'success';
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  severity = 'info',
  loading = false,
}) => {
  const getSeverityColor = () => {
    switch (severity) {
      case 'warning':
        return '#ff9800';
      case 'error':
        return '#f44336';
      case 'success':
        return '#4caf50';
      default:
        return '#2196f3';
    }
  };

  const getConfirmButtonColor = () => {
    switch (severity) {
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'success':
        return 'success';
      default:
        return 'primary';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#1a1a1a',
          color: 'white',
          border: `1px solid ${getSeverityColor()}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: getSeverityColor(),
          color: 'white',
          fontWeight: 'bold',
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {message && (
          <DialogContentText
            sx={{
              color: '#ccc',
              lineHeight: 1.6,
            }}
          >
            {message}
          </DialogContentText>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          sx={{
            color: '#ccc',
            borderColor: '#ccc',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'white',
            },
          }}
        >
          {cancelText}
        </Button>
        
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color={getConfirmButtonColor() as any}
          sx={{
            minWidth: 100,
          }}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
