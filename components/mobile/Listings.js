import React, { Fragment } from 'react';
import Header from './Header';
import Footer from './Footer';
import PopularDeals from './PopularDeals';
import Listing from './Listing';
import Pagination from '../Pagination';
import NoResults from '../NoResults';
import { removeObjEmpty } from '../../helpers/utils';
import _isEmpty from 'lodash/isEmpty';

const Listings = ({
  offers,
  randomOffers,
  location,
  page,
  cuisines,
  filters,
}) => {
  let isSearchPage = !_isEmpty(removeObjEmpty(filters));
  let hasOffers = offers.length > 0;

  return (
    <div>
      <Header cuisines={cuisines} filters={filters} />
      <main>
        <div className="mainWrapper">
          {!isSearchPage && (
            <Fragment>
              <h1 className="sectionHeading">Popular deals for today!</h1>
              <PopularDeals deals={randomOffers} />
            </Fragment>
          )}
          {hasOffers ? (
            <Fragment>
              <div className="listingsWrapper">
                {offers.map((offer, index) => (
                  <Listing offer={offer} key={index} />
                ))}
              </div>
              <Pagination filters={filters} page={page} />
            </Fragment>
          ) : (
            <NoResults />
          )}
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
          margin-top: 15px;
          margin-bottom: 30px;
        }
      `}</style>
    </div>
  );
};

export default Listings;
