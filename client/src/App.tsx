import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom'
import Navbar from './page/components/Navbar';
import Main from './page/main'
import Clubs from './page/club/clubs'
import ClubProfile from './page/club/clubProfile';

import EventPage from './page/club/eventPage';

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/clubs' element={<Clubs />} />
        <Route path='/clubs/:id' element={<ClubProfile />} />
        <Route path='/clubs/:id/events' element={<EventPage />} />
      </Routes>
    </Router>
  );
}
