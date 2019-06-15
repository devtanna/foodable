import ApolloClient from 'apollo-client';
import { gql } from 'apollo-boost';
import fetch from 'isomorphic-unfetch';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

const settings = require('../settings');

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

export const getOffers = async (location, page) => {
  try {
    const res = await client.query({
      query: gql`
        {
          offers(page: ${page}, pageSize: 20, locationSlug: "${location}") {
            _id
            offers {
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
        }
      `,
    });

    return res.data;
  } catch (e) {
    console.log(e);
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
    console.log(e);
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
          }
        }
      `,
    });
    return res.data;
  } catch (e) {
    console.log(e);
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

export function subscribe(email) {
  return request(endpoints['subscribe'], 'POST', { email });
}

export function contactUs(email, message) {
  return request(endpoints['contactus'], 'POST', { email, message });
}
