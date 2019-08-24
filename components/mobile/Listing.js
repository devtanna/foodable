import React, { useState } from 'react';
import { Icon, Rating, Loader } from 'semantic-ui-react';
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
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showOtherOffers, setShowOtherOffers] = useState(false);

  const handleAccordion = () => {
    trackEvent('show_more', 'others');
    setShowOtherOffers(!showOtherOffers);
  };

  const mainOffer = offer.offers[0];
  const otherOffers = offer.offers.slice(1);
  const hasImg = mainOffer.image !== '';
  const imgSrc = hasImg ? mainOffer.image : '/static/placeholder.png';

  const initialRating = mainOffer.rating;

  const hasOtherOffers = otherOffers.length > 0;

  const { minimumOrder, deliveryCharge, deliveryTime } = mainOffer;
  const hasDeliveryInfo = minimumOrder || deliveryCharge || deliveryTime;

  return (
    <div className="listing">
      <div className="listing__meta">
        <div className="listing__img">
          <LazyImage src={imgSrc} alt={mainOffer.title} width="75px" height="75px" />
        </div>
        <div>
          <div className="meta__name">
            {mainOffer.title}
            <small className="meta__cuisine truncate">{mainOffer.cuisine}</small>
          </div>
          {initialRating && (
            <div className="meta__rating">
              <Rating size="small" icon="star" disabled defaultRating={Number(initialRating)} maxRating={5} />
            </div>
          )}
        </div>
      </div>
      <div className="bestOffer">
        <div className="bestOffer__heading">
          <small>Best Deal</small>
          <span>{mainOffer.source}</span>
        </div>
        <div className="bestOffer__offer">{mainOffer.offer}</div>
      </div>
      {hasDeliveryInfo && (
        <div className="deliveryInfo__wrapper">
          {minimumOrder && (
            <div className="deliveryInfo__item">
              <span className="deliveryInfo__value">
                {minimumOrder} <small>aed</small>
              </span>
              <span className="deliveryInfo__desc">min order</span>
            </div>
          )}
          {deliveryCharge && (
            <div className="deliveryInfo__item">
              <span className="deliveryInfo__value">
                {deliveryCharge} <small>aed</small>
              </span>
              <span className="deliveryInfo__desc">delivery fee</span>
            </div>
          )}
          {deliveryTime && (
            <div className="deliveryInfo__item">
              <span className="deliveryInfo__value">
                {deliveryTime} <small>mins</small>
              </span>
              <span className="deliveryInfo__desc">time est.</span>
            </div>
          )}
        </div>
      )}
      <div className="actionBtns">
        {hasOtherOffers && (
          <button onClick={handleAccordion} className="actionBtns__moreDeals">
            View All Deals
          </button>
        )}
        <a
          href={mainOffer.href}
          target="_blank"
          rel="noopener"
          onClick={() => trackEvent('offer_click', 'main', mainOffer.source, mainOffer.title)}
          className="actionBtns__cta">
          <div>Place Order</div>
          <div>
            <Icon size="small" name="arrow right" />
          </div>
        </a>
      </div>
      {showOtherOffers && (
        <ul className="otherOffers__list">
          {otherOffers.map((otherOffer, index) => (
            <li key={index}>
              <a
                className="otherOffer__offer"
                href={otherOffer.href}
                rel="noopener"
                onClick={() => trackEvent('offer_click', 'others', otherOffer.source, otherOffer.title)}
                target="_blank">
                <span>{otherOffer.source}</span>
                <span>{otherOffer.offer}</span>
                <Icon name="angle right" />
              </a>
            </li>
          ))}
        </ul>
      )}
      <style jsx>{`
        .listing {
          background: #fff;
          box-shadow: 0 1px 4px rgba(41, 51, 57, 0.3);
          margin-bottom: 15px;
        }
        .listing__meta {
          display: grid;
          grid-template-columns: 75px auto;
          align-items: center;
          border-bottom: 1px solid #eaeaea;
        }
        .listing__img {
          width: 75px;
          height: 75px;
          padding: 10px;
        }
        .meta__name {
          font-weight: bold;
          font-size: 16px;
        }
        .meta__cuisine {
          color: #8f8f8f;
          display: block;
          font-weight: normal;
          font-size: 13px;
        }
        .bestOffer {
          padding: 10px;
          display: flex;
          align-items: center;
        }
        .bestOffer__heading {
          font-size: 13x;
          font-weight: bold;
          color: rgba(0, 0, 0, 0.7);
          text-transform: capitalize;
          line-height: 1.2em;
          min-width: 70px;
        }
        .bestOffer__heading small {
          display: block;
          line-height: 1em;
          font-size: 10px;
          color: #4fbf74;
          font-weight: 700;
        }
        .bestOffer__offer {
          color: #333;
          font-size: 16px;
          font-weight: bold;
          margin-left: 15px;
        }
        .deliveryInfo__wrapper {
          display: flex;
          width: 100%;
          justify-content: space-around;
          padding: 10px 10px 0;
          border-top: 1px solid #eaeaea;
        }
        .deliveryInfo__item {
          line-height: 0.8em;
          text-align: center;
        }
        .deliveryInfo__value {
          font-size: 13px;
          color: #333;
        }
        .deliveryInfo__desc {
          display: block;
          font-size: 10px;
          color: #daa7a7;
          text-transform: capitalize;
          font-weight: bold;
        }
        .actionBtns {
          display: grid;
          grid-template-columns: ${hasOtherOffers ? '100px auto' : '1fr'};
          grid-column-gap: 10px;
          padding: 10px;
        }
        .actionBtns__cta {
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(270deg, #f34343 18.23%, #fd7650 100%);
          color: #fff;
          font-size: 13px;
          font-weight: bold;
          height: 35px;
          border-radius: 2px;
        }
        .actionBtns__moreDeals {
          color: rgba(24, 44, 55, 0.6);
          border: 1px solid rgba(14, 23, 28, 0.3);
          border-radius: 2px;
          background: none;
          outline: none;
          font-size: 12px;
          height: 35px;
          text-align: center;
          border-radius: 2px !important;
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
          padding: 10px 20px;
        }
        .otherOffers__list li:last-child {
          border-bottom: none;
        }
        .otherOffer__offer {
          display: grid;
          grid-template-columns: 1fr 2fr auto;
          color: #666;
          text-transform: capitalize;
        }
        .truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
      `}</style>
    </div>
  );
};

export default Listing;
