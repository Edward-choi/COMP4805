import { Button, ButtonGroup } from '@material-ui/core'
import DrawerComponent from './DrawerComponent';
import { Link } from 'react-router-dom';

//Button icons
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import NFFLogo from '../images/logo.svg'


export default function Navbar() {
    return (
        <div>
            <nav className='navbar'>
                <img src={NFFLogo} style={{ height: 100, width: 150 }} alt='logo' />

                <ButtonGroup variant="text" size="large" className='buttongp'>
                    <Button startIcon={<AccountBalanceIcon />} component={Link} to="/" sx={{ color: "black" }}>Home</Button>
                    <Button startIcon={<VerticalAlignBottomIcon />} component={Link} to="/marketplace" sx={{ color: "black" }}>Marketplace</Button>
                    <Button startIcon={<AddCircleOutlineIcon />} component={Link} to="/deposit" sx={{ color: "black" }}>Deposit ETH</Button>
                    <Button startIcon={<LocalAtmIcon />} component={Link} to="/withdraw" sx={{ color: "black" }}>Withdraw ETH</Button>
                </ButtonGroup>

                <DrawerComponent />

            </nav>
        </div>
    )
}