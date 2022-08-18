import Navbar from './NavBar';
import Banner from './Banner';
import Container from '@mui/material/Container';

function DashBoard() {
  return (
    <div>
      <Navbar />
      <Banner type="Dashboard"/>
    </div>
  );
}

export default DashBoard;
