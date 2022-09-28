import './style.css';
import React, {useState} from "react";
import Marketplace from './components/Marketplace';
import Deposit from './components/Deposit';
import Withdraw from './components/Withdraw';
import ViewNFT from './components/ViewNFT'
import Home from './components/Home';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import { DAppProvider, Goerli, Mainnet } from '@usedapp/core';
import {getDefaultProvider} from 'ethers'

function App() {

  const config = {
    readOnlyUrls:{
      [Mainnet.chainId]: getDefaultProvider('mainnet'),
      [Goerli.chainId]: getDefaultProvider('goerli') //https://mainnet.infura.io/v3/04dd4e7b623849fe98bbd0f990ae105f 
    }                                                  // ^ This is an API for connection to the blockchain, use this when getDefaultProvider dont work
  }

  return (
    <DAppProvider config={config}>
      <div>
        <Routes>
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/ViewNFT" element={<ViewNFT />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/" element={<Home/>} />
        </Routes>
      </div>
    </DAppProvider>
  );
}

export default App;
