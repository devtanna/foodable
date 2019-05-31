import React from 'react';
import Rating from 'react-rating';
import { Icon, Responsive } from 'semantic-ui-react';
import { offerSources } from '../../helpers/constants';

const Listing = ({ offer }) => {
  const mainOffer = offer.offers[0];
  const otherOffers = offer.offers.slice(1);
  const hasImg = mainOffer.image !== '';
  const imgSrc = hasImg ? mainOffer.image : '/static/placeholder.png';

  return (
    <div className="listing">
      <div className="listing__img">
        <img src={imgSrc} />
      </div>
      <div className="listing__content">
        <ListingMeta offer={mainOffer} />
        <BestOffer offer={mainOffer} />
        <OtherOffers offers={otherOffers} />
      </div>
      <style jsx>{`
        .listing {
          display: grid;
          grid-template-columns: 20% 80%;
          background: #fff;
          box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
          min-height: 200px;
        }
        .listing__content {
          display: grid;
          grid-template-columns: 1fr 0.9fr 0.8fr;
        }
        .listing__img {
          padding: 20px;
        }
        .listing__img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>
    </div>
  );
};

const ListingMeta = ({ offer }) => {
  // TODO: FIX RATING
  const numFromRating = offer.rating ? Number(offer.rating.match(/\d+/)) : null;
  const initialRating = 1;

  return (
    <div className="listing__meta">
      <h2 className="meta__name">
        {offer.title}
        <small className="meta__cuisine">{offer.cuisine}</small>
      </h2>
      {/* <div className="meta__costForTwo">{offer.cost_for_two}</div> */}
      <div className="meta__rating">
        <div className="rating__heading">Rating</div>
        <Rating
          className="rating__stars"
          readonly
          initialRating={initialRating}
          emptySymbol={<Icon name="star" size="large" color="teal" />}
          fullSymbol={<Icon name="star" size="large" color="yellow" />}
        />
      </div>
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
      `}</style>
    </div>
  );
};

const BestOffer = ({ offer }) => (
  <a href={offer.href} target="_blank" className={`bestOffer ${offer.source}`}>
    <div className="bestOffer__heading" />
    <div className="bestOffer__body">
      <div className="bestOffer__ribbon">Best Deal</div>
      <h3 className="bestOffer__offer">{offer.offer}</h3>
    </div>
    <div className="bestOffer__footer">
      <div>Show this deal</div>
      <div>
        <Icon size="small" name="arrow right" />
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
      ${Object.entries(offerSources)
        .map(
          ([key, value], index) =>
            `
          .bestOffer.${key} .bestOffer__heading {
            background: ${value.color} url(${value.logo}) 0 0 no-repeat;
            background-size: 133px 30px;
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
        color: #7e8e12;
        font-size: 16px;
        text-align: center;
        color: #4d4d4d;
        text-transform: uppercase;
      }
      .bestOffer__footer {
        display: flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(270deg, #f34343 18.23%, #fd7650 100%);
        color: #fff;
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
      }
    `}</style>
  </a>
);

const OtherOffers = ({ offers }) => {
  if (offers.length === 0) return <div />;

  const hasMore = offers.length > 2;

  return (
    <div className="otherOffers">
      {offers.slice(0, 2).map((offer, index) => (
        <a
          href={offer.href}
          target="_blank"
          key={index}
          className={`otherOffer ${offer.source}`}>
          <div className="otherOffer__heading">View Deal</div>
          <div className="otherOffer__body">{offer.offer}</div>
        </a>
      ))}
      {hasMore && (
        <div className="showMoreBtn">
          <div>Show more deals</div>
          <div>
            <Icon name="arrow alternate circle down outline" />
          </div>
        </div>
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
          padding: 0 20px;
          align-items: center;
        }
        ${Object.entries(offerSources)
          .map(
            ([key, value], index) =>
              `
            .otherOffer.${key} {
              background-color: ${value.color};
            }
            .otherOffer.${key} .otherOffer__heading {
              background: ${value.color} url(${value.logo}) 100% 0 no-repeat;
              background-size: 120px 30px;
            }
          `
          )
          .join('')}
        .otherOffer__heading img {
          height: 25px;
        }
        .otherOffer__body {
          background: #fff;
          margin: 2px;
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
        }
      `}</style>
    </div>
  );
};

export default Listing;
