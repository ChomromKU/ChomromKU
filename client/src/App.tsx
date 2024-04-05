import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom';
import ScrollToTop from './ScrollToTop';
import Navbar from './pages/components/Navbar';
import Footer from './pages/components/Footer';
import Main from './pages/main';
import Clubs from './pages/club/clubs';
import ClubProfile from './pages/club/clubProfile';
import EventPage from './pages/club/events/eventPage';
import LoginPage from './pages/login/loginPage';
import { AuthProvider } from './context/AuthContext';
import Members from './pages/club/members/memberPage';
import NewMemberPage from './pages/club/members/new/newMemberPage';
import PostDetailPage from './pages/post/postDetailPage';
import NewEventPage from './pages/club/posts/new/newEventPage';
import RequestedPostsPage from './pages/club/posts/requested/requestedPostsPage';
import RequestedMemberPage from './pages/club/members/requested/requestedMemberPage';
import EventDetailPage from './pages/event/eventDetailPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Navbar />
        <div style={{ minHeight: 'calc(100vh - 160px)', position: 'relative'}}>
          <Routes>
              <Route path='/' element={<Main />} />
              <Route path='/login' element={<LoginPage />} />
              <Route path='/clubs' element={<Clubs />} />
              <Route path='/clubs/:id' element={<ClubProfile />} />
              <Route path='/clubs/:id/events' element={<EventPage />} />
              <Route path='/clubs/:id/members' element={<Members />} />
              <Route path='/clubs/:id/user/:userId/applyForm' element={<NewMemberPage />} />
              <Route path='/clubs/:id/posts/new' element={<NewEventPage />} />
              <Route path='/clubs/:id/posts/requested' element={<RequestedPostsPage />} />
              <Route path='/clubs/:id/requestedMember' element={<RequestedMemberPage />} />
              <Route path='/posts/:id' element={<PostDetailPage />} />
              <Route path='/events/:id' element={<EventDetailPage/>} />
          </Routes>
        </div>
        <Footer />
      </Router>
    </AuthProvider>
  );
}