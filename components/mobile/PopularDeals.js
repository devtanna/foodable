import { offerSources } from '../../helpers/constants';
import { trackEvent } from '../../helpers/utils';

const PopularDeals = ({ deals }) => (
  <section className="scroller">
    <div className="wrapper">
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
            onClick={() =>
              trackEvent('offer_click', 'popular', deal.source, deal.title)
            }
            className={`deal ${deal.source}`}>
            <div className="imgWrapper">
              <img
                width={hasImg ? '100%' : '50%'}
                src={imgSrc}
                alt={deal.title}
              />
            </div>
            <div className="content">
              <div className={`offer ${offerType}`}>
                <span className="truncate">{deal.offer}</span>
              </div>
              <div className="title">{deal.title}</div>
            </div>
            <div className="footer">
              <img src={offerSources[deal.source].logo} alt={deal.source} />
            </div>
          </a>
        );
      })}
    </div>
    <style jsx>{`
      .scroller {
        overflow-x: auto;
        scroll-behavior: smooth;
        -webkit-scroll-snap-points-x: repeat(200px);
        -ms-scroll-snap-points-x: repeat(200px);
        scroll-snap-points-x: repeat(200px);
        -webkit-scroll-snap-type: mandatory;
        -ms-scroll-snap-type: mandatory;
        scroll-snap-type: mandatory;
        -webkit-overflow-scrolling: touch;
        margin-right: -15px;
        margin-left: -10px;
      }
      .scroller::-webkit-scrollbar {
        height: 0;
        width: 0;
      }
      .wrapper {
        display: grid;
        margin: 10px;
        grid-template-columns: repeat(4, minmax(200px, 1fr));
        grid-column-gap: 20px;
      }
      .deal {
        box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.1);
        color: #333;
        display: grid;
        grid-template-rows: 150px 1fr 35px;
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
      .content {
        padding: 10px;
      }
      .offer {
        background: #333;
        border-radius: 30px;
        color: #fff;
        font-weight: bold;
        font-size: 12px;
        text-transform: uppercase;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 15px;
      }
      .offer--A {
        background: linear-gradient(270deg, #3aca7c 18.23%, #88e0d0 100%);
      }
      .offer--B {
        background: linear-gradient(270deg, #ff8a00 18.23%, #ffba52 100%);
      }
      .title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
        min-height: 25px;
      }
      .footer {
        font-size: 12px;
        color: #fff;
        font-weight: bold;
        display: flex;
        padding: 10px 20px;
        align-items: center;
        justify-content: center;
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
        max-width: 150px;
      }
    `}</style>
  </section>
);

export default PopularDeals;
