import Navbar from './NavBar';
import Banner from './Banner';
import ConnectWallet from './ConnectWallet';
import { useEthers, useEtherBalance, Mainnet } from "@usedapp/core";

function Borrow() {
  const { account } = useEthers()
  return (
    <div>
      <Navbar />
      <Banner type="Borrow" />
      {
        account
          ?
          <ConnectWallet />
          :
          <ConnectWallet />
      }
    </div>
  );
}

export default Borrow;
