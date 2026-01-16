import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import ShortsPage from '../pages/ShortsPage';
import CategoryPage from '../pages/CategoryPage';
import PlaylistPage from '../pages/PlaylistPage';
import ContentDetailPage from '../pages/ContentDetailPage';
import StudioDashboard from '../pages/StudioDashboard';
import ReviewQueuePage from '../pages/ReviewQueuePage';
import VideoEditorPage from '../pages/VideoEditorPage';
import AdminDashboard from '../pages/AdminDashboard';
import AdminCategoriesPage from '../pages/AdminCategoriesPage';
import AdminCollectionsPage from '../pages/AdminCollectionsPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import AdminContentPage from '../pages/AdminContentPage';
import AdminCronPage from '../pages/AdminCronPage';
import Login from '@/pages/Auth/Login';
import ProtectedRoute from '../components/ProtectedRoute';

const AnimeRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      {/* <Route path="/register" element={<Register />} /> */}
      <Route path="/shorts" element={<ShortsPage />} />
      <Route path="/category/:categoryId" element={<CategoryPage />} />
      <Route path="/playlist/:playlistId" element={<PlaylistPage />} />
      <Route path="/content/:contentId" element={<ContentDetailPage />} />
      
      {/* Creator Routes */}
      <Route 
        path="/studio" 
        element={
          <ProtectedRoute requireCreator>
            <StudioDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/studio/review" 
        element={
          <ProtectedRoute requireCreator>
            <ReviewQueuePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/studio/editor/:videoId" 
        element={
          <ProtectedRoute requireCreator>
            <VideoEditorPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/categories" 
        element={
          <ProtectedRoute requireAdmin>
            <AdminCategoriesPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/collections" 
        element={
          <ProtectedRoute requireAdmin>
            <AdminCollectionsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute requireAdmin>
            <AdminUsersPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/content" 
        element={
          <ProtectedRoute requireAdmin>
            <AdminContentPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/cron" 
        element={
          <ProtectedRoute requireAdmin>
            <AdminCronPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default AnimeRouter;
