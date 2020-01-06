import React, { useEffect } from 'react';
import { Icon } from 'semantic-ui-react';
import { device } from '../helpers/device';
import { trackEvent } from '../helpers/utils';

const NoResults = ({ isSearch }) => {
  useEffect(() => {
    trackEvent('no-results', 'engagement', window.location.href);
  }, []);

  return (
    <div className="wrapper">
      {isSearch ? (
        <h1 className="heading">
          Oops, No results found
          <small>We can't seem to find any offers that matches your search</small>
        </h1>
      ) : (
        <h1 className="heading">
          Oops, No more pages
          <small>Seems like you've reached the end of the line</small>
        </h1>
      )}
      <p>But fear not, we have more deals!</p>
      <a href="/" className="btn">
        <span className="flex">
          See all food deals
          <Icon name="angle right" />
        </span>
      </a>
      <style jsx>{`
        .wrapper {
          text-align: center;
          padding: 30px 0;
        }
        .heading {
          font-size: 1.4rem;
        }
        small {
          margin-top: 10px;
          display: block;
          line-height: 1.2em;
          color: #444;
        }
        p {
          margin-top: 30px;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .flex {
          display: flex;
          align-items: center;
        }
        .btn {
          background: #f34343;
          color: #fff;
          font-size: 16px;
          font-weight: bold;
          padding: 15px 50px;
          display: inline-block;
          border-radius: 40px;
        }
        @media ${device.tablet} {
          .heading {
            font-size: 1.7rem;
          }
          .btn {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
};

export default NoResults;
