import React from 'react'
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import ListItem from '@mui/material/ListItem';
import {IpfsImage} from 'react-ipfs-image';

function NFTList({ nft }) {
  if (nft.title != null) {
    return (
      <ListItem>
        {
          nft.rawMetadata.image.startsWith("https")
          ?
          <Grid container rowSpacing={0} columnSpacing={0}>     
          <Grid item xs={3}>
            <Box textAlign="center">
              <img width={"70px"} height={"70px"} src={nft.rawMetadata.image} className="nftImg" />
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box textAlign="center">
              {nft.title}
            </Box>
          </Grid>
        </Grid>
        :
        <Grid container rowSpacing={0} columnSpacing={0}>     
        <Grid item xs={3}>
          <Box textAlign="center">
            <IpfsImage width={"70px"} height={"70px"} hash={nft.rawMetadata.image} gatewayUrl='https://cloudflare-ipfs.com/ipfs' className="nftImg" />
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box textAlign="center">
            {nft.title}
          </Box>
        </Grid>
      </Grid>
      }
      </ListItem>
    )
  }
  else {
    return (null)
  }
}


export default NFTList;

