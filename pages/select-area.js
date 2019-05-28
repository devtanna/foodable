import React from 'react';
import { device } from '../helpers/device';
import Landing from '../components/Landing';
import { getLocations } from '../helpers/api';

const SelectArea = ({ locations }) => {
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

SelectArea.getInitialProps = async ({ req, res }) => {
  return getLocations();
};

export default SelectArea;
