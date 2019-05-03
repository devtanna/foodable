import Header from './Header';
import Footer from './Footer';
import Search from './Search';
import PopularDeals from './PopularDeals';
import Listing from './Listing';

const Listings = () => (
  <div>
    <Header />
    <main>
      <div className="mainWrapper">
        <Search />
        <h1 className="sectionHeading">Top deals for today!</h1>
        <PopularDeals />
        <div className="listingsWrapper">
          <Listing />
          <Listing />
          <Listing />
        </div>
      </div>
    </main>
    <Footer />
    <style jsx>{`
      main {
        height: 100%;
        background-color: #FAFAFA;
        padding: 30px 0;
      }
      .sectionHeading {
        text-align: center;
        color: #3B3B3B;
        margin: 0;
        font-size: 24px;
        padding: 0;
      }
      .mainWrapper {
        max-width: 1200px;
        width: 100%;
        margin: 0 auto;
      }
    `}</style>
  </div>
);

export default Listings;
