import React from 'react'
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import ListItem from '@mui/material/ListItem';

function NFTList({ nft }) {
  if (nft.asset_contract.schema_name == "ERC721" && nft.name != null) {
    return (
      <ListItem>
        <Grid container rowSpacing={0} columnSpacing={0}>
          <Grid item xs={3}>
            <img width={"70px"} height={"70px"} src={nft.image_url} className="nftImg" />
          </Grid>
          <Grid item xs={5}>
          {nft.name}
          </Grid>
          <Grid item xs={4}>
          {nft.collection.slug}
          </Grid>
        </Grid>
      </ListItem>
    )
  }
  else {
    return (null)
  }
}


export default NFTList;

