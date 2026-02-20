import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Upload from './pages/Upload';
import Watch from './pages/Watch';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import Notifications from './pages/Notifications';
import ManageVideos from './pages/ManageVideos'; // Added import
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/manage-videos" element={<ManageVideos />} /> {/* Added route */}
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="bottom-center" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
