import {Button, ButtonGroup, IconButton} from '@material-ui/core'
import DrawerComponent from './DrawerComponent';

//Button icons
import PersonIcon from '@mui/icons-material/Person'
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import NFFLogo from '../images/logo.svg'

export default function Navbar(){
    return (
    <nav className='navbar'>
        <img src={NFFLogo} style={{ height: 100, width: 150 }} alt='logo'/>
        
        <ButtonGroup variant="text" size="large" className='buttongp'>
            <Button startIcon={<AccountBalanceIcon/>}>home</Button>
            <Button startIcon={<PersonIcon/>}>Dashboard</Button>
            <Button startIcon={<VerticalAlignBottomIcon/>}>Borrow ETH</Button>
            <Button startIcon={<AddCircleOutlineIcon/>}>Deposit ETH</Button>
        </ButtonGroup>

        <DrawerComponent/>

    </nav>
    )
}