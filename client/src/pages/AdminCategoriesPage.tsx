import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import Navbar from '../components/Navbar';
import ConfirmDialog from '../components/ConfirmDialog';
import apiClient from '../services/apiClient';

interface Category {
  _id: string;
  name: string;
  slug: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

const AdminCategoriesPage: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'anime',
  });
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCategories();
    loadUser();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getCategories();
      
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
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


  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        type: category.type,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        type: 'anime',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      type: 'anime',
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.slug.trim()) {
      setError('Name and slug are required');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await apiClient.updateCategory(editingCategory._id, formData);
      } else {
        await apiClient.createCategory(formData);
      }
      
      handleCloseDialog();
      loadCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    setEditingCategory(category);
    setDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!editingCategory) return;

    setDeleting(true);
    try {
      await apiClient.deleteCategory(editingCategory._id);
      setDeleteDialog(false);
      setEditingCategory(null);
      loadCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

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
              Manage Categories
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#ccc',
              }}
            >
              Create and manage content categories
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              backgroundColor: '#e50914',
              color: 'white',
              '&:hover': {
                backgroundColor: '#f40612',
              },
            }}
          >
            Add Category
          </Button>
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

        {/* Categories List */}
        <Box sx={{ backgroundColor: '#1a1a1a', borderRadius: 2, p: 3 }}>
          {categories.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {categories.map((category) => (
                <Box
                  key={category._id}
                  sx={{
                    backgroundColor: '#2a2a2a',
                    p: 3,
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {category.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ccc' }}>
                      /{category.slug}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Box
                        component="span"
                        sx={{
                          backgroundColor: getTypeColor(category.type),
                          color: 'white',
                          px: 2,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                        }}
                      >
                        {category.type}
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => handleOpenDialog(category)}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      Edit
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<Delete />}
                      onClick={() => handleDelete(category)}
                      sx={{
                        borderColor: '#f44336',
                        color: '#f44336',
                        '&:hover': {
                          backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        },
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography
                variant="h6"
                sx={{
                  color: '#ccc',
                  mb: 2,
                }}
              >
                No categories yet
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#888',
                }}
              >
                Create your first category to organize content
              </Typography>
            </Box>
          )}
        </Box>
      </Container>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            color: 'white',
          },
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>
          {editingCategory ? 'Edit Category' : 'Add Category'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          
          <TextField
            fullWidth
            label="Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
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
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ color: '#ccc' }}>Type</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
              <MenuItem value="anime">Anime</MenuItem>
              <MenuItem value="manga">Manga</MenuItem>
              <MenuItem value="movie">Movie</MenuItem>
              <MenuItem value="show">Show</MenuItem>
              <MenuItem value="webseries">Web Series</MenuItem>
              <MenuItem value="shorts">Shorts</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} sx={{ color: '#ccc' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="contained"
            sx={{
              backgroundColor: '#e50914',
              color: 'white',
              '&:hover': {
                backgroundColor: '#f40612',
              },
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialog}
        title="Delete Category"
        message={`Are you sure you want to delete "${editingCategory?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialog(false);
          setEditingCategory(null);
        }}
      />
    </Box>
  );
};

export default AdminCategoriesPage;
