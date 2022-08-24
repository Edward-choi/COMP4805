import React, { useEffect } from 'react'
import { useEthers, useEtherBalance, Mainnet } from "@usedapp/core";
import Box from '@mui/material/Box';

function ViewNFTPage() {
    const { account } = useEthers()
    const getNftData = async () =>{
        const response = await fetch(`https://api.rarible.org/v0.1/items/byOwner/?owner=ETHEREUM:${account}`)
        const data = await response.json()
        debugger
    }
    
    useEffect(()=> {
        getNftData()
    },[account])

    return (
        <Box Box display="flex" justifyContent="center" alignItems="center" textAlign="center">
            <div>test</div>
        </Box>
        
    )
    
}
  
export default ViewNFTPage;
  