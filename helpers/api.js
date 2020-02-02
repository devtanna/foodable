import ApolloClient from 'apollo-client';
import { gql } from 'apollo-boost';
import fetch from 'isomorphic-unfetch';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { PAGE_SIZE } from './constants';

const settings = require('../settings')();

const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
};

const client = new ApolloClient({
  link: createHttpLink({
    uri: settings.BACKEND_ENDPOINT,
    fetch: fetch,
  }),
  cache: new InMemoryCache(),
  defaultOptions: defaultOptions,
});

export const getOffers = async (location, page, searchFilters, city, pageSize = PAGE_SIZE.desktop) => {
  try {
    const queryParams = [];
    queryParams.push(`page: ${page}`);
    queryParams.push(`pageSize: ${pageSize}`);
    queryParams.push(`locationSlug: "${location}"`);
    queryParams.push(`city: "${city}"`);

    if (searchFilters.keywords !== '') {
      queryParams.push(`keywords: "${searchFilters.keywords}"`);
    }

    if (searchFilters.cuisine.length > 0) {
      queryParams.push(`cuisine: "${searchFilters.cuisine.join(' ')}"`);
    }

    const res = await client.query({
      query: gql`
        {
          offers(${queryParams.join(',')}) {
            _id
            offers {
              title,
              cuisine,
              cuisineArray,
              offer,
              score,
              source,
              locationSlug,
              rating,
              cost_for_two,
              votes,
              image,
              href,
              deliveryTime,
              deliveryCharge,
              minimumOrder
            }
          }
        }
      `,
    });

    return res.data;
  } catch (e) {
    console.log('Error in API getOffers:', e);
  }
};

export const getRandomOffers = async location => {
  try {
    const res = await client.query({
      query: gql`
        {
				  randomOffers(count: 4, page: 1, pageSize: 4, locationSlug: "${location}") {
				    _id,
				    title,
				    cuisine,
				    offer,
				    score,
				    source,
				    locationSlug,
				    rating,
				    cost_for_two,
				    votes,
				    image,
				    href
				  }
				}
      `,
    });

    return res.data;
  } catch (e) {
    console.log('Error in API getRandomOffers:', e);
  }
};

export const getLocations = async () => {
  try {
    const res = await client.query({
      query: gql`
        {
          locations: locationsWithOffers {
            key: _id
            value: locationSlug
            text: locationName
            city
          }
        }
      `,
    });
    return res.data;
  } catch (e) {
    console.log('Error in API getLocations:', e);
  }
};

export const getCuisines = async city => {
  try {
    const res = await client.query({
      query: gql`
        {
          cuisines: fetchCuisine(city: "${city}") {
            tags
          }
        }
      `,
    });
    return { cuisines: res.data.cuisines[0].tags };
  } catch (e) {
    console.log('Error in API getCuisines:', e);
  }
};

export const getFavourites = async (location, page = 1, favourites) => {
  try {
    const res = await client.query({
      query: gql`
        {
          favourites
          (
            page: ${page}, 
            pageSize: 50, 
            locationSlug: "${location}", 
            favourites: [${favourites.map(x => `"${x}"`)}]
          ) 
          { 
            _id 
            offers { 
              title 
              cuisine 
              cuisineArray 
              offer 
              score 
              source 
              city
              locationSlug 
              rating 
              cost_for_two 
              votes 
              image 
              href 
              deliveryTime,
              deliveryCharge,
              minimumOrder
            } 
          }
        }
      `,
    });

    return res.data;
  } catch (e) {
    console.log('Error in API getFavourites:', e);
  }
};

// Fetch Queries
const TIMEOUT_MS = 10000;

const endpoints = {
  subscribe: '/subscribe',
  contactus: '/contactus',
};

function getHeaders() {
  return {
    Accept: 'application/json',
    'Content-type': 'application/json',
  };
}

function timeoutPromise(promise) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('promise timeout'));
    }, TIMEOUT_MS);
    promise.then(
      res => {
        clearTimeout(timeoutId);
        resolve(res);
      },
      err => {
        clearTimeout(timeoutId);
        reject(err);
      }
    );
  });
}

async function request(path, method = 'GET', body = {}) {
  const options = {
    method: method,
    headers: getHeaders(),
    credentials: 'same-origin',
  };

  if (method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    let res = await timeoutPromise(fetch(path, options));
    let data = await res.json();
    if (!res.ok) {
      let message = data.message || 'Something went wrong, please try again.';
      return Promise.reject({ message });
    }
    return data;
  } catch (error) {
    return Promise.reject({
      message: 'Something went wrong, please try again.',
    });
  }
}

export function subscribe(email, city, area) {
  return request(endpoints['subscribe'], 'POST', { email, city, area });
}

export function contactUs(email, message) {
  return request(endpoints['contactus'], 'POST', { email, message });
}
