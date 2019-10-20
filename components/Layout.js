import FooterDesktop from './desktop/Footer';
import FooterMobile from './mobile/Footer';
import { device } from '../helpers/device';
import { Breadcrumb } from 'semantic-ui-react';

const Layout = props => (
  <div className={`pageWrapper${props.isStatic ? ' static' : ''}`}>
    <header>
      <div className="logoWrapper">
        <a href="/">
          <img className="logo" src="/static/logo.svg" alt="Foodable logo" />
        </a>
      </div>
    </header>
    <main>
      <div className="mainWrapper">
        {props.breadcrumbs && (
          <div className="breadcrumbs__wrapper">
            <Breadcrumb icon="right angle" sections={props.breadcrumbs} />
          </div>
        )}
        <div className="contentWrapper">{props.children}</div>
      </div>
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
      .breadcrumbs__wrapper {
        margin-bottom: 5px;
      }
      .mainWrapper {
        max-width: 1200px;
        width: 100%;
        margin: 0 auto;
      }
      .pageWrapper.static .contentWrapper {
        background: #fff;
        padding: 20px;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
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
