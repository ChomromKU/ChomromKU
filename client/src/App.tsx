import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom';
import Navbar from './pages/components/Navbar';
import Footer from './pages/components/Footer';
import Main from './pages/main';
import Clubs from './pages/club/clubs';
import ClubProfile from './pages/club/clubProfile';
import EventPage from './pages/club/eventPage';
import LoginPage from './pages/login/loginPage';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Members from './pages/members/memberPage';
import NewMemberPage from './pages/members/newMemberPage';
import PostForm from './pages/components/PostForm';
import PostDetailPage from './pages/post/page';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<Main />} />
          <Route path='/clubs' element={<Clubs />} />
          <Route path='/clubs/:id' element={<ClubProfile />} />
          <Route path='/clubs/:id/events' element={<EventPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/clubs/:id/members' element={<Members />} />
          <Route path='/clubs/:id/user/:userId/applyForm' element={<NewMemberPage />} />
          <Route path='/clubs/:id/posts/new' element={<PostForm />} />
          <Route path='/posts/:id' element={<PostDetailPage />} />
          <Route path='/posts/:id/like'/>
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}