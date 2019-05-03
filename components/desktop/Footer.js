import React from 'react';
import { Input } from 'semantic-ui-react';

const Footer = () => (
  <footer>
    <div className="wrapper">
      <div className="logoWrapper">
        <img className="logo" src="/static/logo-white.svg" alt="Foodable.com" />
        <div className="copyrights">Copyright 2019 foodable.com | All rights reserved.</div>
      </div>
      <div className="nav">
        <div className="navHeading">About Foodable</div>
        <ul className="linksList">
          <li><a href="#">Contact Us</a></li>
          <li><a href="#">How does Foodable work</a></li>
          <li><a href="#">Our Culture</a></li>
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Terms &amp; Conditions</a></li>
        </ul>
      </div>
      <div className="subscribe">
        <p>Get everyday&#39;s top food promotions in your inbox, subscribe to our newsletter!</p>
        <Input 
          fluid
          action={{ color: 'orange', content: 'Subscribe' }} 
          placeholder="Email address" />
      </div>
    </div>
    <style jsx>{`
      footer {
        background-color: #1F2021;
        color: #fff;
      }
      .wrapper {
        max-width: 1200px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-gap: 30px;
        padding: 15px 0;
      }
      .logoWrapper {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      .logo {
        max-width: 200px;
      }
      .copyrights {
        margin-top: 5px;
        font-size: 11px;
        color: #CCC;
      }
      .navHeading {
        font-weight: bold;
        font-size: 16px;
        margin-bottom: 5px;
      }
      .linksList {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .linksList li {
        margin-bottom: 3px;
      }
      .linksList li a {
        color: #eaeaea;
      }
      .linksList li a:hover {
        text-decoration: underline;
      }
    `}</style>
  </footer>
);

export default Footer;
