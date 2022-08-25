import React, { useEffect, useState } from 'react'
import { useEthers, useEtherBalance, Mainnet } from "@usedapp/core";
import Box from '@mui/material/Box';
import NFTCard from './NFTCard.js'

function ViewNFTPage() {
    
    const { account } = useEthers()
    const [nfts, setNfts] = useState([])

    const axios = require("axios");

    const options = {
        method: 'GET',
        url: 'https://opensea15.p.rapidapi.com/api/v1/assets',
        params: {owner: `${account}`},
        headers: {
          'X-RapidAPI-Key': '73764aa404msh6e5e4f2abf95983p14f036jsna93351c64534',
          'X-RapidAPI-Host': 'opensea15.p.rapidapi.com'
        }
      };

    const getNftData = async() => {
        await axios.request(options).then(function (response) {
            const data = response.data
            setNfts(data.assets)
        }).catch(function (error) {
            console.error(error);
        });
    }

    // const getNftData = async () =>{
    //     const response = await fetch(`https://api.rarible.org/v0.1/items/byOwner/?owner=ETHEREUM:${account}`)
    //     const data = await response.json()
    //     setNfts(data.items)
    //     debugger
    // }

    useEffect(()=> {
        getNftData()
    },[account])

    return (
        <Box Box display="flex" justifyContent="center" alignItems="center" textAlign="center">

            <Box className='depositContainer1' display="inline-flex">
                <div className='nft-container'>
                    {nfts.map((nft, index) => {
                        return <NFTCard nft = {nft} key = {index}/>
                    })}
                </div>
            </Box>

        </Box>
        
    )
    
}
  
export default ViewNFTPage;
  