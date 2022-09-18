import React from 'react'
import {IpfsImage} from 'react-ipfs-image'
import {Alchemy} from "alchemy-sdk"
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

function NFTCard({nft}){
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    marginBottom: 10,
    color: theme.palette.text.secondary,
    borderRadius: 40
}));

  if (nft.title != null && nft.rawMetadata.image != null){
    return (
      <div>
        {
          nft.rawMetadata.image.startsWith("https")
          ?
          <Item borderRadius='40'>
            <img src={nft.rawMetadata.image} className="NFTImg"
            onError={({currentTarget}) => {currentTarget.onerror = null; currentTarget.src ='https://upload.wikimedia.org/wikipedia/commons/2/24/NFT_Icon.png'}}/>
            {nft.title}<br/>
          </Item>
          :
          <Item borderRadius='40'>
            {/* https://developers.cloudflare.com/web3/ipfs-gateway/reference/updating-for-ipfs/ <- speed depends on this free gateway*/} 
            <IpfsImage hash={nft.rawMetadata.image} gatewayUrl='https://cloudflare-ipfs.com/ipfs' className="NFTImg"
            onError={({currentTarget}) => {currentTarget.onerror = null; currentTarget.src ='https://upload.wikimedia.org/wikipedia/commons/2/24/NFT_Icon.png'}}/>
            {nft.title}<br/>
          </Item>
        }

      </div>
    )
  }
  else{
    return (null)
  }
}


export default NFTCard;
  
 