import Navbar from './NavBar';
import Banner from './Banner';
import MarketplacePage from './MarketPlacePage';

function Marketplace() {
  return (
    <div>
      <Navbar />
      <Banner type="Marketplace" />
      <MarketplacePage />
    </div>
  );
}

export default Marketplace;
