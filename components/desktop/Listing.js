import React, { useState } from 'react';
import { Icon, Rating, Loader, Transition } from 'semantic-ui-react';
import { offerSources } from '../../helpers/constants';
import { trackEvent, limitChars, showCurrency, showMins } from '../../helpers/utils';
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
        <LazyImage src={imgSrc} alt={mainOffer.title} width="200" height="200" />
      </div>
      <div className="listing__content">
        <ListingMeta offer={mainOffer} />
        <BestOffer offer={mainOffer} />
        <OtherOffers offers={otherOffers} isMoreOffersOpen={showMoreOffers} toggleMore={setShowMoreOffers} />
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
          min-height: 220px;
        }
        .listing__img {
          padding: 20px;
        }
      `}</style>
    </div>
  );
};

const ListingMeta = ({ offer }) => {
  const { title, rating, cuisine } = offer;

  return (
    <div className="listing__meta">
      <h2 className="meta__name">
        {title}
        <small className="meta__cuisine truncate">{cuisine}</small>
      </h2>
      {rating && (
        <div className="meta__rating">
          <div className="rating__heading">Rating</div>
          <Rating size="large" icon="star" disabled defaultRating={Number(rating)} maxRating={5} />
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
        .rating__heading {
          margin-bottom: 5px;
        }
        .truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 250px;
        }
      `}</style>
    </div>
  );
};

const BestOffer = ({ offer }) => {
  const track = () => {
    trackEvent('offer_click', 'main', offer.source, offer.title);
  };

  const deliveryInfoAnimation = 'slide up';
  const animationDuration = 500;

  const [deliveryInfoVisible, setDeliveryInfoVisible] = useState(false);

  const { href, source, offer: _offer, minimumOrder, deliveryCharge, deliveryTime } = offer;

  const hasDeliveryInfo = minimumOrder || deliveryCharge || deliveryTime;

  return (
    <a
      href={href}
      target="_blank"
      onClick={track}
      rel="noopener"
      onMouseEnter={() => setDeliveryInfoVisible(true)}
      onMouseLeave={() => setDeliveryInfoVisible(false)}
      className={`bestOffer ${source}`}>
      <div className="bestOffer__heading">
        <img src={offerSources[source].logo} alt={source} />
      </div>
      <div className="bestOffer__body">
        <div className="bestOffer__main">
          <div className="bestOffer__ribbon">Great Deal</div>
          <h3 className="bestOffer__offer">{limitChars(_offer)}</h3>
        </div>
        {hasDeliveryInfo && (
          <Transition.Group animation={deliveryInfoAnimation} duration={animationDuration}>
            {deliveryInfoVisible && (
              <div className="deliveryInfo__wrapper">
                {minimumOrder && (
                  <div className="deliveryInfo__item">
                    <span className="deliveryInfo__value">
                      {minimumOrder} {showCurrency(minimumOrder) && <small>aed</small>}
                    </span>
                    <span className="deliveryInfo__desc">min order</span>
                  </div>
                )}
                {deliveryCharge && (
                  <div className="deliveryInfo__item">
                    <span className="deliveryInfo__value">
                      {deliveryCharge} {showCurrency(deliveryCharge) && <small>aed</small>}
                    </span>
                    <span className="deliveryInfo__desc">delivery fee</span>
                  </div>
                )}
                {deliveryTime && (
                  <div className="deliveryInfo__item">
                    <span className="deliveryInfo__value">
                      {deliveryTime} {showMins(deliveryTime) && <small>mins</small>}
                    </span>
                    <span className="deliveryInfo__desc">time est.</span>
                  </div>
                )}
              </div>
            )}
          </Transition.Group>
        )}
      </div>
      <div className="bestOffer__footer">
        <div>
          Place Order <Icon size="small" name="arrow right" />
        </div>
      </div>
      <style jsx>{`
        :global(.slide.up.visible, .slide.down.visible) {
          display: flex !important;
        }
        .bestOffer {
          display: grid;
          margin: 15px;
          grid-template-rows: 30px auto 30px;
          grid-row-gap: 0;
          border: 1px solid #ddd;
          background: #fff8f3;
          position: relative;
        }
        .bestOffer:hover {
          background: #fff4ed;
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
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
        }
        .bestOffer__main {
          width: 100%;
          height: 100%;
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
          color: #333;
          text-transform: uppercase;
        }
        .bestOffer__footer {
          display: flex;
          justify-content: center;
          align-items: center;
          color: #4d4d4d;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          border-top: 1px solid #ddd;
        }
        .deliveryInfo__wrapper {
          border-top: 1px solid #ddd;
          display: none;
          width: 100%;
          justify-content: space-around;
          padding: 5px 0;
          position: absolute;
          bottom: 0;
          left: 0;
          background: #fff4ed;
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
      `}</style>
    </a>
  );
};

