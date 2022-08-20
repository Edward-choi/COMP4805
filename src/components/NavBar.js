import { Button, ButtonGroup, IconButton } from '@material-ui/core'
import DrawerComponent from './DrawerComponent';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';

//Button icons
import PersonIcon from '@mui/icons-material/Person'
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import NFFLogo from '../images/logo.svg'

export default function Navbar(props) {
    return (
        <div>
            <nav className='navbar'>
                <img src={NFFLogo} style={{ height: 100, width: 150 }} alt='logo' />

                <ButtonGroup variant="text" size="large" className='buttongp'>
                    <Button startIcon={<AccountBalanceIcon />} component={Link} to="/">home</Button>
                    <Button startIcon={<PersonIcon />} component={Link} to="/dashboard">Dashboard</Button>
                    <Button startIcon={<VerticalAlignBottomIcon />} component={Link} to="/borrow">Borrow ETH</Button>
                    <Button startIcon={<AddCircleOutlineIcon />} component={Link} to="/deposit">Deposit ETH</Button>
                </ButtonGroup>

                <DrawerComponent  handleConnect={props.handleConnect}
                walletAddress={props.walletAddress} 
                displayWalletAddress={props.displayWalletAddress} 
                walletBalance={props.walletBalance} />

            </nav>
        </div>
    )
}