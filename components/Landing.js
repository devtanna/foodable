import React from 'react';
import { Dropdown, Button } from 'semantic-ui-react';
import { device } from '../helpers/device';

const locations = [
  { key: 'angular', text: 'Angular', value: 'angular' },
  { key: 'css', text: 'CSS', value: 'css' },
  { key: 'design', text: 'Graphic Design', value: 'design' },
]


const Landing = () => (
  <main>
    <div className="wrapper">
      <img className="logo" src="/static/logo.svg" />
      <h1>Discover and compare food deals from top local delivery services!</h1>
      <div className="ctaWrapper">
        <Dropdown 
          selection
          placeholder='Choose your city' 
          fluid 
          options={locations} 
          className="fdbDropdown"
        />
        <Dropdown 
          selection
          placeholder='Select your area' 
          fluid 
          multiple 
          search
          options={locations} 
          className="fdbDropdown"
        />
        <Button size="large" className="searchBtn">Search</Button>
      </div>
    </div>
    <style jsx>{`
      main {
        height: 100%;
        background: #fff url('/static/lp-bg-s.svg') 30% 100% no-repeat;
      }
      .wrapper {
        max-width: 800px;
        margin: 0 auto;
        padding-top: 50px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: center;
      }
      .logo {
        width: 100%;
        max-width: 290px;
        margin: 0 auto;
      }
      h1 {
        font-size: 20px;
        color: #7C7C7C;
        margin: 30px;
      }
      .ctaWrapper {
        display: grid;
        grid-row-gap: 15px;
        align-items: flex-start;
        padding: 0 30px;
        grid-column-gap: 15px;
      }
      @media ${device.mobileM} {
        .logo {
          max-width: 350px;
        }
        h1 {
          font-size: 2rem;
        }
      }
      @media ${device.mobileL} {
        main {
          background-size: 100%;
        }
      }
      @media ${device.tablet} {
        main {
          background: #fff url('/static/lp-bg.svg') 0 100% no-repeat;
          background-size: 100%;
        }
        .wrapper {
          padding-top: 100px;
        }
        h1 {
          margin: 50px 30px 100px;
        }
        .ctaWrapper {
          grid-template-columns: 1fr 1fr 100px;
        }
      }
    `}</style>
  </main>
);

export default Landing;
