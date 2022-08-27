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
            <Box textAlign="center">
              <img width={"70px"} height={"70px"} src={nft.image_url} className="nftImg" />
            </Box>
          </Grid>
          <Grid item xs={5}>
            <Box textAlign="center">
              {nft.name}
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center">
              {nft.collection.slug}
            </Box>
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

