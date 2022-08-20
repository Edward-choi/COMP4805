import './style.css';
import React, {useState} from "react";
import Borrow from './components/Borrow';
import Deposit from './components/Deposit';
import DashBoard from './components/Dashboard';
import Home from './components/Home';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import { ethers } from "ethers";
import Web3 from "web3";

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [displayWalletAddress, setdisplayWalletAddress] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);

  async function handleConnect(){
    const web3 = new Web3(Web3.givenProvider);
    const accounts = await web3.eth.requestAccounts();
    setWalletAddress(accounts[0]);
    setdisplayWalletAddress(accounts[0].substring(0,11) + "..." + accounts[0].substring(34,43));
    const balance = await web3.eth.getBalance(accounts[0]);
    setWalletBalance(parseFloat(ethers.utils.formatEther(balance)).toFixed(4));
}

  return (
    <div>
      <Routes>
        <Route path="/borrow" element={<Borrow />} />
        <Route path="/deposit" element={<Deposit />} />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/" element={<Home 
        handleConnect={handleConnect} 
        walletAddress={walletAddress} 
        displayWalletAddress={displayWalletAddress} 
        walletBalance={walletBalance}/>} />
      </Routes>
    </div>
  );
}

export default App;
