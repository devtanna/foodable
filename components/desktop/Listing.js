import React, { useState } from 'react';
import { Icon, Responsive, Rating, Loader } from 'semantic-ui-react';
import { offerSources } from '../../helpers/constants';
import { trackEvent } from '../../helpers/utils';
import dynamic from 'next/dynamic';
const LazyImage = dynamic(() => import('../LazyImage'), {
  ssr: false,
  loading: () => (
    <div className="loaderWrapper">
      <Loader active inline="centered" size="small" />
    </div>
  ),
});

const Listing = ({ offer }) => {
  const mainOffer = offer.offers[0];
  const otherOffers = offer.offers.slice(1);
  const moreOffers = otherOffers.slice(2);
  const hasImg = mainOffer.image !== '';
  const imgSrc = hasImg ? mainOffer.image : '/static/placeholder.png';

  const [showMoreOffers, setShowMoreOffers] = useState(false);

  return (
    <div className="listing">
      <div className="listing__img">
        <LazyImage
          src={imgSrc}
          alt={mainOffer.title}
          width="200"
          height="200"
        />
      </div>
      <div className="listing__content">
        <ListingMeta offer={mainOffer} />
        <BestOffer offer={mainOffer} />
        <OtherOffers
          offers={otherOffers}
          isMoreOffersOpen={showMoreOffers}
          toggleMore={setShowMoreOffers}
        />
      </div>
      <MoreOffers offers={moreOffers} isOpen={showMoreOffers} />
      <style jsx>{`
        .listing {
          display: grid;
          grid-template-columns: 20% 80%;
          background: #fff;
          box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
        }
        .listing__content {
          display: grid;
          grid-template-columns: 1fr 0.9fr 0.8fr;
          min-height: 200px;
        }
        .listing__img {
          padding: 20px;
        }
      `}</style>
    </div>
  );
};

const ListingMeta = ({ offer }) => {
  const initialRating = offer.rating;

  return (
    <div className="listing__meta">
      <h2 className="meta__name">
        {offer.title}
        <small className="meta__cuisine">{offer.cuisine}</small>
      </h2>
      {initialRating && (
        <div className="meta__rating">
          <div className="rating__heading">Rating</div>
          <Rating
            size="large"
            icon="star"
            disabled
            defaultRating={Number(initialRating)}
            maxRating={5}
          />
        </div>
      )}
      <style jsx>{`
        .listing__meta {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 25px 0;
          border-right: 1px solid #e7e7e7;
        }
        .meta__name {
          margin: 0;
        }
        .meta__cuisine {
          color: #8f8f8f;
          display: block;
          font-weight: normal;
          font-size: 16px;
        }
        .meta__costForTwo {
          color: #d2d2d2;
          font-weight: bold;
          font-size: 14px;
        }
        .rating__heading {
          margin-bottom: 5px;
        }
      `}</style>
    </div>
  );
};

const BestOffer = ({ offer }) => {
  const track = () => {
    trackEvent('offer_click', 'main', offer.source, offer.title);
  };

  return (
    <a
      href={offer.href}
      target="_blank"
      onClick={track}
      rel="noopener"
      className={`bestOffer ${offer.source}`}>
      <div className="bestOffer__heading">
        <img src={offerSources[offer.source].logo} alt={offer.source} />
      </div>
      <div className="bestOffer__body">
        <div className="bestOffer__ribbon">Great Deal!</div>
        <h3 className="bestOffer__offer">{offer.offer}</h3>
      </div>
      <div className="bestOffer__footer">
        <div>
          Show this deal <Icon size="small" name="arrow right" />
        </div>
      </div>
      <style jsx>{`
        .bestOffer {
          display: grid;
          margin: 20px;
          grid-template-rows: 30px auto 30px;
          grid-row-gap: 0;
          border: 1px solid #ddd;
        }
        .bestOffer__heading {
          display: flex;
          align-items: center;
        }
        .bestOffer__heading img {
          height: 30px;
        }
        ${Object.entries(offerSources)
          .map(
            ([key, value], index) =>
              `
            .bestOffer.${key} .bestOffer__heading {
              background-color: ${value.color};
            }
          `
          )
          .join('')}
        .bestOffer__body {
          background: #fff8f3;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 0 10px;
        }
        .bestOffer__ribbon {
          background: url('/static/red-ribbon.svg') 0 0 no-repeat;
          width: 170px;
          height: 33px;
          color: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          text-transform: uppercase;
          font-weight: bold;
          margin-bottom: 10px;
          font-size: 12px;
        }
        .bestOffer__offer {
          margin: 0;
          font-size: 16px;
          text-align: center;
          color: #4d4d4d;
          text-transform: uppercase;
        }
        .bestOffer__footer {
          display: flex;
          justify-content: center;
          align-items: center;
          background: #fff8f3;
          color: #4d4d4d;
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          border-top: 1px solid #ddd;
        }
      `}</style>
    </a>
  );
};

