import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom'
import Navbar from './page/components/Navbar';
import Main from './page/main'
import Clubs from './page/club/clubs'
import ClubProfile from './page/club/clubProfile';
import Login from './page/login/loginPage';

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/clubs' element={<Clubs />} />
        <Route path='/clubs/:id' element={<ClubProfile />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </Router>
  );
}