const OtherOffers = ({ offers, isMoreOffersOpen, toggleMore }) => {
  if (offers.length === 0) return false;

  const hasMore = offers.length > 2;

  const deliveryInfoAnimation = 'slide down';
  const animationDuration = 500;

  return (
    <div className="otherOffers">
      {offers.slice(0, 2).map((offer, index) => {
        const { minimumOrder, deliveryCharge, deliveryTime, href, source, offer: _offer, title } = offer;
        const hasDeliveryInfo = minimumOrder || deliveryCharge || deliveryTime;
        const [deliveryInfoVisible, setDeliveryInfoVisible] = useState(false);
        return (
          <a
            href={href}
            target="_blank"
            key={index}
            rel="noopener"
            onMouseEnter={() => setDeliveryInfoVisible(true)}
            onMouseLeave={() => setDeliveryInfoVisible(false)}
            onClick={() => trackEvent('offer_click', 'others', source, title)}
            className={`otherOffer ${source}`}>
            <div className="otherOffer__heading">
              <div>View Deal</div>
              <img src={offerSources[source].logo} alt={source} />
            </div>
            <div className="otherOffer__body">
              <div className="otherOffer__value">{limitChars(_offer)}</div>
              {hasDeliveryInfo && (
                <Transition.Group animation={deliveryInfoAnimation} duration={animationDuration}>
                  {deliveryInfoVisible && (
                    <div className="deliveryInfo__wrapper">
                      {minimumOrder && (
                        <div className="deliveryInfo__item">
                          <span className="deliveryInfo__value">
                            {minimumOrder} {showCurrency(minimumOrder) && <small>aed</small>}
                          </span>
                          <span className="deliveryInfo__desc">min order</span>
                        </div>
                      )}
                      {deliveryCharge && (
                        <div className="deliveryInfo__item">
                          <span className="deliveryInfo__value">
                            {deliveryCharge} {showCurrency(deliveryCharge) && <small>aed</small>}
                          </span>
                          <span className="deliveryInfo__desc">delivery fee</span>
                        </div>
                      )}
                      {deliveryTime && (
                        <div className="deliveryInfo__item">
                          <span className="deliveryInfo__value">
                            {deliveryTime} {showMins(deliveryTime) && <small>mins</small>}
                          </span>
                          <span className="deliveryInfo__desc">time est.</span>
                        </div>
                      )}
                    </div>
                  )}
                </Transition.Group>
              )}
            </div>
          </a>
        );
      })}
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
          margin: 15px 15px 15px 0;
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
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }
        .otherOffer__value {
          font-size: 14px;
          padding: 0 10px;
          text-transform: uppercase;
          font-weight: bold;
          display: flex;
          height: 100%;
          min-height: 30px;
          justify-content: center;
          align-items: center;
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
        .deliveryInfo__wrapper {
          display: none;
          justify-content: space-around;
          align-items: center;
          position: absolute;
          bottom: 0;
          left: 0;
          background: #fff;
          width: 100%;
          height: 100%;
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
              <a className="otherOffer__offer" href={otherOffer.href} target="_blank">
                <span>{otherOffer.source}</span>
                <span>{limitChars(otherOffer.offer)}</span>
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
