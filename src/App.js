import './style.css';
import Navbar from './components/NavBar';
import Banner from './components/Banner';
import Container from '@mui/material/Container';

function App() {
  return (
    <div>
      <Navbar />
      <Banner type="Deposit"/>
    </div>
  );
}

export default App;
