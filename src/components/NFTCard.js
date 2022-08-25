import React from 'react'
 
function NFTCard({nft}){
  if (nft.asset_contract.schema_name == "ERC721" && nft.name != null){
    return (
      <div>
        <img width={"100px"} height={"100px"} src={nft.image_url}/><br/>
        {nft.name}<br/>
        {nft.collection.slug}
      </div>
    )
  }
  else{
    return (null)
  }
}


export default NFTCard;
  
 