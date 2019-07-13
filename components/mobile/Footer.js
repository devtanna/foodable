import SubscribeField from '../SubscribeField';
import ContactUsModal from '../ContactUsModal';
import Link from 'next/link';

const Footer = () => (
  <footer>
    <div className="wrapper">
      <SubscribeField />
      <div className="nav">
        <div className="navHeading">About Foodable</div>
        <ul className="linksList">
          <li>
            <a>
              <ContactUsModal />
            </a>
          </li>
          <li>
            <Link href="/about-us">
              <a>About Us</a>
            </Link>
          </li>
          <li>
            <Link href="/privacy-policy">
              <a>Privacy Policy</a>
            </Link>
          </li>
          <li>
            <Link href="/terms">
              <a>Terms &amp; Conditions</a>
            </Link>
          </li>
        </ul>
      </div>
      <div className="logoWrapper">
        <img className="logo" src="/static/logo-white.svg" alt="Foodable.ae" />
        <div className="copyrights">
          Copyright 2019 foodable.ae | All rights reserved.
        </div>
      </div>
    </div>
    <style jsx>{`
      footer {
        background-color: #1f2021;
        color: #fff;
      }
      .wrapper {
        width: 100%;
        padding: 15px;
        display: grid;
        grid-gap: 30px;
      }
      .logoWrapper {
        text-align: center;
      }
      .logo {
        max-width: 200px;
      }
      .copyrights {
        font-size: 11px;
        color: #ccc;
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
        cursor: pointer;
      }
      .linksList li a:hover {
        text-decoration: underline;
      }
    `}</style>
  </footer>
);

export default Footer;
