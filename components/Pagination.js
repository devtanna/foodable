import { Icon } from 'semantic-ui-react';
import { device } from '../helpers/device';
import { removeObjEmpty } from '../helpers/utils';
import qs from 'qs';

const getPageUrl = (page, filters) => {
  const params = Object.assign({}, filters, { page });
  return `?${qs.stringify(params)}`;
};

const Pagination = ({ listingsCount, filters, page, pageSize }) => {
  const current = Number(page);
  const prevPage = current - 1;
  const nextPage = current + 1;
  const _filters = removeObjEmpty(filters);
  const hasNext = listingsCount >= pageSize;

  return (
    <div className="wrapper">
      {prevPage > 0 ? (
        <a href={getPageUrl(prevPage, _filters)}>
          <Icon name="angle left" /> Previous Page
        </a>
      ) : (
        <div />
      )}

      {hasNext && (
        <a href={getPageUrl(nextPage, _filters)}>
          Next Page <Icon name="angle right" />
        </a>
      )}
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
