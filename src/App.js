import './style.css';
import Borrow from './components/Borrow';
import Deposit from './components/Deposit';
import DashBoard from './components/Dashboard';
import Home from './components/Home';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/borrow" element={<Borrow />} />
        <Route path="/deposit" element={<Deposit />} />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/" element={<Home />}/>
      </Routes>
    </div>
  );
}

export default App;
