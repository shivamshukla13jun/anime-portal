import React, { useRef } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { FaFileImport } from 'react-icons/fa';

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  loading: boolean;
  variant?: "text" | "outlined" | "contained";
  title?: string;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onFileSelect,
  loading,
  variant = "outlined",
  title = "Import"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Reset the input value to allow selecting the same file again
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      />
      <Button
        variant={variant}
        onClick={handleButtonClick}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : <FaFileImport />}
      >
        {title}
      </Button>
    </>
  );
};

export default FileUploadButton;
