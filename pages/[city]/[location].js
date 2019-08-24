import React, { Fragment, useEffect } from 'react';
import Head from 'next/head';
import { device } from '../../helpers/device';
import { redirectToPage, trackPageView, deslugify, capitalizeFirstLetter, removeObjEmpty } from '../../helpers/utils';
import FoodablesMobile from '../../components/mobile/';
import FoodablesDesktop from '../../components/desktop/';
import {
  getOffers,
  getRandomOffers,
  getLocations,
  getCuisines,
} from '../../helpers/api';
import { CITIES } from "../../helpers/constants";;
import Cookies from 'universal-cookie';
import qs from 'qs';
import base64 from 'base-64';
import _pick from 'lodash/pick';

const PageHead = ({ page, location, filters }) => {
  const title = `Discover & compare ${filters.cuisine.length > 0 ? filters.cuisine.map(x => capitalizeFirstLetter(deslugify(x))).join(' and ') + " cuisine " : ''}food deals and offers in ${location.text}, ${capitalizeFirstLetter(location.city)} ${filters.keywords !== '' ? ", matching keywords '" + filters.keywords + "'": ''} | Foodable.ae${page > 1 ? " - Page " + page : ''}`
  const description = `Compare food promotions and discover great deals from top food delivery websites. Search by restaurant name or your favorite cuisine and find top deals in your area. ${filters.cuisine.length > 0 ? ' ' + filters.cuisine.map(x => capitalizeFirstLetter(deslugify(x))).join(' and ') + ' restaurants in ' + location.text + ', ' + capitalizeFirstLetter(location.city) + '.' : ''}${filters.keywords !== '' ? " Restaurants matching keyword '" + filters.keywords + "' in " + location.text + ', ' + capitalizeFirstLetter(location.city) + '.' : ''}`;
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Head>
  );
};

const Location = ({
  offers,
  randomOffers = [],
  selectedLocation = null,
  page = 1,
  cuisines = [],
  searchFilters = null,
  device = 'phone',
}) => {
  useEffect(() => {
    let _filters = qs.stringify(removeObjEmpty(searchFilters));
    if (_filters) {
      trackPageView('search', `/${selectedLocation.city}/${selectedLocation.slug}/?${_filters}`);  
    } else {
      trackPageView('homepage', `/${selectedLocation.city}/${selectedLocation.slug}/`);
    }
  }, []);

  return (
    <Fragment>
      <PageHead page={page} location={selectedLocation} filters={searchFilters} />
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

Location.getInitialProps = async ({ req, res, query }) => {
	let cookies;

  if (res) {
    cookies = new Cookies(req.headers.cookie);
  } else {
    cookies = new Cookies();
  }

	const { city, location } = query;

  // Validate city first, if invalid, redirect to select area page
  if (CITIES.find(obj => obj.key === city) === undefined) {
    redirectToPage(res, '/select-area');
  }

  try {
    // Whenever /city/location page is called, update fdb_location cookie with the current
    // city and area, in case of errors, redirect to select-area page
    let selectedLocation = {
      city,
      slug: location,
      text: deslugify(location)
    };
    
    // Let's start getting offers data, first, check if any search filters or page params are set
    let searchFilters = { keywords: '', cuisine: [] };
    searchFilters = Object.assign(searchFilters, _pick(qs.parse(query), ['keywords', 'cuisine']));

    const page = query.page ? query.page : 1;

    // Get offers by location, page and search filters
    const { offers } = await getOffers(
      location,
      page,
      searchFilters
    );

    if (offers.length === 0 && page === 1) {
      redirectToPage(res, '/select-area');
      return;
    }

    res.cookie('fdb_location', base64.encode(JSON.stringify(selectedLocation)));

    // All good so far? get cuisines and send back the needed information
    const { cuisines } = await getCuisines();
    const device = res ? req.device.type : cookies.get('fdb_device');

    return {
      offers,
      selectedLocation,
      page,
      cuisines,
      searchFilters,
      device,
    };
  } catch (e) {
    console.log(e);
    return {};
  }
};

export default Location;
