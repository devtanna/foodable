import React, { Fragment } from 'react';
import Header from './Header';
import Footer from './Footer';
import Listing from './Listing';
import Pagination from '../Pagination';
import NoResults from '../NoResults';
import Collections from './Collections';
import { removeObjEmpty, deslugify, capitalizeFirstLetter } from '../../helpers/utils';
import _isEmpty from 'lodash/isEmpty';

const Listings = ({ offers, randomOffers, location, page, cuisines, filters }) => {
  const isSearchPage = !_isEmpty(removeObjEmpty(filters));
  const hasOffers = offers.length > 0;

  const defaultSearchPageHeading = `Food deals near <span>${location.text}</span>`;

  const cuisinePageHeading =
    filters.cuisine.length > 0
      ? filters.cuisine.map(x => `<span>${capitalizeFirstLetter(deslugify(x))}</span>`).join(' and ') +
        ` food deals near <span>${location.text}</span>`
      : '';

  const keywordsPageHeading =
    filters.keywords !== ''
      ? `Food deals near <span>${location.text}</span> matching <span>"${filters.keywords}"</span>`
      : '';

  const searchPageHeading = {
    __html: cuisinePageHeading || keywordsPageHeading || defaultSearchPageHeading,
  };

  return (
    <div>
      <Header cuisines={cuisines} filters={filters} />
      <main>
        <div className="mainWrapper">
          {hasOffers ? (
            <Fragment>
              {!isSearchPage && <Collections cuisines={cuisines} />}
              <h1 className="mlSectionHeading" dangerouslySetInnerHTML={searchPageHeading} />
              <div className="listingsWrapper">
                {offers.map((offer, index) => (
                  <Listing offer={offer} key={index} />
                ))}
              </div>
              <Pagination listingsCount={offers.length} filters={filters} page={page} />
            </Fragment>
          ) : (
            <NoResults isSearch={isSearchPage} />
          )}
        </div>
      </main>
      <Footer location={location} />
      <style jsx>{`
        main {
          height: 100%;
          background-color: #fafafa;
        }
        .mlSectionHeading {
          color: #3b3b3b;
          margin: 0;
          padding: 15px 0 0 0;
          font-size: 16px;
          font-weight: normal;
        }
        :global(.mlSectionHeading span) {
          font-weight: bold;
        }
        .mainWrapper {
          padding: 0 5px 30px;
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
