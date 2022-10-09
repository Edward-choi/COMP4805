import React, { useEffect, useState } from 'react'
import { Network, Alchemy } from "alchemy-sdk"
import Box from '@mui/material/Box';
import ListedNFTCard from './ListedNFTCard.js'
import Grid from '@mui/material/Grid';
import ContractAddress from './ContractAddress.json'

function MarketplacePage() {
    const contractAddress = ContractAddress.bank;
    const [nfts, setNfts] = useState([])
    // const axios = require("axios");
    // const options = {
    //     method: 'GET',
    //     url: 'https://opensea15.p.rapidapi.com/api/v1/assets',
    //     params: {owner: `${account}`},
    //     headers: {
    //       'X-RapidAPI-Key': '73764aa404msh6e5e4f2abf95983p14f036jsna93351c64534',
    //       'X-RapidAPI-Host': 'opensea15.p.rapidapi.com'
    //     }
    // };

    // const getNftData = async() => {
    //     await axios.request(options).then(function (response) {
    //         const data = response.data
    //         setNfts(data.assets)
    //         // debugger
    //     }).catch(function (error) {
    //         console.error(error);
    //     });
    // }

    useEffect(() => {
        const settingsGetNft = {
            apiKey: "6RB8WVyUkqB6YjCiiKX57HqZL7RRiVYL", // Replace with your Alchemy API Key.
            network: Network.ETH_GOERLI, // Replace with your network.
        };
    
        const getNftData = () => {
            const alchemy = new Alchemy(settingsGetNft);
            alchemy.nft.getNftsForOwner(contractAddress).then(function (response) {
                const data = response.ownedNfts
                setNfts(data)
                // debugger
            }).catch(function (error) {
                console.error(error);
            });
        }
    
        getNftData()
    }, [contractAddress])

    return (
        <Box display="flex" justifyContent="center" alignItems="center" textAlign="center">

            <Box className='marketplaceContainer' display="inline-flex">
                <Grid container rowSpacing={5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    {nfts.map((nft, index) => {
                        return <Grid item md={3} xs={12}>
                            <ListedNFTCard nft={nft} key={index} />
                        </Grid>
                    })}
                    {/* </div> */}
                </Grid>
            </Box>

        </Box>

    )

}

export default MarketplacePage;
