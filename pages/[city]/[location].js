import React, { Fragment, useEffect } from 'react';
import Head from 'next/head';
import { redirectToPage, trackPageView, deslugify, capitalizeFirstLetter, removeObjEmpty } from '../../helpers/utils';
import FoodablesMobile from '../../components/mobile/';
import FoodablesDesktop from '../../components/desktop/';
import { getOffers, getRandomOffers, getLocations, getCuisines } from '../../helpers/api';
import { CITIES_MAP, PAGE_SIZE } from '../../helpers/constants';
import Cookies from 'universal-cookie';
import qs from 'qs';
import base64 from 'base-64';
import _pick from 'lodash/pick';
import _findKey from 'lodash/findKey';

const PageHead = ({ page, location, filters }) => {
  const title = `Discover & compare ${
    filters.cuisine.length > 0
      ? filters.cuisine.map(x => capitalizeFirstLetter(deslugify(x))).join(' and ') + ' cuisine '
      : ''
  }food delivery deals and offers in ${location.text}, ${capitalizeFirstLetter(location.city)} ${
    filters.keywords !== '' ? ", matching keywords '" + filters.keywords + "'" : ''
  } | Foodable.ae${page > 1 ? ' - Page ' + page : ''}`;
  const description = `Compare food delivery promotions and discover great deals from top food delivery websites. Search by restaurant name or your favorite cuisine and find top deals in your area. ${
    filters.cuisine.length > 0
      ? ' ' +
        filters.cuisine.map(x => capitalizeFirstLetter(deslugify(x))).join(' and ') +
        ' restaurants in ' +
        location.text +
        ', ' +
        capitalizeFirstLetter(location.city) +
        '.'
      : ''
  }${
    filters.keywords !== ''
      ? " Restaurants matching keyword '" +
        filters.keywords +
        "' in " +
        location.text +
        ', ' +
        capitalizeFirstLetter(location.city) +
        '.'
      : ''
  }`;
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <script src="https://feedier.com/js/widgets/widgets.min.js" type="text/javascript" async />
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
  utmSource,
}) => {
  useEffect(() => {
    let _filters = qs.stringify(removeObjEmpty(searchFilters));
    if (_filters) {
      trackPageView('search', `/${selectedLocation.city}/${selectedLocation.slug}/?${_filters}`);
    } else {
      trackPageView('homepage', `/${selectedLocation.city}/${selectedLocation.slug}/${utmSource ? 'pwa/' : ''}`);
    }
  }, []);

  return (
    <Fragment>
      <PageHead page={page} location={selectedLocation} filters={searchFilters} />
      <div className="wrapper">
        {(device === 'phone' || device === 'tablet') && (
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
        <div 
          className="feedier-widget" 
          data-type="engager" 
          data-layout="horizontal" 
          data-shake="true" 
          data-position="right" 
          data-in-site="true" 
          data-carrier-id="14121" 
          data-key="JicKJF1DAjlDe1T0HFp5iavWmJZ3mxm1"
        />
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
  const citySlug = _findKey(CITIES_MAP, { slug: city });

  try {
    // Whenever /city/location page is called, update fdb_location cookie with the current
    // city and area, in case of errors, redirect to select-area page
    let selectedLocation = {
      city,
      slug: location,
      text: deslugify(location),
    };

    // Let's start getting offers data, first, check if any search filters or page params are set
    let searchFilters = { keywords: '', cuisine: [] };
    searchFilters = Object.assign(searchFilters, _pick(qs.parse(query), ['keywords', 'cuisine']));

    const page = query.page ? Number(query.page) : 1;

    const device = res ? req.device.type : cookies.get('fdb_device');

    const pageSize = device === 'phone' ? PAGE_SIZE.mobile : PAGE_SIZE.desktop;

    let offers = [];
    try {
      // Get offers by location, page and search filters
      const res = await getOffers(location, page, searchFilters, citySlug, pageSize);
      if (res) {
        offers = res.offers;
      }
    } catch(e) {
      console.log('Error while fetching offers:', e);
    }

    const isSearchPage = searchFilters.keywords !== '' || searchFilters.cuisine.length > 0;

    if (offers.length === 0 && page === 1 && !isSearchPage) {
      redirectToPage(res, '/select-area');
      return;
    }

    // maxAge 6 months
    res.cookie('fdb_location', base64.encode(JSON.stringify(selectedLocation)), { path: '/', maxAge: 1.577e+10 }); 

    // Visitors count cookie, to be used to fire up survey from tag manager
    const visitsCount = Number(cookies.get('fdb_vc')) || 0;
    res.cookie('fdb_vc', visitsCount + 1, { path: '/', maxAge: 1.577e+10 });

    let cuisines = [];
    try {
      // All good so far? get cuisines and send back the needed information
      const res = await getCuisines(citySlug);
      if (res) {
        cuisines = res.cuisines;
      }
    } catch(e) {
      console.log('Error while fetching cuisines:', e);
    }

    const utmSource = query['utm_source'];

    return {
      offers,
      selectedLocation,
      page,
      cuisines,
      searchFilters,
      device,
      utmSource,
    };
  } catch (e) {
    console.log(e);
    return {};
  }
};

export default Location;
