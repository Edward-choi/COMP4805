import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

function ConnectWallet() {
    return (
        <Box className='walletContainer' display="flex" justifyContent="center" alignItems="center">
            <div className='walletContent'>
                <AccountBalanceWalletIcon sx={{ fontSize: "5rem" }} />
                <div className='WalletFont1'>No wallet detected</div>
                <div className='WalletFont2'>Please connect your wallet</div>
                <Button variant="contained" style={{
                    borderRadius: 25, backgroundColor: "#21b6ae", padding: "18px 36px", fontSize: "18px", margin: "20px"}}>Connect Wallet</Button>
            </div>
        </Box>
    )
}

export default ConnectWallet;