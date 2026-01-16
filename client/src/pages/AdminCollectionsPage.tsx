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
  Switch,
  FormControlLabel,
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
}

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
  createdAt: string;
  updatedAt: string;
}

const AdminCollectionsPage: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    sortOrder: 0,
    isFeatured: false,
  });
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
    loadUser();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [collectionsRes, categoriesRes] = await Promise.all([
        apiClient.getCollections(),
        apiClient.getCategories(),
      ]);

      if (collectionsRes.success) {
        setCollections(collectionsRes.data || []);
      }

      if (categoriesRes.success) {
        setCategories(categoriesRes.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const userRes = await apiClient.getCurrentUser();
        if (userRes.success) {
          setUser(userRes.data);
        }
      }
    } catch (err) {
      // User not logged in
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const handleOpenDialog = (collection?: Collection) => {
    if (collection) {
      setEditingCollection(collection);
      setFormData({
        title: collection.title,
        categoryId: collection.categoryId._id,
        sortOrder: collection.sortOrder,
        isFeatured: collection.isFeatured,
      });
    } else {
      setEditingCollection(null);
      setFormData({
        title: '',
        categoryId: categories.length > 0 ? categories[0]._id : '',
        sortOrder: collections.length,
        isFeatured: false,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCollection(null);
    setFormData({
      title: '',
      categoryId: '',
      sortOrder: 0,
      isFeatured: false,
    });
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.categoryId) {
      setError('Title and category are required');
      return;
    }

    setSaving(true);
    try {
      if (editingCollection) {
        await apiClient.updateCollection(editingCollection._id, formData);
      } else {
        await apiClient.createCollection(formData);
      }
      
      handleCloseDialog();
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to save collection');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (collection: Collection) => {
    setEditingCollection(collection);
    setDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!editingCollection) return;

    setDeleting(true);
    try {
      await apiClient.deleteCollection(editingCollection._id);
      setDeleteDialog(false);
      setEditingCollection(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete collection');
    } finally {
      setDeleting(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Unknown';
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
      <Navbar onLogout={handleLogout} />
      
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
              Manage Collections
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#ccc',
              }}
            >
              Create and manage content collections (Netflix-style rows)
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
            Add Collection
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

        {/* Collections List */}
        <Box sx={{ backgroundColor: '#1a1a1a', borderRadius: 2, p: 3 }}>
          {collections.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {collections
                .sort((a, b) => {
                  // Featured first, then by sort order
                  if (a.isFeatured && !b.isFeatured) return -1;
                  if (!a.isFeatured && b.isFeatured) return 1;
                  return a.sortOrder - b.sortOrder;
                })
                .map((collection) => (
                <Box
                  key={collection._id}
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
                      {collection.title}
                      {collection.isFeatured && (
                        <Box
                          component="span"
                          sx={{
                            ml: 2,
                            backgroundColor: '#e50914',
                            color: 'white',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                          }}
                        >
                          FEATURED
                        </Box>
                      )}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ccc' }}>
                      Category: {collection.categoryId.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ccc' }}>
                      Sort Order: {collection.sortOrder}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => handleOpenDialog(collection)}
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
                      onClick={() => handleDelete(collection)}
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
                No collections yet
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#888',
                }}
              >
                Create your first collection to organize content into rows
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
          {editingCollection ? 'Edit Collection' : 'Add Collection'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            <InputLabel sx={{ color: '#ccc' }}>Category</InputLabel>
            <Select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
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
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name} ({category.type})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Sort Order"
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
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
          
          <FormControlLabel
            control={
              <Switch
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#e50914',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#e50914',
                  },
                }}
              />
            }
            label="Featured Collection"
            sx={{ color: 'white' }}
          />
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
        title="Delete Collection"
        message={`Are you sure you want to delete "${editingCollection?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialog(false);
          setEditingCollection(null);
        }}
      />
    </Box>
  );
};

export default AdminCollectionsPage;
