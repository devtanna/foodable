import React, { Fragment, useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ListingMobile from '../components/mobile/Listing';
import ListingDesktop from '../components/desktop/Listing';
import { Button, Icon } from 'semantic-ui-react';
import Head from 'next/head';
import Cookies from 'universal-cookie';
import { trackPageView, deslugify } from '../helpers/utils';
import { device } from '../helpers/device';
import { getFavourites } from '../helpers/api';
import { CITIES_MAP } from '../helpers/constants';
import _isEmpty from 'lodash/isEmpty';

const PageHead = () => (
  <Head>
    <title>My favourites | Foodable.ae</title>
    <meta name="description" content="My favourites at Foodable" />
  </Head>
);

const Favourites = ({ offers = {}, device = 'phone' }) => {
  const [favourites, setFavourites] = useState(offers);

  let hasFavourites = false;
  Object.entries(favourites).forEach(([location, favouritesList], index) => {
    if (favouritesList && favouritesList.length > 0) hasFavourites = true;
    return;
  });

  useEffect(() => {
    trackPageView('favourites', '/favourites');
  }, []);

  const onRemove = (location, restId) => {
    let _favourites = Object.assign({}, favourites);
    _favourites[location] = _favourites[location].filter(obj => obj._id !== restId);
    setFavourites(_favourites);
  };

  const Listing = device === 'phone' || device === 'tablet' ? ListingMobile : ListingDesktop;

  return (
    <Fragment>
      <PageHead />
      <Layout>
        {!_isEmpty(favourites) && hasFavourites ? (
          Object.entries(favourites).map(([location, favouritesList], index) => {
            if (_isEmpty(favouritesList)) return false;
            const citySlug = favouritesList[0].offers[0].city;
            const city = CITIES_MAP[citySlug].name;
            return (
              <div key={index} className="section">
                <h1 className="sectionHeading">
                  Your favorite restaurants near{' '}
                  <strong>
                    {deslugify(location)}, {city}
                  </strong>
                </h1>
                {favouritesList.map((favourite, index) => (
                  <Listing offer={favourite} onFavRemove={onRemove} disableLazyLoad={true} key={index} />
                ))}
              </div>
            );
          })
        ) : (
          <div className="noresultsWrapper">
            <h1 className="heading">
              Oops, No favourites yet
              <small>Looks like you haven't added any restaurant to your favourites list yet!</small>
            </h1>
            <p>Let's get you started right away..</p>
            <a href="/" className="btn">
              <span className="flex">
                Browse our listings
                <Icon name="angle right" />
              </span>
            </a>
          </div>
        )}
      </Layout>
      <style jsx>{`
				.section {
					margin-bottom: 30px;
					padding-bottom: 15px;
					border-bottom: 1px solid #EAEAEA;
				}
				.section:last-child {
					border-bottom: 0;
					margin-bottom: 0;
					padding-bottom: 0;
				}
				.sectionHeading {
					color: #3b3b3b;
          margin-bottom 15px;
          font-size: 18px;
          font-weight: normal;
				}
				.noresultsWrapper {
	        text-align: center;
	        padding: 30px 0;
	      }
	      .heading {
	        font-size: 1.4rem;
	      }
	      small {
	        margin-top: 10px;
	        display: block;
	        line-height: 1.2em;
	        color: #444;
	      }
	      p {
	        margin-top: 30px;
	        margin-bottom: 10px;
	        font-size: 16px;
	      }
	      .flex {
	        display: flex;
	        align-items: center;
	      }
	      .btn {
	        background: #f34343;
	        color: #fff;
	        font-size: 16px;
	        font-weight: bold;
	        padding: 15px 50px;
	        display: inline-block;
	        border-radius: 40px;
	      }
	      @media ${device.tablet} {
	        .heading {
	          font-size: 1.7rem;
	        }
	        .btn {
	          font-size: 18px;
	        }
	      }
			`}</style>
    </Fragment>
  );
};

Favourites.getInitialProps = async ({ req, res, query }) => {
  let cookies;

  if (res) {
    cookies = new Cookies(req.headers.cookie);
  } else {
    cookies = new Cookies();
  }

  const page = query.page ? query.page : 1;

  const favourites = cookies.get('fdb_favorites') || {};

  let offers = {};

  await Promise.all(
    Object.entries(favourites).map(async ([location, favouritesList], index) => {
      try {
        const { favourites } = await getFavourites(location, 1, favouritesList);
        offers[location] = favourites;
      } catch (e) {
        console.log(e);
      }
    })
  );

  const device = res ? req.device.type : cookies.get('fdb_device');

  return { offers, device };
};

export default Favourites;
