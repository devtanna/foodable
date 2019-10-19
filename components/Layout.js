import FooterDesktop from './desktop/Footer';
import FooterMobile from './mobile/Footer';
import { device } from '../helpers/device';

const Layout = props => (
  <div className="pageWrapper">
    <header>
      <div className="logoWrapper">
        <a href="/">
          <img className="logo" src="/static/logo.svg" alt="Foodable logo" />
        </a>
      </div>
    </header>
    <main>
      <div className="mainWrapper">{props.children}</div>
    </main>
    <div>
      <div className="mobile">
        <FooterMobile />
      </div>
      <div className="desktop">
        <FooterDesktop />
      </div>
    </div>
    <style jsx>{`
      .pageWrapper {
        height: 100%;
        display: grid;
        grid-template-rows: auto 1fr auto;
      }
      header {
        padding: 10px;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
        position: relative;
        z-index: 1;
      }
      .logoWrapper {
        text-align: center;
      }
      .logo {
        max-width: 225px;
      }
      main {
        height: 100%;
        background-color: #fafafa;
        padding: 30px 15px;
      }
      .mainWrapper {
        max-width: 1200px;
        width: 100%;
        margin: 0 auto;
      }
      .desktop {
        display: none;
      }
      @media ${device.tablet} {
        .mobile {
          display: none;
        }
        .desktop {
          display: block;
        }
      }
    `}</style>
  </div>
);

export default Layout;
