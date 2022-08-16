import * as React from 'react';
import Box from '@mui/material/Box';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';


function BorrowPage() {
    return (
        <Box className='borrowPage' display="flex" justifyContent="center" alignItems="center">
            <div className='borrowPageBanner'><AccountBalanceIcon/><div>Borrow</div></div>
        </Box>
    )
}

export default BorrowPage;