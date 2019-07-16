import React, { Fragment, useEffect } from 'react';
import Head from 'next/head';
import { device } from '../helpers/device';
import { redirectToPage, trackPageView } from '../helpers/utils';
import FoodablesMobile from '../components/mobile/';
import FoodablesDesktop from '../components/desktop/';
import {
  getOffers,
  getRandomOffers,
  getLocations,
  getCuisines,
} from '../helpers/api';
import Cookies from 'universal-cookie';
import qs from 'qs';

const PageHead = ({ page, filters }) => (
  <Head>
    <title>
      Discover & compare great
      {filters.cuisine.length > 0
        ? ` ${filters.cuisine.join(' and ')} cuisine`
        : null}{' '}
      food deals in UAE
      {filters.keywords !== ''
        ? ` matching keywords '${filters.keywords}'`
        : null}{' '}
      | Foodable.ae
      {page > 1 ? ` - Page ${page}` : null}
    </title>
    <meta
      name="description"
      content={`Compare food promotions and discover great deals from top food delivery websites. Search by restaurant name or your favorite cuisine and find great food deals in your area.${
        filters.cuisine.length > 0
          ? ' ' + filters.cuisine.join(' and ') + ' restaurants in UAE.'
          : ''
      }${
        filters.keywords !== ''
          ? " Restaurants matching keyword '" + filters.keywords + "' in UAE."
          : ''
      }`}
    />
  </Head>
);

const Index = ({
  offers,
  randomOffers,
  selectedLocation = null,
  page = 1,
  cuisines = [],
  searchFilters = null,
  device = 'phone',
}) => {
  useEffect(() => {
    trackPageView('homepage', '/', `/loc=${selectedLocation.value}`);
  }, []);

  return (
    <Fragment>
      <PageHead page={page} filters={searchFilters} />
      <div className="wrapper">
        {device === 'phone' && (
          <FoodablesMobile
            offers={offers}
            randomOffers={randomOffers}
            location={selectedLocation}
            cuisines={cuisines}
            filters={searchFilters}
            page={page}
          />
        )}
        {device === 'desktop' && (
          <FoodablesDesktop
            offers={offers}
            randomOffers={randomOffers}
            location={selectedLocation}
            cuisines={cuisines}
            filters={searchFilters}
            page={page}
          />
        )}
        <style jsx>{`
          .wrapper {
            height: 100%;
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
  const device = res ? req.device.type : cookies.get('fdb_device');
  const deliveryLocation = cookies.get('fdb_location');
  const isLocationSet = deliveryLocation !== undefined;

  try {
    const { locations } = await getLocations();

    if (isLocationSet) {
      if (locations.find(location => location.value === deliveryLocation)) {
        let searchFilters = { keywords: '', cuisine: [] };
        searchFilters = Object.assign(searchFilters, qs.parse(query.q));

        const { offers } = await getOffers(
          deliveryLocation,
          page,
          searchFilters
        );
        const { randomOffers } = await getRandomOffers(deliveryLocation);

        const selectedLocation = locations.find(
          location => location.value === deliveryLocation
        );

        const { cuisines } = await getCuisines();

        return {
          offers,
          randomOffers,
          selectedLocation,
          page,
          cuisines,
          searchFilters,
          device,
        };
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
