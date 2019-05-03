const PopularDeals = () => (
  <section className="wrapper">
    <div className="deal deliveroo">
      <div className="imgWrapper">
        <img src="/static/placeholder.png" />
      </div>
      <div className="content">
        <div className="offer offer--A">Buy one get one free!</div>
        <div className="title truncate">Manoushe Street</div>
      </div>
      <div className="footer"><span>Available on:</span></div>
    </div>
    <div className="deal carriage">
      <div className="imgWrapper">
        <img src="/static/placeholder.png" />
      </div>
      <div className="content">
        <div className="offer offer--B">60% Off on all orders!</div>
        <div className="title truncate">Charleys Philly Steaks</div>
      </div>
      <div className="footer"><span>Available on:</span></div>
    </div>
    <div className="deal deliveroo">
      <div className="imgWrapper">
        <img src="/static/placeholder.png" />
      </div>
      <div className="content">
        <div className="offer offer--B">80% Off on all orders!</div>
        <div className="title truncate">Bab Sharqi</div>
      </div>
      <div className="footer"><span>Available on:</span></div>
    </div>
    <div className="deal carriage">
      <div className="imgWrapper">
        <img src="/static/placeholder.png" />
      </div>
      <div className="content">
        <div className="offer offer--A">Buy one get one free!</div>
        <div className="title truncate">Lads Burger</div>
      </div>
      <div className="footer"><span>Available on:</span></div>
    </div>
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
      }
      .imgWrapper img {
        width: 100%;
        object-fit: cover;
      }
      .content {
        padding: 20px;
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
        background: linear-gradient(270deg, #3ACA7C 18.23%, #88E0D0 100%);
      }
      .offer--B {
        background: linear-gradient(270deg, #FF8A00 18.23%, #FFBA52 100%);
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
        padding: 10px 20px;
        align-items: center;
        background-size: 140px 36px;
        background-position: 100% 2px;
        background-repeat: no-repeat;
      }
      .deal.deliveroo .footer {
        background-color: #00CCBC;
        background-image: url('/static/restaurant-banners/deliveroo.png'); 
      }
      .deal.carriage .footer {
        background-color: #E0513D; 
        background-image: url(/static/restaurant-banners/carriage.png);
      }
      .truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `}</style>
  </section>
);

export default PopularDeals;
