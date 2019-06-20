import React, { useState } from 'react';
import Rating from 'react-rating';
import { Icon, Accordion } from 'semantic-ui-react';
import { offerSources } from '../../helpers/constants';

const Listing = ({ offer }) => {
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleAccordion = (e, titleProps) => {
    const { index } = titleProps;
    const newIndex = activeIndex === index ? -1 : index;
    setActiveIndex(newIndex);
  };

  const mainOffer = offer.offers[0];
  const otherOffers = offer.offers.slice(1);
  const hasImg = mainOffer.image !== '';
  const imgSrc = hasImg ? mainOffer.image : '/static/placeholder.png';

  return (
    <div className="listing">
      <div className="listing__img">
        <img src={imgSrc} alt={mainOffer.title} />
      </div>
      <div className="listing__content">
        <div className="listing__meta">
          <div className="meta__name">
            {mainOffer.title}
            <small className="meta__cuisine">{mainOffer.cuisine}</small>
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
        <div className="bestOffer">
          <div className="bestOffer__heading">
            <span>{mainOffer.source}</span>
          </div>
          <div className="bestOffer__offer">{mainOffer.offer}</div>
          <a
            href={mainOffer.href}
            target="_blank"
            className="bestOffer__footer">
            <div>View Deal</div>
            <div>
              <Icon size="small" name="arrow right" />
            </div>
          </a>
        </div>
      </div>
      {otherOffers.length > 0 && (
        <div className="otherOffers">
          <Accordion>
            <Accordion.Title
              active={activeIndex === 0}
              index={0}
              onClick={handleAccordion}
              className="accordionTitle">
              <div className="showMoreBtn">
                Show more deals{' '}
                <Icon name="arrow alternate circle down outline" />
              </div>
            </Accordion.Title>
            <Accordion.Content
              active={activeIndex === 0}
              className="accordionContent">
              <ul className="otherOffers__list">
                {otherOffers.map((otherOffer, index) => (
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
            </Accordion.Content>
          </Accordion>
        </div>
      )}
      <style jsx>{`
        .listing {
          display: grid;
          grid-template-columns: 35% 65%;
          background: #fff;
          box-shadow: 0 1px 4px rgba(41, 51, 57, 0.3);
          margin-bottom: 15px;
        }
        .listing__content {
          display: block;
          padding: 10px;
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
          color: #8f8f8f;
          display: block;
          font-weight: normal;
          font-size: 13px;
        }
        .bestOffer__heading {
          font-size: 15px;
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
          background: linear-gradient(270deg, #f34343 18.23%, #fd7650 100%);
          color: #fff;
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          padding: 5px 0;
          margin-top: 5px;
          border-radius: 4px;
        }
        .otherOffers {
          grid-column-end: span 2;
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
        }
        :global(.accordionTitle, .accordionContent) {
          padding: 0 !important;
        }
      `}</style>
    </div>
  );
};

export default Listing;
