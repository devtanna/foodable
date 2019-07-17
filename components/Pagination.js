import { Icon } from 'semantic-ui-react';
import { device } from '../helpers/device';

const Pagination = ({ page }) => {
  let current = Number(page);
  let prevPage = current - 1;
  let nextPage = current + 1;

  return (
    <div className="wrapper">
      {prevPage > 0 ? (
        <a href={`/?page=${prevPage}`}>
          <Icon name="angle left" /> Previous Page
        </a>
      ) : (
        <div />
      )}
      <a href={`/?page=${nextPage}`}>
        Next Page <Icon name="angle right" />
      </a>
      <style jsx>{`
        .wrapper {
          display: flex;
          justify-content: center;
        }
        a {
          background: #fff;
          padding: 10px 20px;
          text-align: center;
          box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.1);
          color: #938edc;
          font-weight: bold;
        }
        a:first-child {
          border-right: 1px solid #eaeaea;
        }
        a:hover {
          background: #f5f5f5;
        }
        @media ${device.tablet} {
          .wrapper {
            justify-content: space-between;
          }
          a:first-child {
            border-right: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Pagination;
