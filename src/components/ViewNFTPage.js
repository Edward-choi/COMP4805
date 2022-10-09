import React, { useEffect, useState } from 'react'
import { useEthers, useEtherBalance, Mainnet } from "@usedapp/core";
import { Network, Alchemy } from "alchemy-sdk"
import Box from '@mui/material/Box';
import SellNFTCard from './SellNFTCard.js'
import Grid from '@mui/material/Grid';
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { ownerDocument } from '@mui/material';

function ViewNFTPage() {

    const { account } = useEthers()
    const [nfts, setNfts] = useState([])
    const [own, setOwn] = useState(true);

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

    const settingsGetNft = {
        apiKey: "6RB8WVyUkqB6YjCiiKX57HqZL7RRiVYL", // Replace with your Alchemy API Key.
        network: Network.ETH_GOERLI, // Replace with your network.
    };

    const getNftData = () => {
        const alchemy = new Alchemy(settingsGetNft);
        alchemy.nft.getNftsForOwner(account).then(function (response) {
            const data = response.ownedNfts
            setNfts(data)
            // debugger
        }).catch(function (error) {
            console.error(error);
        });
    }

    useEffect(() => {
        getNftData()
    }, [account])

    return (
        <Box justifyContent="center" alignItems="center" textAlign="center">

            <Box width="90%" margin="auto">
                <ButtonGroup className='viewNFTButtonContainer' display="inline-flex" 
                variant='text' exclusive="true" fullWidth sx={ { borderRadius: "3rem 3rem 0 0" } }>
                    <Button value="own" style={{ backgroundColor: own ? "rgb(236, 236, 236)" : "#fff" }} 
                    onClick={() => setOwn(true)} sx={ { borderTopLeftRadius: "3rem", fontSize: "1.5rem", padding: "1rem" } }>
                        Fully owned NFTs
                    </Button>
                    <Button value="loan" style={{ backgroundColor: !own ? "rgb(236, 236, 236)" : "#fff" }} 
                    onClick={() => setOwn(false)} sx={ { borderTopRightRadius: "3rem", fontSize: "1.5rem", padding: "1rem"  } }>
                        NFTs on loan
                    </Button>
                </ButtonGroup>
            </Box>
            <Box className='viewNFTContainer' display="inline-flex" ariant="text" exclusive="true">
                <Grid container rowSpacing={5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    {own ?
                    nfts.map((nft, index) => {
                        return <Grid item md={3} xs={12}>
                            <SellNFTCard nft={nft} key={index} />
                        </Grid>
                    })
                    :
                    nfts.map((nft, index) => {
                        return <Grid item md={3} xs={12}>
                            <SellNFTCard nft={nft} key={index} />
                        </Grid>
                    })
                }
                    
                </Grid>
            </Box>

        </Box>

    )

}

export default ViewNFTPage;
