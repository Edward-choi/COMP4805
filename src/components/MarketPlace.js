import Navbar from './NavBar';
import Banner from './Banner';
import ConnectWallet from './ConnectWallet';
import { useEthers, useEtherBalance, Mainnet } from "@usedapp/core";
import MarketPlacePage from './MarketPlacePage';

function Marketplace() {
  const { account } = useEthers()
  return (
    <div>
      <Navbar />
      <Banner type="Marketplace" />
      {
        account
          ?
          <MarketPlacePage />
          :
          <ConnectWallet />
      }
    </div>
  );
}

export default Marketplace;
