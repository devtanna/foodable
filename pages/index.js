import { redirectToPage } from '../helpers/utils';
import Cookies from 'universal-cookie';
import base64 from 'base-64';

const Index = () => <div />;

Index.getInitialProps = async ({ req, res, query }) => {
  const utmSource = query['utm_source'];

  let cookies;

  if (res) {
    cookies = new Cookies(req.headers.cookie);
  } else {
    cookies = new Cookies();
  }

  let selectedLocation;

  try {
    selectedLocation = JSON.parse(base64.decode(cookies.get('fdb_location')));
    let lp = `/${selectedLocation.city}/${selectedLocation.slug}/`;
    if (utmSource) {
      lp = `${lp}?utm_source=pwa`;
    }
    redirectToPage(res, lp);
    return;
  } catch (e) {
    let lp = '/select-area';
    if (utmSource) {
      lp = `${lp}?utm_source=pwa`;
    }
    redirectToPage(res, lp);
    return;
  }

  return {};
};

export default Index;
