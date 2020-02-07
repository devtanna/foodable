import React, { useState, useEffect, Fragment } from 'react';
import { offerSources } from '../../helpers/constants';
import { Icon, Rating, Loader } from 'semantic-ui-react';
import FavoriteBtn from '../FavoriteBtn';
import { trackEvent, limitChars, showCurrency, showMins, toStartCase, slugify } from '../../helpers/utils';
import copy from 'copy-to-clipboard';
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

const Listing = ({ offer, onFavRemove, disableLazyLoad = false }) => {
  const restId = offer._id;
  const mainOffer = offer.offers[0];
  const otherOffer = offer.offers.length > 1 ? offer.offers[1] : null;
  const moreOffers = offer.offers.length > 2 ? offer.offers.slice(2) : [];
  const hasMoreOffers = moreOffers.length > 0;
  const hasImg = mainOffer.image !== '';
  const imgSrc = hasImg ? mainOffer.image : '/static/placeholder.png';
  const [showMoreOffers, setShowMoreOffers] = useState(false);

  return (
    <div className="listing">
      <div className="listing__img">
        {disableLazyLoad ? (
          <img alt={mainOffer.title} src={imgSrc} width="120" height="120" />
        ) : (
          <LazyImage src={imgSrc} alt={mainOffer.title} width="120px" height="120px" />
        )}
      </div>
      <div className="listing__content">
        <ListingMeta restId={restId} offer={mainOffer} onFavRemove={onFavRemove} />
        <OffersList
          mainOffer={mainOffer}
          otherOffer={otherOffer}
          hasMoreOffers={hasMoreOffers}
          isMoreOffersOpen={showMoreOffers}
          toggleMore={setShowMoreOffers}
        />
      </div>
      <MoreOffers offers={moreOffers} isOpen={showMoreOffers} />
      <style jsx>{`
        .listing {
          display: grid;
          grid-template-columns: 150px 1fr;
          background: #fff;
          box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
        }
        .listing__content {
          display: grid;
          grid-template-columns: 0.7fr 1fr;
        }
        .listing__img {
          padding: 15px;
        }
        .listing__img img {
          width: 120px;
          height: 120px;
          object-fit: cover;
        }
      `}</style>
    </div>
  );
};

