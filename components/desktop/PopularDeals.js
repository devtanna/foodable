import { offerSources } from '../../helpers/constants';
import { trackEvent } from '../../helpers/utils';
import { device } from '../../helpers/device';

const PopularDeals = ({ deals }) => {
  return (
    <section className="wrapper">
      {deals.map((deal, index) => {
        const hasNumber = deal.offer ? Number(deal.offer.match(/\d+/)) : false;
        const offerType = hasNumber ? 'offer--A' : 'offer--B';
        const hasImg = deal.image !== '';
        const imgSrc = hasImg ? deal.image : '/static/placeholder.png';
        return (
          <a
            href={deal.href}
            target="_blank"
            key={index}
            rel="noopener"
            onClick={() =>
              trackEvent('offer_click', 'popular', deal.source, {
                restaurant_name: deal.title,
                offer_title: deal.offer,
              })
            }
            className={`deal ${deal.source}`}>
            <div className="imgWrapper">
              <img width={hasImg ? '100%' : '50%'} src={imgSrc} alt={deal.title} />
            </div>
            <div className="content">
              <div className={`offer ${offerType}`}>
                <span className="truncate">{deal.offer}</span>
              </div>
              <div className="title">{deal.title}</div>
            </div>
            <div className="footer">
              <div>Available on:</div>
              <img src={offerSources[deal.source].logo} alt={deal.source} />
            </div>
          </a>
        );
      })}
      <style jsx>{`
        .wrapper {
          display: grid;
          margin-top: 10px;
          margin-bottom: 30px;
          grid-template-columns: repeat(4, minmax(200px, 1fr));
          grid-column-gap: 20px;
        }
        .deal {
          box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.1);
          color: #333;
          display: grid;
          grid-template-rows: 200px 1fr 40px;
          background: #fff;
        }
        .imgWrapper {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .imgWrapper img {
          object-fit: cover;
          max-height: 100%;
        }
        .placeholderImg {
          display: flex;
          width: 100%;
          height: 100%;
          align-items: center;
          justify-content: center;
          background: #eaeaea;
        }
        .content {
          padding: 10px 20px;
        }
        .offer {
          background: #333;
          border-radius: 30px;
          color: #fff;
          font-weight: bold;
          font-size: 14px;
          text-transform: uppercase;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 15px;
        }
        .offer span {
          max-width: 150px;
        }
        @media ${device.laptop} {
          .offer span {
            max-width: 200px;
          }
        }
        .offer--A {
          background: linear-gradient(270deg, #3aca7c 18.23%, #88e0d0 100%);
        }
        .offer--B {
          background: linear-gradient(270deg, #ff8a00 18.23%, #ffba52 100%);
        }
        .title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 10px;
          min-height: 25px;
        }
        .footer {
          font-size: 12px;
          color: #fff;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: space-around;
        }
        .footer img {
          height: 25px;
        }
        ${Object.entries(offerSources)
          .map(
            ([key, value], index) =>
              `
	        	.deal.${key} .footer {
	        		background-color: ${value.color};
	        	}
	        `
          )
          .join('')}
        .truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }
      `}</style>
    </section>
  );
};

export default PopularDeals;
