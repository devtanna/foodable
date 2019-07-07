import React, { Fragment, useEffect } from 'react';
import Head from 'next/head';
import { device } from '../helpers/device';
import { redirectToPage, trackPageView } from '../helpers/utils';
import FoodablesMobile from '../components/mobile/';
import FoodablesDesktop from '../components/desktop/';
import { getOffers, getRandomOffers, getLocations } from '../helpers/api';
import Cookies from 'universal-cookie';

const PageHead = ({ page }) => (
  <Head>
    <title>
      Discover & compare great food deals in UAE | Foodable.ae
      {page > 1 ? ` - Page ${page}` : null}
    </title>
  </Head>
);

const Index = ({ offers, randomOffers, selectedLocation = null, page = 1 }) => {
  useEffect(() => {
    trackPageView('homepage', '/', `/loc=${selectedLocation.value}`);
  }, []);

  return (
    <Fragment>
      <PageHead page={page} />
      <div className="wrapper">
        <div className="mobile">
          <FoodablesMobile
            offers={offers}
            randomOffers={randomOffers}
            location={selectedLocation}
            page={page}
          />
        </div>
        <div className="desktop">
          <FoodablesDesktop
            offers={offers}
            randomOffers={randomOffers}
            location={selectedLocation}
            page={page}
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
    </Fragment>
  );
};

Index.getInitialProps = async ({ req, res, query }) => {
  let cookies;

  if (res) {
    cookies = new Cookies(req.headers.cookie);
  } else {
    cookies = new Cookies();
  }

  const page = query.page ? query.page : 1;
  const deliveryLocation = cookies.get('location');
  const isLocationSet = deliveryLocation !== undefined;

  try {
    const { locations } = await getLocations();

    if (isLocationSet) {
      if (locations.find(location => location.value === deliveryLocation)) {
        const { offers } = await getOffers(deliveryLocation, page);
        const { randomOffers } = await getRandomOffers(deliveryLocation);

        const selectedLocation = locations.find(
          location => location.value === deliveryLocation
        );

        return { offers, randomOffers, selectedLocation, page };
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
