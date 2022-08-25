import React, { useEffect, useState } from 'react'
import { useEthers, useEtherBalance, Mainnet } from "@usedapp/core";
import Box from '@mui/material/Box';
import NFTCard from './NFTCard.js'

function ViewNFTPage() {
    const { account } = useEthers()
    const [nfts, setNfts] = useState([])
    const getNftData = async () =>{
        const response = await fetch(`https://api.rarible.org/v0.1/items/byOwner/?owner=ETHEREUM:${account}`)
        const data = await response.json()
        setNfts(data.items)
    }

    useEffect(()=> {
        getNftData()
    },[account])

    return (
        <Box Box display="flex" justifyContent="center" alignItems="center" textAlign="center">

            <Box className='depositContainer1' display="inline-flex">
                <div>
                    {nfts.map((nft, index) => {
                        return <NFTCard nft = {nft} key = {index}/>
                    })}
                </div>
            </Box>

        </Box>
        
    )
    
}
  
export default ViewNFTPage;
  