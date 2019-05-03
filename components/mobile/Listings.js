import Header from './Header';
import Footer from './Footer';
import PopularDeals from './PopularDeals';
import Listing from './Listing';

const Listings = () => (
  <div>
    <Header />
    <main>
      <div className="mainWrapper">
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
      }
      .sectionHeading {
        color: #3B3B3B;
        margin: 0;
        padding: 15px 0 0 0;
        font-size: 18px;
      }
      .mainWrapper {
        padding: 0 10px;
      }
      .listingsWrapper {
        margin-bottom: 30px;
      }
    `}</style>
  </div>
);

export default Listings;
