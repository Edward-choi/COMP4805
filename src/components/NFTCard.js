import React from 'react'
import {IpfsImage} from 'react-ipfs-image'
import {Alchemy} from "alchemy-sdk"

function NFTCard({nft}){

  if (nft.title != null && nft.rawMetadata.image != null){
    return (
      <div>
        {
          nft.rawMetadata.image.startsWith("https")
          ?
          <div>
            <img width={"100px"} height={"100px"} src={nft.rawMetadata.image} 
            onError={({currentTarget}) => {currentTarget.onerror = null; currentTarget.src ='https://upload.wikimedia.org/wikipedia/commons/2/24/NFT_Icon.png'}}/><br/>
            {nft.title}<br/>
          </div>
          :
          <div>
            {/* https://developers.cloudflare.com/web3/ipfs-gateway/reference/updating-for-ipfs/ <- speed depends on this free gateway*/} 
            <IpfsImage width={"100px"} height={"100px"} hash={nft.rawMetadata.image} gatewayUrl='https://cloudflare-ipfs.com/ipfs' 
            onError={({currentTarget}) => {currentTarget.onerror = null; currentTarget.src ='https://upload.wikimedia.org/wikipedia/commons/2/24/NFT_Icon.png'}}/><br/> 
            {nft.title}<br/>
          </div>
        }

      </div>
    )
  }
  else{
    return (null)
  }
}


export default NFTCard;
  
 