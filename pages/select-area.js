import React, { useEffect } from 'react';
import { trackPageView } from '../helpers/utils';
import Landing_B from '../components/Landing_B';
import { getLocations } from '../helpers/api';
import _groupBy from 'lodash/groupBy';
import Cookies from 'universal-cookie';

const SelectArea = ({ locations, utmSource, device = 'phone' }) => {
  useEffect(() => {
    if (utmSource && utmSource === 'pwa') {
      trackPageView('landingpage', '/select-area/pwa');
    } else {
      trackPageView('landingpage', '/select-area');
    }
  }, []);

  return (
    <div className="wrapper">
      <div id="landingA" className="wrapper">
        <Landing_B device={device} locations={locations} />
      </div>
      <style jsx>{`
        .wrapper {
          height: 100%;
        }
      `}</style>
    </div>
  );
};

SelectArea.getInitialProps = async ({ req, res, query }) => {
  let cookies;

  if (res) {
    cookies = new Cookies(req.headers.cookie);
  } else {
    cookies = new Cookies();
  }

  const { locations } = await getLocations();
  const groupedLocations = _groupBy(locations, 'city');
  const utmSource = query['utm_source'];
  const device = res ? req.device.type : cookies.get('fdb_device');
  return { locations: groupedLocations, utmSource, device };
};

export default SelectArea;
