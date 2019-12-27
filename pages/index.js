import { redirectToPage } from '../helpers/utils';
import Cookies from 'universal-cookie';
import base64 from 'base-64';
import qs from 'qs';

const Index = () => <div />;

Index.getInitialProps = async ({ req, res, query }) => {
  let cookies;

  if (res) {
    cookies = new Cookies(req.headers.cookie);
  } else {
    cookies = new Cookies();
  }

  let selectedLocation;
  let landingPage;

  try {
    selectedLocation = JSON.parse(base64.decode(cookies.get('fdb_location')));
    landingPage = `/${selectedLocation.city}/${selectedLocation.slug}/`;
  } catch (e) {
    landingPage = '/select-area';
  } finally {
    let queryString = qs.stringify(query);
    if (queryString) {
      landingPage = `${landingPage}?${queryString}`;
    }
    redirectToPage(res, landingPage);
    return;
  }

  return {};
};

export default Index;
