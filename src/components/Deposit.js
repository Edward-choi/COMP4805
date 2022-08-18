import Navbar from './NavBar';
import Banner from './Banner';
import ConnectWallet from './ConnectWallet';
import Container from '@mui/material/Container';

function Deposit() {
  return (
    <div>
      <Navbar />
      <Banner type="Deposit"/>
      <ConnectWallet />
    </div>
  );
}

export default Deposit;
