import React, { Fragment, useContext } from 'react';
import { Icon, Menu, Sidebar } from 'semantic-ui-react';
import { AppContext } from '../../helpers/contexts';
import { trackEvent } from '../../helpers/utils';
import { CITIES_MAP } from '../../helpers/constants';
import Listings from './Listings';
import _find from 'lodash/find';

const Foodables = ({ offers, randomOffers, location, page, cuisines, filters }) => {
  const { sidebarVisible, setSidebarVisible } = useContext(AppContext);
  const cityName = _find(CITIES_MAP, { slug: location.city }).name;

  return (
    <Fragment>
      <Sidebar.Pushable>
        <Sidebar
          as={Menu}
          direction="left"
          animation="overlay"
          onHide={() => setSidebarVisible(false)}
          vertical
          visible={sidebarVisible}
          width="thin">
          <Menu.Item>
            <div className="location__current">
              <Icon name="map marker alternate" size="big" color="grey" />
              <div>
                <div className="addressHeading">Delivery address:</div>
                <div className="address">
                  {cityName}, {location.text}
                </div>
              </div>
            </div>
            <div className="location__change">
              <a
                href="/select-area"
                onClick={() => {
                  trackEvent('change_location', 'generic', location.text, '');
                  setSidebarVisible(false);
                }}>
                <Icon name="edit outline" />
                Change Location
              </a>
            </div>
          </Menu.Item>
        </Sidebar>
        <Sidebar.Pusher dimmed={sidebarVisible}>
          <Listings
            offers={offers}
            randomOffers={randomOffers}
            location={location}
            cuisines={cuisines}
            filters={filters}
            page={page}
          />
        </Sidebar.Pusher>
      </Sidebar.Pushable>
      <style jsx>{`
        .location__current {
          text-align: center;
        }
        .addressHeading {
          margin-top: 5px;
          margin-bottom: 2px;
          font-size: 10px;
          color: #666;
        }
        .address {
          color: #333;
        }
        .location__change {
          font-size: 12px;
          margin-top: 10px;
        }
      `}</style>
    </Fragment>
  );
};

export default Foodables;
