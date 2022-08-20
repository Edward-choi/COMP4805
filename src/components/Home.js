import Navbar from './NavBar';
import HomePage from './HomePage';

function Home(props) {
  return (
    <div>
      <Navbar handleConnect={props.handleConnect}
        walletAddress={props.walletAddress}
        displayWalletAddress={props.displayWalletAddress}
        walletBalance={props.walletBalance} />
      <HomePage walletAddress={props.walletAddress}
        displayWalletAddress={props.displayWalletAddress}
        walletBalance={props.walletBalance} />
    </div>
  );
}

export default Home;
