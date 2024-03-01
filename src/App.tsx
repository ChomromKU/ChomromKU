import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom'
import Navbar from './page/components/Navbar';
import Main from './page/main'
import Clubs from './page/club'

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/clubs' element={<Clubs searchParams={{ q: "" }} />} />
      </Routes>
    </Router>
  );
}
