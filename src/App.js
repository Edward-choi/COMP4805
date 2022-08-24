import './style.css';
import React, {useState} from "react";
import Borrow from './components/Borrow';
import Deposit from './components/Deposit';
import DashBoard from './components/Dashboard';
import ViewNFT from './components/ViewNFT.js'
import Home from './components/Home';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import { DAppProvider, Mainnet } from '@usedapp/core';
import {getDefaultProvider} from 'ethers'

function App() {

  const config = {
    networks: [Mainnet],
    readOnlyChainId: Mainnet.chainId,
    readOnlyUrls:{
      [Mainnet.chainId]: getDefaultProvider('mainnet') //https://mainnet.infura.io/v3/04dd4e7b623849fe98bbd0f990ae105f 
    }                                                  // ^ This is an API for connection to the blockchain, use this when getDefaultProvider dont work
  }

  return (
    <DAppProvider config={config}>
      <div>
        <Routes>
          <Route path="/borrow" element={<Borrow />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/ViewNFT" element={<ViewNFT />} />
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/" element={<Home/>} />
        </Routes>
      </div>
    </DAppProvider>
  );
}

export default App;