const ListingMeta = ({ offer, restId, onFavRemove }) => {
  const { title, rating, cuisineArray, source } = offer;
  const [linkCopied, setLinkCopied] = useState(false);
  const _rating = Number(rating) || 0;

  useEffect(() => {
    if (linkCopied) {
      setTimeout(() => {
        setLinkCopied(false);
      }, 4000);
    }
  }, [linkCopied]);

  const handleCopyShareLink = () => {
    const query = {};
    query.keywords = title;

    const url = new URL(window.location.href);
    url.search = qs.stringify(query);

    copy(url);

    setLinkCopied(true);

    trackEvent('copy_link', 'generic', title);
  };

  return (
    <div className="listing__meta">
      <div className="meta__container">
        <div>
          <h3 className="meta__name">{toStartCase(title)}</h3>
          <div className="meta__tags">
            {cuisineArray.map((cuisine, index) => (
              <a className="cuisineTag" key={index} href={`?cuisine%5B0%5D=${slugify(cuisine.toLowerCase())}`}>
                {cuisine}
              </a>
            ))}
          </div>
        </div>
        <div className="meta__favorite">
          <FavoriteBtn id={restId} onFavRemove={onFavRemove} slug={offer.locationSlug} />
        </div>
      </div>
      <div className="meta__footer">
        {rating ? (
          <div>
            <Rating size="large" icon="star" disabled defaultRating={_rating} maxRating={5} />
            <span className="rating__number">({_rating})</span>
          </div>
        ) : (
          <div />
        )}
        {linkCopied ? (
          <div className="meta__share meta__share--success">
            <Fragment>
              <Icon name="check" />
              <span>Link copied!</span>
            </Fragment>
          </div>
        ) : (
          <a className="meta__share meta__share--default" onClick={handleCopyShareLink}>
            <Fragment>
              <Icon name="linkify" />
              <span className="meta__share-txt">Share via link</span>
            </Fragment>
          </a>
        )}
      </div>
      <style jsx>{`
        .listing__meta {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 15px;
          border-right: 1px solid #e7e7e7;
        }
        .meta__container {
          display: flex;
          justify-content: space-between;
        }
        .meta__name {
          margin: 0;
          color: rgba(0, 0, 0, 0.75);
        }
        .meta__tags {
          margin-top: 5px;
        }
        .meta__favorite {
          margin-top: 5px;
        }
        .cuisineTag {
          display: inline-block;
          background-color: rgba(24, 44, 55, 0.07);
          color: #182c37;
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 2px;
          margin: 2px;
          font-weight: bold;
          text-transform: uppercase;
          outline: none;
        }
        .cuisineTag:first-child {
          margin-left: 0;
        }
        .cuisineTag:hover {
          text-decoration: underline;
        }
        .meta__cuisine {
          color: #8f8f8f;
          display: block;
          font-weight: normal;
          font-size: 16px;
        }
        .rating__number {
          vertical-align: top;
          font-size: 14px;
          color: #666;
          font-weight: bold;
          text-transform: uppercase;
        }
        .meta__footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .meta__share {
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          color: #00b5ad;
          user-select: none;
          line-height: 1em;
          display: flex;
          align-items: center;
          padding-bottom: 3px;
        }
        .meta__share--default:hover {
          cursor: pointer;
          color: #999;
        }
        .meta__share--success {
          color: #21ba45;
        }
        .meta__share-txt {
          display: inline-block;
          overflow: hidden;
          width: 0;
          white-space: nowrap;
          transition: width 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .meta__share:hover .meta__share-txt {
          width: 95px;
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

const OffersList = ({ mainOffer, otherOffer, hasMoreOffers, isMoreOffersOpen, toggleMore }) => {
  return (
    <div className="wrapper">
      <MainOffer offer={mainOffer} />
      <SideOffer offer={otherOffer} />
      {hasMoreOffers && (
        <a
          className="showMoreBtn"
          onClick={() => {
            trackEvent('show_more', 'others', mainOffer.title);
            toggleMore(!isMoreOffersOpen);
          }}>
          <div>Show more deals</div>
          <div>
            <Icon name="arrow alternate circle down outline" />
          </div>
        </a>
      )}
      <style jsx>{`
        .wrapper {
          display: grid;
        }
        .showMoreBtn {
          font-weight: bold;
          text-transform: uppercase;
          color: #5a5a5a;
          background: #f5f5f5;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 12px;
          border-top: 1px solid #e7e7e7;
          outline: none;
          cursor: pointer;
          padding: 7px 0;
        }
      `}</style>
    </div>
  );
};

const MainOffer = ({ offer }) => {
  const track = () => {
    trackEvent('offer_click', 'main', offer.source, { restaurant_name: offer.title, offer_title: limitChars(_offer) });
  };

  const { href, source, offer: _offer, minimumOrder, deliveryCharge, deliveryTime } = offer;

  const hasDeliveryInfo = minimumOrder || deliveryCharge || deliveryTime;

  return (
    <div className="mainOffer">
      <div className="mainOffer__wrapper">
        <h4 className="mainOffer__source">
          <small>Great Deal</small>
          <img className="mainOffer__sourceImg" src={offerSources[source].logo} alt={source} />
        </h4>
        <div className="mainOffer__offerWrapper">
          <h3 className="mainOffer__offer">
            <a href={href} target="_blank" onClick={track} rel="noopener">
              {limitChars(_offer)}
            </a>
          </h3>
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
                  <span className="deliveryInfo__desc">Time Est.</span>
                  <span className="deliveryInfo__value">
                    {deliveryTime} {showMins(deliveryTime) && <small>mins</small>}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <a className="mainOffer__cta" href={href} target="_blank" onClick={track} rel="noopener">
          Place Order
          <span>
            <Icon name="external" size="small" />
          </span>
        </a>
      </div>
      <style jsx>{`
        .mainOffer {
          display: grid;
          align-items: center;
          border-bottom: 1px solid #e7e7e7;
        }
        .mainOffer__wrapper {
          display: grid;
          align-items: center;
          grid-template-columns: 0.5fr 2fr 1fr;
          grid-column-gap: 10px;
          padding: 15px;
        }
        .mainOffer__source {
          font-weight: normal;
          margin: 0;
          text-transform: capitalize;
        }
        .mainOffer__sourceImg {
          width: 50px;
          height: 50px;
          border-radius: 4px;
        }
        .mainOffer__offerWrapper {
          padding-right: 20px;
        }
        .mainOffer__source small {
          display: block;
          font-size: 12px;
          color: #4fbf74;
          font-weight: 700;
        }
        .mainOffer__offer {
          margin: 0;
        }
        .mainOffer__offer a {
          color: #000;
          font-size: 20px;
        }
        .mainOffer__offer a:hover {
          color: rgba(0, 0, 0, 0.7);
        }
        .deliveryInfo__wrapper {
          display: flex;
          width: 100%;
          margin-top: 10px;
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
          color: #999;
          text-transform: capitalize;
          font-weight: bold;
        }
        .mainOffer__cta {
          background: #4fbf74;
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          height: 44px;
          color: #fff;
          border-radius: 2px;
          padding: 0 5px 0 20px;
          font-size: 16px;
          font-weight: 500;
          transition: background 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .mainOffer__cta:hover {
          background: rgba(73, 178, 108);
        }
        .mainOffer__cta span {
          background: rgba(73, 178, 108);
          border-radius: 2px;
          width: 36px;
          height: 36px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-left: 5px;
        }
      `}</style>
    </div>
  );
};

const SideOffer = ({ offer }) => {
  const hasOffer = offer !== null;

  if (!hasOffer) {
    return (
      <div className="sideOffer">
        <div className="sideOffer__none">No other services are offering deals</div>
        <style jsx>{`
          .sideOffer {
            display: grid;
            align-items: center;
          }
          .sideOffer__none {
            display: flex;
            justify-content: center;
            align-items: center;
            color: rgba(24, 44, 55, 0.35);
            font-size: 16px;
          }
        `}</style>
      </div>
    );
  }

  const { minimumOrder, deliveryCharge, deliveryTime, href, source, offer: _offer, title } = offer;
  const hasDeliveryInfo = minimumOrder || deliveryCharge || deliveryTime;

  return (
    <div className="sideOffer">
      <div className="sideOffer__wrapper">
        <h5 className="sideOffer__source">
          <img className="mainOffer__sourceImg" src={offerSources[source].logo} alt={source} />
        </h5>
        <div className="sideOffer__offerWrapper">
          <h4 className="sideOffer__offer">
            <a
              href={href}
              target="_blank"
              rel="noopener"
              onClick={() =>
                trackEvent('offer_click', 'others', source, { restaurant_name: title, offer_title: limitChars(_offer) })
              }>
              {limitChars(_offer)}
            </a>
          </h4>
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
                  <span className="deliveryInfo__desc">Time Est.</span>
                  <span className="deliveryInfo__value">
                    {deliveryTime} {showMins(deliveryTime) && <small>mins</small>}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <a
          className="sideOffer__cta"
          href={href}
          target="_blank"
          rel="noopener"
          onClick={() =>
            trackEvent('offer_click', 'others', source, { restaurant_name: title, offer_title: limitChars(_offer) })
          }>
          Place Order
          <span>
            <Icon name="external" size="small" />
          </span>
        </a>
      </div>
      <style jsx>{`
        .sideOffer {
          display: grid;
          align-items: center;
        }
        .sideOffer__wrapper {
          display: grid;
          align-items: center;
          grid-template-columns: 0.5fr 2fr 1fr;
          grid-column-gap: 10px;
          padding: 10px 15px;
        }
        .sideOffer__source {
          color: rgba(24, 44, 55, 0.8);
          font-weight: normal;
          margin: 0;
          text-transform: capitalize;
        }
        .mainOffer__sourceImg {
          width: 50px;
          height: 50px;
          border-radius: 4px;
        }
        .sideOffer__offerWrapper {
          padding-right: 20px;
        }
        .sideOffer__offer {
          margin: 0;
        }
        .sideOffer__offer a {
          font-size: 17px;
          color: rgba(24, 44, 55, 0.9);
        }
        .sideOffer__offer a:hover {
          color: rgba(24, 44, 55, 0.7);
        }
        .deliveryInfo__wrapper {
          display: flex;
          width: 100%;
          margin-top: 10px;
        }
        .deliveryInfo__item {
          line-height: 1em;
          margin-right: 30px;
        }
        .deliveryInfo__value {
          font-size: 13px;
          color: rgba(24, 44, 55, 0.6);
        }
        .deliveryInfo__desc {
          display: block;
          font-size: 10px;
          color: rgba(24, 44, 55, 0.4);
          text-transform: capitalize;
          font-weight: bold;
        }
        .sideOffer__cta {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 38px;
          color: rgba(24, 44, 55, 0.8);
          border-radius: 2px;
          padding: 0 5px 0 20px;
          font-size: 14px;
          font-weight: 500;
          border: 1px solid rgba(14, 23, 28, 0.25);
          transition: border-color 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .sideOffer__cta:hover {
          border-color: rgba(24, 44, 55, 0.8);
          color: #333;
        }
        .sideOffer__cta span {
          border-radius: 2px;
          width: 32px;
          height: 32px;
          display: flex;
          justify-content: center;
          align-items: center;
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
      <div className="otherOffers__listWrapper">
        <ul className="otherOffers__list">
          {offers.map((otherOffer, index) => (
            <li key={index}>
              <a
                className="otherOffer__offer"
                href={otherOffer.href}
                target="_blank"
                rel="noopener"
                onClick={() =>
                  trackEvent('offer_click', 'others', otherOffer.source, {
                    restaurant_name: otherOffer.title,
                    offer_title: limitChars(otherOffer.offer),
                  })
                }>
                <span className="otherOffer__source">{otherOffer.source}</span>
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
          grid-template-columns: 0.7fr 1fr;
        }
        .otherOffers__listWrapper {
          border-left: 1px solid #eaeaea;
          margin: -1px;
        }
        .otherOffers__list {
          padding: 0;
          margin: 0;
          list-style: none;
          border-top: 1px solid #e7e7e7;
        }
        .otherOffers__list li {
          border-bottom: 1px solid #ddd;
        }
        .otherOffers__list li a {
          padding: 15px;
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
        .otherOffer__source {
          text-transform: capitalize;
        }
      `}</style>
    </div>
  );
};

export default Listing;
