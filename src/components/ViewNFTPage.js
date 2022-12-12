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
import ContractAddress from './ContractAddress.json'
import abi from '../contracts/Bank/abi.json';
import { Contract } from '@ethersproject/contracts';
import { formatEther } from "ethers/lib/utils";

function ViewNFTPage() {
    const { account, library } = useEthers();
    const [nfts, setNfts] = useState([])
    const [mortgage, setMortgage] = useState([])
    const [mortNFTs, setMortNFTs] = useState([])
    const [nftPrice, setNftPrice] = useState(0)
    const { own, setOwn } = useContext(Context);

    const contractAddress = ContractAddress.bank;
    var contract = null;
    if (library) {
        contract = new Contract(contractAddress, abi, library.getSigner());
    }

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

    useEffect( () => {
        if (contract && account) {
            async function getMortgage() {
                const mortgages = await contract.getAllUserLoan(account);
                setMortgage(mortgages);
            }
            getMortgage();
        }
    }, [account]);

    useEffect( () => {
        if (contract) {
            async function getAssetPrice() {
                const assetPrice = await contract.nftLiquidationPrice();
                setNftPrice(parseFloat(formatEther(assetPrice)));
            }
            getAssetPrice();
        }
    }, [contract]);

    useEffect(() => {
        const settings = {
            apiKey: "6RB8WVyUkqB6YjCiiKX57HqZL7RRiVYL", // Replace with your Alchemy API Key.
            network: Network.ETH_GOERLI, // Replace with your network.
        };
        async function getNFTs(address, tokenId, i) {
            if(account && mortgage){
                const alchemy = new Alchemy(settings);
                alchemy.nft.getNftMetadata(address, tokenId).then(function (response) {
                    const name = response.rawMetadata.name;
                    const image = response.rawMetadata.image;
                    const newObj = Object.assign({name: name, image: image}, mortgage[i]);
                    mortNFTs.push(newObj)
                    setMortNFTs(mortNFTs);
                    console.log(mortNFTs);
                }).catch(function (error) {
                    console.error(error);
                });
            }
        }
        for (var i = 0; i < mortgage.length; i ++) {
            getNFTs(mortgage[i].nft.nftContractAddr.toString(), mortgage[i].nft.tokenId.toString(), i)
        }
        console.log(mortgage.length);
    }, [account, mortgage])

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
                            <SellNFTCard nft={nft} key={index} price={nftPrice}/>
                        </Grid>
                    })
                    :
                    mortNFTs.map((nft, index) => {
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
