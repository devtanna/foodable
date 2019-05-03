import React, { useState } from 'react';
import Rating from 'react-rating';
import { Icon, Accordion } from 'semantic-ui-react';

const Listing = () => {
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleAccordion = (e, titleProps) => {
    const { index } = titleProps
    const newIndex = activeIndex === index ? -1 : index
    setActiveIndex(newIndex);
  }

  return (
    <div className="listing">
      <div className="listing__img">
        <img src="/static/placeholder.png" />
      </div>
      <div className="listing__content">
        <div className="listing__meta">
          <div className="meta__name">
            Hardees
            <small className="meta__cuisine">Burger, Fast Food</small>
          </div>
          <div className="meta__rating">
            <Rating
              className="rating__stars"
              readonly
              initialRating={3}
              emptySymbol={<Icon name="star" size="small" color="teal" />}
              fullSymbol={<Icon name="star" size="small" color="olive" />}
            />
          </div>
        </div>
        <div className="bestOffer talabat">
          <div className="bestOffer__heading"><span>Talabat</span></div>
          <div className="bestOffer__offer">30% Off on all orders</div>
          <div className="bestOffer__footer">
            <div>View Deal</div> 
            <div><Icon size="small" name="arrow right" /></div>
          </div>
        </div>
      </div>
      <div className="otherOffers">
        <Accordion>
          <Accordion.Title active={activeIndex === 0} index={0} onClick={handleAccordion} className="accordionTitle">
            <div className="showMoreBtn">
              Show more deals <Icon name="arrow alternate circle down outline" />
            </div>
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 0} className="accordionContent">
            <ul className="otherOffers__list">
              <li>
                <a className="otherOffer__offer" href="#">
                  <span>Zomato</span>
                  <span>30% Off on all orders</span>
                  <Icon name="angle right" />
                </a>
              </li>
              <li>
                <a className="otherOffer__offer" href="#">
                  <span>Zomato</span>
                  <span>30% Off on all orders</span>
                  <Icon name="angle right" />
                </a>
              </li>
              <li>
                <a className="otherOffer__offer" href="#">
                  <span>Zomato</span>
                  <span>30% Off on all orders</span>
                  <Icon name="angle right" />
                </a>
              </li>
            </ul>
          </Accordion.Content>
        </Accordion>
      </div>
      <style jsx>{`
        .listing {
          display: grid;
          grid-template-columns: 35% 65%;
          background: #fff;
          box-shadow: 0 1px 4px rgba(41, 51, 57, .3);
          margin-bottom: 15px;
        }
        .listing__content {
          display: block;
          padding: 5px;
        }
        .listing__img {
          padding: 5px;
        }
        .listing__img img {
          width: 100%;
          object-fit: cover;
        }
        .listing__meta {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-bottom: 1px solid #eaeaea;
          padding-bottom: 10px;
          margin-bottom: 5px;
        }
        .meta__name {
          font-weight: bold;
          font-size: 16px;
        }
        .meta__cuisine {
          color: #8F8F8F;
          display: block;
          font-weight: normal;
          font-size: 13px;
        }
        .bestOffer__heading {
          font-size: 14px;
          font-weight: bold;
          color: #333;
        }
        .bestOffer__offer {
          color: #7e8e12;
          font-size: 13px;
          font-weight: bold;
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
          padding: 5px 0;
          margin-top: 5px;
        }
        .otherOffers {
          grid-column-end: span 2;
          margin-top: 5px;
        }
        .showMoreBtn {
          border-top: 1px solid #eaeaea;
          text-align: center;
          margin: 5px;
          padding-top: 5px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #666;
        }
        .otherOffers__list {
          padding: 0;
          margin: 0;
          list-style: none;
          border-top: 1px solid #eaeaea;
        }
        .otherOffers__list li {
          padding: 10px 20px;
          border-bottom: 1px solid #ddd;
        }
        .otherOffers__list li:last-child {
          border-bottom: none;
        }
        .otherOffer__offer {
          display: flex;
          justify-content: space-between;
          color: #666;
        }
        :global(.accordionTitle, .accordionContent) {
          padding: 0 !important;
        }
      `}</style>
    </div>
  );
};

export default Listing;
