import React, { useEffect, useState, useContext } from 'react'
import { useEthers } from "@usedapp/core";
import { Network, Alchemy } from "alchemy-sdk"
import Box from '@mui/material/Box';
import SellNFTCard from './SellNFTCard.js'
import LoanedNFTCard from './LoanedNFTCard.js'
import Grid from '@mui/material/Grid';
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { Context } from './Context.js';

function ViewNFTPage() {

    const { account } = useEthers()
    const [nfts, setNfts] = useState([])
    const { own, setOwn } = useContext(Context);

    useEffect(() => {
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
                            <LoanedNFTCard nft={nft} key={index} />
                        </Grid>
                    })
                }
                    
                </Grid>
            </Box>

        </Box>

    )

}

export default ViewNFTPage;
