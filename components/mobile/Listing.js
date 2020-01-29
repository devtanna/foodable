import React, { useState } from 'react';
import { Icon, Rating, Loader } from 'semantic-ui-react';
import { offerSources } from '../../helpers/constants';
import FavoriteBtn from '../FavoriteBtn';
import { trackEvent, limitChars, showCurrency, showMins, toStartCase } from '../../helpers/utils';
import qs from 'qs';
import dynamic from 'next/dynamic';
const LazyImage = dynamic(() => import('../LazyImage'), {
  ssr: false,
  loading: () => (
    <div className="loaderWrapper">
      <Loader active inline="centered" size="small" />
    </div>
  ),
});
const hasNavigator = typeof navigator !== 'undefined' && navigator.share !== undefined;

const getShareLink = keyword => {
  const query = {};
  query.keywords = keyword;

  const url = new URL(window.location.href);
  url.search = qs.stringify(query);

  return url;
};

const Listing = ({ offer, onFavRemove = null, disableLazyLoad = false }) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showOtherOffers, setShowOtherOffers] = useState(false);

  const mainOffer = offer.offers[0];
  const otherOffers = offer.offers.slice(1);
  const hasImg = mainOffer.image !== '';
  const imgSrc = hasImg ? mainOffer.image : '/static/placeholder.png';

  const initialRating = mainOffer.rating;
  const _rating = Number(initialRating) || 0;

  const hasOtherOffers = otherOffers.length > 0;

  const { minimumOrder, deliveryCharge, deliveryTime } = mainOffer;
  const hasDeliveryInfo = minimumOrder || deliveryCharge || deliveryTime;

  const handleShare = async () => {
    const shareLink = getShareLink(mainOffer.title);

    try {
      await navigator.share({
        text: `${mainOffer.title}: ${mainOffer.offer} on ${mainOffer.source}.`,
        url: shareLink,
      });

      trackEvent('copy_link', 'generic', mainOffer.source, mainOffer.title);
    } catch (error) {
      console.log('Error sharing', error);
    }
  };

  const handleAccordion = () => {
    trackEvent('show_more', 'others', mainOffer.title);
    setShowOtherOffers(!showOtherOffers);
  };

  return (
    <div className="listing">
      <div className="listing__meta">
        <div className="listing__img">
          {disableLazyLoad ? (
            <img alt={mainOffer.title} src={imgSrc} width="75" height="75" />
          ) : (
            <LazyImage src={imgSrc} alt={mainOffer.title} width="100%" height="100%" />
          )}
        </div>
        <div className="listing__content">
          <div>
            <div className="meta__name">
              {toStartCase(mainOffer.title)}
              <small className="meta__cuisine truncate">{mainOffer.cuisine}</small>
            </div>
            {initialRating && (
              <div className="meta__rating">
                <Rating size="small" icon="star" disabled defaultRating={_rating} maxRating={5} />
                <span className="rating__number">({_rating})</span>
              </div>
            )}
          </div>
          <FavoriteBtn id={offer._id} onFavRemove={onFavRemove} slug={mainOffer.locationSlug} />
        </div>
      </div>
      <div className="bestOffer">
        <div className="bestOffer__heading">
          <small>Great Deal</small>
          <span>{mainOffer.source}</span>
        </div>
        <div className="bestOffer__offer">{limitChars(mainOffer.offer)}</div>
        <a onClick={handleShare}>
          <Icon name="share square" color="teal" size="small" />
        </a>
      </div>
      {hasDeliveryInfo && (
        <div className="deliveryInfo__wrapper">
          {minimumOrder && (
            <div className="deliveryInfo__item">
              <span className="deliveryInfo__desc">min order</span>
              <span className="deliveryInfo__value">
                {minimumOrder} {showCurrency(minimumOrder) && <small>aed</small>}
              </span>
            </div>
          )}
          {deliveryCharge && (
            <div className="deliveryInfo__item">
              <span className="deliveryInfo__desc">delivery fee</span>
              <span className="deliveryInfo__value">
                {deliveryCharge} {showCurrency(deliveryCharge) && <small>aed</small>}
              </span>
            </div>
          )}
          {deliveryTime && (
            <div className="deliveryInfo__item">
              <span className="deliveryInfo__desc">time est.</span>
              <span className="deliveryInfo__value">
                {deliveryTime} {showMins(deliveryTime) && <small>mins</small>}
              </span>
            </div>
          )}
        </div>
      )}
      <div className="actionBtns">
        {hasOtherOffers && (
          <button onClick={handleAccordion} className="actionBtns__moreDeals">
            More Deals
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
                <span>{limitChars(otherOffer.offer)}</span>
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
        .listing__img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .listing__content {
          padding: 5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
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
        .rating__number {
          vertical-align: top;
          font-size: 14px;
          color: #666;
          font-weight: bold;
          text-transform: uppercase;
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
          flex: 1;
        }
        .deliveryInfo__wrapper {
          display: flex;
          width: 100%;
          padding: 5px 10px 10px;
        }
        .deliveryInfo__item {
          line-height: 1em;
          margin-right: 30px;
        }
        .deliveryInfo__value {
          font-size: 13px;
          color: #333;
        }
        .deliveryInfo__desc {
          display: block;
          font-size: 10px;
          text-transform: capitalize;
          color: #999;
          font-weight: bold;
        }
        .actionBtns {
          display: grid;
          grid-template-columns: ${hasOtherOffers ? '100px auto' : '1fr'};
          grid-column-gap: 10px;
          padding: 10px;
          border-top: 1px solid #eaeaea;
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
          font-size: 13px;
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
          max-width: 220px;
        }
      `}</style>
    </div>
  );
};

export default Listing;
