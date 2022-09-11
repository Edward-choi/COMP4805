import React from 'react'
import {IpfsImage} from 'react-ipfs-image'
 
function NFTCard({nft}){
  if (nft.title != null){
    return (
      <div>
        {
          nft.rawMetadata.image.startsWith("https")
          ?
          <div>
            <img width={"100px"} height={"100px"} src={nft.rawMetadata.image}/><br/>
            {nft.title}<br/>
          </div>
          :
          <div>
            {/* https://developers.cloudflare.com/web3/ipfs-gateway/reference/updating-for-ipfs/ <- speed depends on this free gateway*/} 
            <IpfsImage width={"100px"} height={"100px"} hash={nft.rawMetadata.image} gatewayUrl='https://cloudflare-ipfs.com/ipfs'/><br/> 
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
  
 