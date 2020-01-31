import React, { useContext } from 'react';
import { Label } from 'semantic-ui-react';
import { COLLECTIONS } from '../../helpers/constants';
import { slugify, trackEvent } from '../../helpers/utils';
import { AppContext } from '../../helpers/contexts';
import qs from 'qs';

const Collections = ({ cuisines, filters }) => {
  const { setSearchModalOpen } = useContext(AppContext);

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
      <div className="scrollable">
        <div className="content">
          {cuisinesList.map((collection, index) => {
            const isActive = filters.cuisine.length === 1 && filters.cuisine[0] === collection.name.toLowerCase();
            return (
              <div key={index} className="item">
                <Label basic={!isActive} size="medium" as="a" image onClick={() => handleClick(collection.name)}>
                  <img src={collection.image} alt={`deals on ${collection.name} cuisine`} />
                  {collection.name}
                </Label>
              </div>
            );
          })}
          <a className="item" onClick={() => setSearchModalOpen(true)}>
            <strong>+ more</strong>
          </a>
        </div>
      </div>
      <style jsx>{`
        .wrapper {
          margin-bottom: -15px;
          width: 100%;
          height: 45px;
          overflow: hidden;
          position: relative;
        }
        .wrapper:after {
          content: ' ';
          top: 0;
          right: 0;
          height: 100%;
          position: absolute;
          width: 1px;
          background: #fafafa;
          box-shadow: -1px 0 30px 40px #fafafa;
        }
        .scrollable {
          width: 100%;
          height: 100%;
          bottom: 0;
          overflow-x: scroll;
          overflow-y: hidden;
          padding-bottom: 100px;
          box-sizing: content-box;
        }
        .content {
          display: flex;
          height: 100%;
          align-items: center;
          transform: translateX(0);
        }
        .item {
          white-space: nowrap;
          flex-shrink: 0;
          margin-right: 10px;
        }
        .item:last-child {
          padding-right: 40px;
        }
      `}</style>
    </div>
  );
};

export default Collections;
