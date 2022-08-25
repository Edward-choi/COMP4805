 import React from 'react'
 
function NFTCard({nft}){
  if (nft.asset_contract.schema_name == "ERC721" && nft.name != null){
    return (
      <div>
        <img width={"100px"} height={"100px"} src={nft.image_url}/>
        {nft.name}
      </div>
    )
  }
  else{
    return (null)
  }
}

// function NFTCard({nft}){
//   if (nft.blockchain == "ETHEREUM" && nft.meta != null && nft.meta.name != null && nft.meta.content[0].url != null){
//     return (
//       <div>
//         <img width={"100px"} height={"100px"} src={nft.meta.content[0].url}/>
//         {nft.meta.name}
//       </div>
//     )
//   }
//   else{
//     return (null)
//   }
// }

export default NFTCard;
  
 