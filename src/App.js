import './style.css';
import Navbar from './components/NavBar';
import BorrowPage from './components/BorrowPage';
import Container from '@mui/material/Container';

function App() {
  return (
    <div>
      <Navbar />
      <BorrowPage />
    </div>
  );
}

export default App;
