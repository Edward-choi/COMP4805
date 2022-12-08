import './style.css';
import React from "react";
import Marketplace from './components/MarketPlace';
import Deposit from './components/Deposit';
import Withdraw from './components/Withdraw';
import ViewNFT from './components/ViewNFT'
import Home from './components/Home';
import History from './components/History';
import { Route, Routes } from 'react-router-dom';
import { DAppProvider, Goerli } from '@usedapp/core';
// import {getDefaultProvider} from 'ethers'

function App() {

  const config = {
    readOnlyUrls:{
      // [Mainnet.chainId]: getDefaultProvider('mainnet'), //https://mainnet.infura.io/v3/88f59cb90a7a448184ed6df591e4f1cb
      // [Goerli.chainId]: getDefaultProvider('goerli')   // ^ This is an API for connection to the blockchain, use this when getDefaultProvider dont work
      [Goerli.chainId]: 'https://goerli.infura.io/v3/88f59cb90a7a448184ed6df591e4f1cb'
    }                                                  
  }

  return (
    <DAppProvider config={config}>
      <div>
        <Routes>
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/viewnft" element={<ViewNFT />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/history" element={<History />} />
          <Route path="/" element={<Home/>} />
        </Routes>
      </div>
    </DAppProvider>
  );
}

export default App;
