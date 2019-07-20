import React, { useState } from 'react';
import { Dropdown, Button } from 'semantic-ui-react';
import { device } from '../helpers/device';
import { hideVirtualKeyboard } from '../helpers/utils';
import { CITIES } from '../helpers/constants';

const Landing = ({ locations }) => {
  const [selectedCity, setSelectedCity] = useState('dubai');
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleSubmit = () => {
    if (!selectedLocation) return;
    window.location.pathname = `/${selectedCity}/${selectedLocation}/`;
  };

  return (
    <main>
      <div className="wrapper">
        <img className="logo" src="/static/logo.svg" alt="Foodable.ae" />
        <h1>
          Discover and compare great food deals from top food delivery websites!
        </h1>
        <div className="ctaWrapper">
          <Dropdown
            selection
            placeholder="Choose your city"
            fluid
            options={CITIES}
            value={selectedCity}
            onChange={(e, { value }) => {
              hideVirtualKeyboard();
              setSelectedCity(value);
            }}
            disabled
            className="fdbDropdown"
          />
          <Dropdown
            selection
            placeholder="Select your area"
            fluid
            search
            options={locations}
            onChange={(e, { value }) => setSelectedLocation(value)}
            value={selectedLocation}
            className="fdbDropdown"
          />
          <Button onClick={handleSubmit} size="large" className="searchBtn">
            Get offers!
          </Button>
        </div>
      </div>
      <style jsx>{`
        main {
          height: 100%;
          background: #fff url('/static/lp-bg-s.svg') 30% 100% no-repeat;
        }
        .wrapper {
          max-width: 800px;
          margin: 0 auto;
          padding-top: 30px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: center;
        }
        .logo {
          width: 100%;
          max-width: 290px;
          margin: 0 auto;
        }
        h1 {
          font-size: 20px;
          color: #7c7c7c;
          margin: 30px;
        }
        .ctaWrapper {
          display: grid;
          grid-row-gap: 15px;
          align-items: flex-start;
          padding: 0 30px;
          grid-column-gap: 15px;
        }
        @media ${device.mobileM} {
          .logo {
            max-width: 350px;
          }
          h1 {
            font-size: 2rem;
          }
        }
        @media ${device.mobileL} {
          main {
            background-size: 100%;
          }
        }
        @media ${device.tablet} {
          main {
            background: #fff url('/static/lp-bg.svg') 0 110% no-repeat;
            background-size: 100%;
          }
          .wrapper {
            padding-top: 75px;
          }
          h1 {
            margin: 50px 30px 75px;
          }
          .ctaWrapper {
            grid-template-columns: 1fr 2fr auto;
          }
        }
      `}</style>
    </main>
  );
};

export default Landing;
