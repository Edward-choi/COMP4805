import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { useEthers} from "@usedapp/core";

function ConnectWallet() {
    const {activateBrowserWallet} = useEthers()
    // const MainnetBalance = useEtherBalance(account, {chainId: Mainnet.chainId})
    return (
        <Box className='walletContainer' display="flex" justifyContent="center" alignItems="center">
            <div className='walletContent'>
                <AccountBalanceWalletIcon sx={{ fontSize: "5rem" }} />
                <div className='WalletFont1'>No wallet detected</div>
                <div className='WalletFont2'>Please connect your wallet</div>
                <Button variant="contained" onClick={()=>activateBrowserWallet()} style={{
                    borderRadius: 20, backgroundColor: "#21b6ae", padding: "12px 24px", fontSize: "18px", margin: "25px 10px 20px 10px"
                }}>
                    Connect Wallet
                </Button>
            </div>
        </Box>
    )
}

export default ConnectWallet;