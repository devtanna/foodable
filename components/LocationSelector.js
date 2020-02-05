import React, { useState, useEffect } from 'react';
import { Dropdown, Button, Header, Icon } from 'semantic-ui-react';
import { device } from '../helpers/device';
import { slugify } from '../helpers/utils';
import { CITIES_MAP } from '../helpers/constants';
import { getGeolocation } from '../helpers/geolocation';

const LocationSelector = ({ locations }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationsOptions, setLocationsOptions] = useState([]);
  const [isAreaLoading, setIsAreaLoading] = useState(false);
  const [geolocation, setGeolocation] = useState(null);
  const [selectAreaError, setSelectAreaError] = useState(false);

  useEffect(() => {
    setLocationsOptions(transformLocations(locations));
    initGeolocation();
  }, []);

  useEffect(() => {
    if (!geolocation || !locations) return;
    Object.entries(locations).some(([citySlug, cityLocations]) => {
      const foundLoc = cityLocations.find(loc => loc.key === geolocation);
      if (foundLoc) {
        const city = CITIES_MAP[`${foundLoc.city}`];
        setSelectedLocation(`${foundLoc.value}_${city.slug}`);
        return true;
      } else {
        return false;
      }
    });
  }, [geolocation]);

  const initGeolocation = async () => {
    try {
      setIsAreaLoading(true);

      setTimeout(() => {
        if (isAreaLoading) {
          setIsAreaLoading(false);
        }
      }, 3000);

      const res = await getGeolocation();

      if (res) {
        setGeolocation(slugify(res));
      }
    } catch (e) {
      console.warn('Could not use geolocation: ', e);
    } finally {
      setIsAreaLoading(false);
    }
  };

  const handleSubmit = () => {
    setSelectAreaError(false);

    if (!selectedLocation) {
      setSelectAreaError(true);
      return;
    }

    try {
      const [location, city] = selectedLocation.split('_');
      window.location.pathname = `/${city}/${location}/`;
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="ctaWrapper">
      <Dropdown
        selection
        placeholder="Enter your area"
        fluid
        search
        loading={isAreaLoading}
        options={locationsOptions}
        selectOnNavigation={false}
        selectOnBlur={false}
        onFocus={() => {
          if (selectAreaError) setSelectAreaError(false);
        }}
        onSearchChange={() => {
          if (selectAreaError) setSelectAreaError(false);
        }}
        onChange={(e, { value }) => {
          setSelectedLocation(value);
        }}
        value={selectedLocation}
        id="locationDropdown"
        error={selectAreaError}
      />
      <Button onClick={handleSubmit} size="large" id="findDealsBtn">
        Find Deals
      </Button>
      <style jsx>{`
        .ctaWrapper {
          display: grid;
          grid-row-gap: 15px;
          align-items: flex-start;
          padding: 0 30px;
          max-width: 650px;
          margin: 0 auto;
        }
        :global(#findDealsBtn) {
          background: linear-gradient(270deg, #f34343 18.23%, #ff7e52 100%) !important;
          color: #fff !important;
          width: 100%;
        }
        :global(#locationDropdown) {
          font-size: 1.1em !important;
        }
        @media ${device.tablet} {
          :global(#findDealsBtn) {
            border-bottom-right-radius: 4px !important;
            border-top-right-radius: 4px !important;
          }
          :global(#locationDropdown) {
            border-bottom-left-radius: 4px !important;
            border-top-left-radius: 4px !important;
          }
          .ctaWrapper {
            grid-template-columns: 2fr 150px;
          }
        }
      `}</style>
    </div>
  );
};

const transformLocations = locations => {
  const updatedLocations = [];

  Object.keys(locations).forEach(loc => {
    locations[loc].forEach(location => {
      const city = CITIES_MAP[`${location.city}`];
      updatedLocations.push({
        ...location,
        value: `${location.value}_${city.slug}`,
        content: (
          <Header size="small">
            <Icon name="map marker alternate" size="tiny" color="teal" />
            <Header.Content>
              <strong>{location.text}</strong>
              <Header.Subheader>
                <small>{city.name}</small>
              </Header.Subheader>
            </Header.Content>
            <style jsx>{`
              strong {
                color: #333;
                font-size: 15px;
              }
              small {
                font-size: 13px;
                color: #666;
              }
            `}</style>
          </Header>
        ),
      });
    });
  });

  return updatedLocations;
};

export default LocationSelector;
