import React, { Fragment } from 'react';
import Header from './Header';
import Footer from './Footer';
import Search from '../Search';
import Listing from './Listing';
import Pagination from '../Pagination';
import NoResults from '../NoResults';
import { removeObjEmpty } from '../../helpers/utils';
import _isEmpty from 'lodash/isEmpty';

const Listings = ({ offers, randomOffers, location, page, cuisines, filters }) => {
  let isSearchPage = !_isEmpty(removeObjEmpty(filters));
  let hasOffers = offers.length > 0;

  return (
    <div>
      <Header location={location} />
      <main>
        <div className="mainWrapper">
          <Search cuisines={cuisines} filters={filters} />
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
            <NoResults isSearch={isSearchPage} />
          )}
        </div>
      </main>
      <Footer />
      <style jsx>{`
        main {
          height: 100%;
          background-color: #fafafa;
          padding: 30px 15px;
        }
        .mainWrapper {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
};

export default Listings;
