import Navbar from './NavBar';
import Banner from './Banner';
import ConnectWallet from './ConnectWallet';
import DepositPage from './DepositPage';
import { useEthers } from "@usedapp/core";
function Deposit() {
  const { account } = useEthers()
  return (
    <div>
      <Navbar />
      <Banner type="Deposit"/>
      {
        account
          ?
          <DepositPage />
          :
          <ConnectWallet />
      }
    </div>
  );
}

export default Deposit;