const OtherOffers = ({ offers, isMoreOffersOpen, toggleMore }) => {
  if (offers.length === 0) return false;

  const hasMore = offers.length > 2;

  return (
    <div className="otherOffers">
      {offers.slice(0, 2).map((offer, index) => (
        <a
          href={offer.href}
          target="_blank"
          key={index}
          rel="noopener"
          onClick={() =>
            trackEvent('offer_click', 'others', offer.source, offer.title)
          }
          className={`otherOffer ${offer.source}`}>
          <div className="otherOffer__heading">
            <div>View Deal</div>
            <img src={offerSources[offer.source].logo} alt={offer.source} />
          </div>
          <div className="otherOffer__body">{offer.offer}</div>
        </a>
      ))}
      {hasMore && (
        <button
          onClick={() => {
            trackEvent('show_more', 'others');
            toggleMore(!isMoreOffersOpen);
          }}
          className="showMoreBtn">
          <div>Show more deals</div>
          <div>
            <Icon name="arrow alternate circle down outline" />
          </div>
        </button>
      )}
      <style jsx>{`
        .otherOffers {
          margin: 20px 20px 20px 0;
          display: grid;
          grid-template-rows: ${hasMore ? '3fr 3fr 1fr' : '1fr 1fr'};
          grid-row-gap: 10px;
        }
        .otherOffer {
          width: 100%;
          display: grid;
          grid-template-rows: 30px auto;
          color: #333;
        }
        .otherOffer__heading {
          font-size: 12px;
          color: #fff;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: space-around;
        }
        ${Object.entries(offerSources)
          .map(
            ([key, value], index) =>
              `
            .otherOffer.${key} {
              background-color: ${value.color};
            }
            .otherOffer.${key} .otherOffer__heading {
              background-color: ${value.color};
            }
          `
          )
          .join('')}
        .otherOffer__heading img {
          height: 25px;
        }
        .otherOffer__body {
          background: #fff;
          margin: 1px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 14px;
          text-transform: uppercase;
          font-weight: bold;
          text-align: center;
        }
        .showMoreBtn {
          background: linear-gradient(270deg, #3aca7c 16.26%, #88e0d0 98.03%);
          font-weight: bold;
          text-transform: uppercase;
          color: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 11px;
          border: 0;
          outline: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

const MoreOffers = ({ offers, isOpen }) => {
  if (offers.length === 0 || !isOpen) return false;

  return (
    <div className="moreOffers">
      <div />
      <div />
      <div className="otherOffers__listWrapper">
        <ul className="otherOffers__list">
          {offers.map((otherOffer, index) => (
            <li key={index}>
              <a
                className="otherOffer__offer"
                href={otherOffer.href}
                target="_blank">
                <span>{otherOffer.source}</span>
                <span>{otherOffer.offer}</span>
                <Icon name="angle right" />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <style jsx>{`
        .moreOffers {
          grid-column: 2;
          display: grid;
          grid-template-columns: 1fr 0.9fr 0.8fr;
        }
        .otherOffers__listWrapper {
          grid-column: 2 / span 3;
          border-left: 1px solid #eaeaea;
          margin: -1px;
        }
        .otherOffers__list {
          padding: 0;
          margin: 0;
          list-style: none;
          border-top: 1px solid #eaeaea;
        }
        .otherOffers__list li {
          border-bottom: 1px solid #ddd;
        }
        .otherOffers__list li a {
          padding: 20px;
        }
        .otherOffers__list li:hover {
          background-color: #f5f5f5;
        }
        .otherOffers__list li:last-child {
          border-bottom: none;
        }
        .otherOffer__offer {
          display: grid;
          grid-template-columns: 1fr 2fr auto;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default Listing;
