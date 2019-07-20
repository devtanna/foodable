import { redirectToPage } from '../helpers/utils';
import Cookies from 'universal-cookie';
import base64 from 'base-64';

const Index = () => <div />;

Index.getInitialProps = async ({ req, res, query }) => {
  let cookies;

  if (res) {
    cookies = new Cookies(req.headers.cookie);
  } else {
    cookies = new Cookies();
  }

  let selectedLocation;

  try {
    selectedLocation = JSON.parse(base64.decode(cookies.get('fdb_location')));
    redirectToPage(res, `/${selectedLocation.city}/${selectedLocation.slug}/`);
    return;
  } catch (e) {
    redirectToPage(res, '/select-area');
    return;
  }

  return {};
};

export default Index;
