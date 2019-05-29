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

export const getOffers = async location => {
  try {
    const res = await client.query({
      query: gql`
        {
          offers(page: 1, pageSize: 20, locationSlug: "${location}") {
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
				    _id
				    title
				    cuisine
				    offer
				    score
				    source
				    locationSlug
				    rating
				    cost_for_two
				    votes
				    image
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
          locations {
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
