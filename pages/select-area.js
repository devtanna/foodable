import React, { useEffect } from 'react';
import { trackPageView } from '../helpers/utils';
import Landing_A from '../components/Landing_A';
import Landing_B from '../components/Landing_B';
import { getLocations } from '../helpers/api';
import _groupBy from 'lodash/groupBy';

const SelectArea = ({ locations, utmSource }) => {
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
        <Landing_A locations={locations} />
      </div>
      <div id="landingB" className="wrapper" hidden={true}>
        <Landing_B locations={locations} />
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
  const { locations } = await getLocations();
  const groupedLocations = _groupBy(locations, 'city');
  const utmSource = query['utm_source'];
  return { locations: groupedLocations, utmSource };
};

export default SelectArea;
