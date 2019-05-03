import React from 'react';
import Rating from 'react-rating';
import { Icon, Responsive } from 'semantic-ui-react';

const Listing = () => (
  <div className="listing">
    <div className="listing__img">
      <img src="/static/placeholder.png" />
    </div>
    <div className="listing__content">
      <ListingMeta />
      <BestOffer />
      <OtherOffers />
    </div>
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
        grid-template-columns: 1fr .9fr .8fr;
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

const ListingMeta = () => (
  <div className="listing__meta">
    <h2 className="meta__name">
      Hardees
      <small className="meta__cuisine">Burger, Fast Food</small>
    </h2>
    <div className="meta__costForTwo">AED 60 for two people (approx.)</div>
    <div className="meta__rating">
      <div className="rating__heading">Rating</div>
      <Rating
        className="rating__stars"
        readonly
        initialRating={3}
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
        border-right: 1px solid #E7E7E7;
      }
      .meta__name {
        margin: 0;
      }
      .meta__cuisine {
        color: #8F8F8F;
        display: block;
        font-weight: normal;
        font-size: 16px;
      }
      .meta__costForTwo {
        color: #D2D2D2;
        font-weight: bold;
        font-size: 14px;
      }
    `}</style>
  </div>
);

const BestOffer = () => (
  <div className="bestOffer talabat">
    <div className="bestOffer__heading"></div>
    <div className="bestOffer__body">
      <div className="bestOffer__ribbon">Hottest Deal</div>
      <h3 className="bestOffer__offer">30% Off on all orders</h3>
    </div>
    <div className="bestOffer__footer">
      <div>Show this deal</div> 
      <div><Icon size="small" name="arrow right" /></div>
    </div>
    <style jsx>{`
      .bestOffer {
        display: grid;
        margin: 20px;
        grid-template-rows: 30px auto 30px;
        grid-row-gap: 0;
      }
      .bestOffer.talabat {
        border: 2px solid #FF6F00;
      }
      .bestOffer.talabat .bestOffer__heading {
        background: #FF6400 url('/static/restaurant-banners/talabat.png') 0 0 no-repeat;
        background-size: 133px 30px;
      }
      .bestOffer__body {
        background: #FFF8F3;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
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
        color: #4D4D4D;
        text-transform: uppercase;
      }
      .bestOffer__footer {
        display: flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(270deg, #F34343 18.23%, #FD7650 100%);
        color: #fff;
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
      }
    `}</style>
  </div>
);

const OtherOffers = () => (
  <div className="otherOffers">
    <div className="otherOffer deliveroo">
      <div className="otherOffer__heading">View Deal</div>
      <div className="otherOffer__body">20% Off on all orders</div>
    </div>
    <div className="otherOffer carriage">
      <div className="otherOffer__heading">View Deal</div>
      <div className="otherOffer__body">20% Off on all orders</div>
    </div>
    <div className="showMoreBtn">
      <div>Show more deals</div> 
      <div><Icon name="arrow alternate circle down outline" /></div>
    </div>
    <style jsx>{`
      .otherOffers {
        margin: 20px 20px 20px 0;
        display: grid;
        grid-template-rows: 3fr 3fr 1fr;
        grid-row-gap: 10px;
      }
      .otherOffer {
        width: 100%;
        display: grid;
        grid-template-rows: 25px 50px;
      }
      .otherOffer.deliveroo {
        background-color: #00CCBC;
      }
      .otherOffer.carriage {
        background-color: #E0513D;
      }
      .otherOffer__heading {
        font-size: 12px;
        color: #fff;
        font-weight: bold;
        display: flex;
        padding: 0 20px;
        align-items: center;
      }
      .otherOffer.deliveroo .otherOffer__heading {
        background: #00CCBC url('/static/restaurant-banners/deliveroo.png') 100% 0 no-repeat;
        background-size: 100px 25px;
      }
      .otherOffer.carriage .otherOffer__heading {
        background: #E0513D url('/static/restaurant-banners/carriage.png') 100% 0 no-repeat;
        background-size: 100px 25px;
      }
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
        background: linear-gradient(270deg, #3ACA7C 16.26%, #88E0D0 98.03%);
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

export default Listing;
