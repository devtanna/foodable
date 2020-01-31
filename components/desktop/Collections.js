import React, { useContext } from 'react';
import { Label } from 'semantic-ui-react';
import { COLLECTIONS } from '../../helpers/constants';
import { slugify, trackEvent } from '../../helpers/utils';
import qs from 'qs';

const Collections = ({ cuisines, filters }) => {
  const cuisinesList = COLLECTIONS.filter(collection => {
    const found = cuisines.indexOf(collection.name) > -1;
    return found;
  });

  const handleClick = cuisine => {
    const query = {};
    query.cuisine = [slugify(cuisine)];
    trackEvent('search', 'generic', 'collections', cuisine);
    window.location.search = `${qs.stringify(query)}`;
  };

  return (
    <div className="wrapper">
      <p className="subheading">Quick links:</p>
      {cuisinesList.map((collection, index) => {
        const isActive = filters.cuisine.length === 1 && filters.cuisine[0] === slugify(collection.name);
        return (
          <div key={index} className="item">
            <Label basic={!isActive} size="medium" as="a" image onClick={() => handleClick(collection.name)}>
              <img src={collection.image} alt={`deals on ${collection.name} cuisine`} />
              {collection.name}
            </Label>
          </div>
        );
      })}
      <style jsx>{`
        .wrapper {
          width: 100%;
          overflow: hidden;
          position: relative;
          margin-bottom: 25px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
        }
        .item {
          white-space: nowrap;
          margin-right: 10px;
        }
        .item:last-child {
          padding-right: 40px;
        }
        .subheading {
          color: #3b3b3b;
          margin: 0;
          padding: 0 10px;
          text-transform: uppercase;
          font-weight: 600;
          font-size: 11px;
        }
      `}</style>
    </div>
  );
};

export default Collections;
