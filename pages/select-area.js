import React, { useEffect } from 'react';
import { trackPageView } from '../helpers/utils';
import Landing from '../components/Landing';
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
      <Landing locations={locations} />
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
