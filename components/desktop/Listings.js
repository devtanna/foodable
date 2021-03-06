import React, { Fragment } from 'react';
import Header from './Header';
import Footer from './Footer';
import Search from '../Search';
import Listing from './Listing';
import Pagination from '../Pagination';
import NoResults from '../NoResults';
import Collections from './Collections';
import { removeObjEmpty } from '../../helpers/utils';
import { PAGE_SIZE } from '../../helpers/constants';
import _isEmpty from 'lodash/isEmpty';

const Listings = ({ offers, randomOffers, location, page, cuisines, filters }) => {
  let isSearchPage = !_isEmpty(removeObjEmpty(filters));
  let hasOffers = offers.length > 0;

  return (
    <div className="wrapper">
      <Header location={location} />
      <main>
        <div className="mainWrapper">
          <Collections cuisines={cuisines} filters={filters} />
          <Search cuisines={cuisines} filters={filters} />
          {hasOffers ? (
            <Fragment>
              <div className="listingsWrapper">
                {offers.map((offer, index) => (
                  <Listing offer={offer} key={index} />
                ))}
              </div>
              <Pagination listingsCount={offers.length} filters={filters} page={page} pageSize={PAGE_SIZE.desktop} />
            </Fragment>
          ) : (
            <NoResults isSearch={isSearchPage} />
          )}
        </div>
      </main>
      <Footer location={location} />
      <style jsx>{`
        .wrapper {
          height: 100%;
          display: grid;
          grid-template-rows: auto 1fr auto;
        }
        main {
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
