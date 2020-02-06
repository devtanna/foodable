import React from 'react';
import { device } from '../helpers/device';
import LocationSelector from './LocationSelector';

const Landing = ({ locations }) => {
  return (
    <main>
      <div className="wrapper">
        <img className="logo" src="/static/logo.svg" alt="Foodable.ae" />
        <h1>Discover and compare the best food deals from top food delivery websites!</h1>
        <div className="partners">
          <img src="/static/restaurant-banners/zomato_lp.webp" alt="Zomato partner" />
          <img src="/static/restaurant-banners/talabat_lp.webp" alt="Talabat partner" />
          <img src="/static/restaurant-banners/deliveroo_lp.webp" alt="Deliveroo partner" />
          <img src="/static/restaurant-banners/eateasy_lp.webp" alt="Eat easy partner" />
        </div>
        <LocationSelector locations={locations} />
      </div>
      <style jsx>{`
        main {
          height: 100%;
          background: #fff url('/static/lp-bg-s.webp') 30% 100% no-repeat;
          background-size: contain;
        }
        .wrapper {
          max-width: 800px;
          margin: 0 auto;
          padding-top: 30px;
          text-align: center;
        }
        .logo {
          width: 100%;
          max-width: 200px;
          margin: 0 auto;
        }
        h1 {
          font-size: 20px;
          color: #7c7c7c;
          margin: 15px 30px 0;
        }
        .partners {
          margin: 15px auto 30px;
          display: flex;
          justify-content: center;
        }
        .partners img {
          width: 38px;
          height: 38px;
          margin: 0 5px;
          border-radius: 4px;
        }
        @media ${device.tablet} {
          main {
            background: #fff url('/static/lp-bg.webp') 0 125% no-repeat;
            background-size: 100%;
          }
          .wrapper {
            padding-top: 50px;
          }
          .logo {
            max-width: 300px;
          }
          h1 {
            font-size: 1.7rem;
            margin: 0 auto;
            max-width: 500px;
            margin-top: 30px;
          }
          .partners {
            margin: 30px auto 60px;
          }
          .partners img {
            width: 50px;
            height: 50px;
            margin: 0 10px;
          }
        }
      `}</style>
    </main>
  );
};

export default Landing;
