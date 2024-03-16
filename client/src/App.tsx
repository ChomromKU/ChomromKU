import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom';
import Navbar from './page/components/Navbar';
import Main from './page/main';
import Clubs from './page/club/clubs';
import ClubProfile from './page/club/clubProfile';
import EventPage from './page/club/eventPage';
import LoginPage from './page/login/loginPage';
import { AuthContext } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Members from './page/members/memberPage';
import NewMemberPage from './page/members/newMemberPage';

export default function App() {
  const { user, setUser } = useAuth();
  const isAuthenticated = user !== null;
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, setUser }}>
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<Main />} />
          <Route path='/clubs' element={<Clubs />} />
          <Route path='/clubs/:id' element={<ClubProfile />} />
          <Route path='/clubs/:id/events' element={<EventPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/clubs/:id/members' element={<Members />} />
          <Route path='/clubs/:id/members/applyForm' element={<NewMemberPage />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}
