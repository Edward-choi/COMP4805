import Navbar from './NavBar';
import Banner from './Banner';
import ConnectWallet from './ConnectWallet';
import { useEthers, useEtherBalance, Mainnet } from "@usedapp/core";
import MarketplacePage from './MarketplacePage';

function Marketplace() {
  const { account } = useEthers()
  return (
    <div>
      <Navbar />
      <Banner type="Marketplace" />
      {
        account
          ?
          <MarketplacePage />
          :
          <ConnectWallet />
      }
    </div>
  );
}

export default Marketplace;
