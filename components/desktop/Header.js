import React from 'react';
import { Icon } from 'semantic-ui-react';
import { trackEvent } from '../../helpers/utils';
import { CITIES_MAP } from '../../helpers/constants';
import _find from 'lodash/find';

const Header = ({ location }) => {
  const cityName = _find(CITIES_MAP, { slug: location.city }).name;
  return (
    <header>
      <div className="wrapper">
        <nav>
          <ul className="navLinks">
            <li>
              <div className="location__current">
                <Icon name="map marker alternate" size="large" color="grey" />
                <div>
                  <div className="addressHeading">Delivery address:</div>
                  <div className="address">
                    {cityName}, {location.text}
                  </div>
                </div>
              </div>
            </li>
            <li>
              <div className="location__change">
                <a href="/select-area" onClick={() => trackEvent('change_location', 'generic', location.text)}>
                  Change Location
                </a>
              </div>
            </li>
          </ul>
        </nav>
        <div className="logoWrapper">
          <a href="/">
            <img className="logo" src="/static/logo.svg" alt="Foodable logo" />
          </a>
        </div>
        <ul className="menuWrapper">
          <li>
            <a href="/favourites">
              <div>
                <Icon name="heart outline" />
              </div>
              <div>My Favourites</div>
            </a>
          </li>
        </ul>
      </div>
      <style jsx>{`
        header {
          padding: 0;
          box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 1;
        }
        .wrapper {
          max-width: 1200px;
          width: 100%;
          height: 100%;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          align-items: center;
          justify-content: center;
        }
        .logoWrapper {
          text-align: center;
          margin-top: 7px;
          padding: 5px 0;
        }
        .logo {
          max-width: 225px;
        }
        nav {
          display: flex;
          justify-content: flex-start;
        }
        .navLinks {
          display: flex;
          margin: 0;
          padding: 0;
        }
        .navLinks li {
          display: inline-flex;
          align-items: center;
          border-right: 1px solid #ccc;
          padding: 0 10px;
        }
        .navLinks li:last-child {
          border-right: 0;
        }
        .location__current {
          display: flex;
          align-items: center;
        }
        .addressHeading {
          font-size: 10px;
          color: #666;
        }
        .address {
          color: #333;
          margin-top: -5px;
        }
        .location__change {
          font-size: 12px;
        }
        ul.menuWrapper {
          list-style: none;
          display: flex;
          margin: 0;
          padding: 0;
          justify-content: flex-end;
          height: 100%;
        }
        ul.menuWrapper li a {
          height: 100%;
          border-left: 1px solid #eaeaea;
          padding: 0 10px;
          display: flex;
          align-items: center;
          color: rgba(0, 0, 0, 0.87);
        }
        ul.menuWrapper li:last-child a {
          border-right: 1px solid #eaeaea;
        }
        ul.menuWrapper li a:hover {
          background-color: #fbfbfb;
        }
      `}</style>
    </header>
  );
};

export default Header;
