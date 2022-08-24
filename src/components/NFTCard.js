 import React from 'react'
 
 function NFTCard({nft}){
    return (
      <div>
        {
        nft.blockchain === "ETHEREUM"
        ?
            nft.meta
            ?
            nft.meta.name
            :
            null
        :
        null
        }
      </div>
    )
}

export default NFTCard;
  
 