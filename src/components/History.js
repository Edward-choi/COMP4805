import Navbar from './NavBar';
import Banner from './Banner';
import ConnectWallet from './ConnectWallet';
import HistoryPage from './HistoryPage';
import { useEthers } from "@usedapp/core";
function History() {
  const { account } = useEthers()
  return (
    <div>
      <Navbar />
      <Banner type="History"/>
      {
        account
          ?
          <HistoryPage />
          :
          <ConnectWallet />
      }
    </div>
  );
}

export default History;
