import React from 'react';
import { Icon } from 'semantic-ui-react';

const Header = () => {
  return (
    <header>
      <div className="wrapper">
        <div></div>
        <div className="logoWrapper">
          <img className="logo" src="/static/logo.svg" alt="Foodable logo" />
        </div>
        <nav>
          <ul className="navLinks">
            <li>
              <div className="location__current">
                <Icon name="map marker alternate" size="large" color="grey" /> 
                <div>
                  <div className="addressHeading">Delivery address:</div>
                  <div className="address">Dubai, Umm al Sheif</div>
                </div>
              </div>
            </li>
            <li>
              <div className="location__change">
                <a href="#">Change Location</a>
              </div>
            </li>
          </ul>
        </nav>
      </div>
      <style jsx>{`
        header {
          padding: 10px 0;
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
        }
        .logo {
          max-width: 225px;
        }
        nav {
          display: flex;
          justify-content: flex-end;
        }
        .navLinks {
          display: flex;
          margin: 0;
          padding: 0;
        }
        .navLinks li {
          display: inline-flex;
          align-items: center;
          border-right: 1px solid #CCC;
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
      `}</style>
    </header>
  );
};

export default Header;
