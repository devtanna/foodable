const PopularDeals = () => (
  <section className="scroller">
    <div className="wrapper">
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
        margin-bottom: 15px;
        margin-right: -15px;
        margin-left: -10px;
      }
      .scroller::-webkit-scrollbar {
        height: 0;
        width: 0;
      }
      .wrapper {
        display: grid;
        grid-template-columns: repeat(4, minmax(200px, 1fr));
      }
      .deal {
        background: #fff;
        box-shadow: 0 1px 4px rgba(41, 51, 57, .3);
        margin: 10px;
      }
      .imgWrapper img {
        width: 100%;
        object-fit: cover;
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
        background: linear-gradient(270deg, #3ACA7C 18.23%, #88E0D0 100%);
      }
      .offer--B {
        background: linear-gradient(270deg, #FF8A00 18.23%, #FFBA52 100%);
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
        padding: 10px;
        align-items: center;
        min-height: 40px;
        background-size: 140px 36px;
        background-position: 50% 2px;
        background-repeat: no-repeat;
      }
      .footer span {
        display: none;
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
