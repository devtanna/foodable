import React from 'react';
import { device } from '../helpers/device';
import { redirectToPage } from '../helpers/utils';
import FoodablesMobile from '../components/mobile/';
import FoodablesDesktop from '../components/desktop/';
import { getOffers, getRandomOffers, getLocations } from '../helpers/api';
import Cookies from 'universal-cookie';

const Index = ({ offers, randomOffers, selectedLocation = null }) => {
  return (
    <div className="wrapper">
      <div className="mobile">
        <FoodablesMobile
          offers={offers}
          randomOffers={randomOffers}
          location={selectedLocation}
        />
      </div>
      <div className="desktop">
        <FoodablesDesktop
          offers={offers}
          randomOffers={randomOffers}
          location={selectedLocation}
        />
      </div>
      <style jsx>{`
        .wrapper {
          height: 100%;
        }
        .desktop {
          display: none;
        }
        @media ${device.tablet} {
          .mobile {
            display: none;
          }
          .desktop {
            display: block;
          }
        }
      `}</style>
    </div>
  );
};

Index.getInitialProps = async ({ req, res }) => {
  let cookies;

  if (res) {
    cookies = new Cookies(req.headers.cookie);
  } else {
    cookies = new Cookies();
  }

  const deliveryLocation = cookies.get('location');
  const isLocationSet = deliveryLocation !== undefined;

  try {
    const { locations } = await getLocations();

    if (isLocationSet) {
      if (locations.find(location => location.value === deliveryLocation)) {
        const { offers } = await getOffers(deliveryLocation);
        const { randomOffers } = await getRandomOffers(deliveryLocation);

        const selectedLocation = locations.find(
          location => location.value === deliveryLocation
        );

        return { offers, randomOffers, selectedLocation };
      } else {
        redirectToPage(res, '/select-area');
      }
    } else {
      redirectToPage(res, '/select-area');
    }
  } catch (e) {
    console.log(e);
    return {};
  }
};

export default Index;
