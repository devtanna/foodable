import { Button, Icon } from 'semantic-ui-react';

const NoResults = ({ isSearch }) => (
  <div className="wrapper">
    {isSearch ? (
      <h2>
        Oops, No results found
        <small>We can't seem to find any offers that matches your search</small>
      </h2>
    ) : (
      <h2>
        Oops, No more pages
        <small>Seems like you've reached the end of the line</small>
      </h2>
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
        font-size: 18px;
        font-weight: bold;
        padding: 15px 50px;
        display: inline-block;
        border-radius: 40px;
      }
    `}</style>
  </div>
);

export default NoResults;
