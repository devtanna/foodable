import { Label } from 'semantic-ui-react';
import { COLLECTIONS } from '../../helpers/constants';
import { slugify, trackEvent } from '../../helpers/utils';
import qs from 'qs';

const Collections = ({ cuisines }) => {
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
          {cuisinesList.map((collection, index) => (
            <div key={index} className="item">
              <Label basic size="medium" as="a" image onClick={() => handleClick(collection.name)}>
                <img src={collection.image} alt={`deals on ${collection.name} cuisine`} />
                {collection.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .wrapper {
          margin-bottom: -5px;
          width: 100%;
          height: 55px;
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
          box-shadow: -1px 0 24px 30px #fafafa;
        }
        .scrollable {
          width: 100%;
          height: 100%;
          bottom: 0;
          overflow-x: scroll;
          overflow-y: hidden;
          padding-top: 15px;
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
          padding-right: 25px;
        }
      `}</style>
    </div>
  );
};

export default Collections;
