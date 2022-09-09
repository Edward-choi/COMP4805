import Navbar from './NavBar';
import Banner from './Banner';
import ConnectWallet from './ConnectWallet';
import WithdrawPage from './WithdrawPage';
import { useEthers, useEtherBalance, Mainnet } from "@usedapp/core";
function Withdraw() {
  const { account } = useEthers();
  return (
    <div>
      <Navbar />
      <Banner type="Withdraw"/>
      {
        account
          ?
          <WithdrawPage />
          :
          <ConnectWallet />
      }
    </div>
  );
}

export default Withdraw;
