import Header from './Header';
import Footer from './Footer';
import PopularDeals from './PopularDeals';
import Listing from './Listing';
import Pagination from '../Pagination';

const Listings = ({
  offers,
  randomOffers,
  location,
  page,
  cuisines,
  filters,
}) => {
  return (
    <div>
      <Header cuisines={cuisines} filters={filters} />
      <main>
        <div className="mainWrapper">
          <h1 className="sectionHeading">Popular deals for today!</h1>
          <PopularDeals deals={randomOffers} />
          <div className="listingsWrapper">
            {offers.map((offer, index) => (
              <Listing offer={offer} key={index} />
            ))}
          </div>
          <Pagination page={page} />
        </div>
      </main>
      <Footer />
      <style jsx>{`
        main {
          height: 100%;
          background-color: #fafafa;
        }
        .sectionHeading {
          color: #3b3b3b;
          margin: 0;
          padding: 15px 0 0 0;
          font-size: 18px;
        }
        .mainWrapper {
          padding: 0 10px;
          margin-bottom: 30px;
        }
        .listingsWrapper {
          margin-bottom: 30px;
        }
      `}</style>
    </div>
  );
};

export default Listings;
