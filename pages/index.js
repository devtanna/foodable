import { device } from '../helpers/device';
import Landing from '../components/Landing';
import FoodablesMobile from '../components/mobile/';
import FoodablesDesktop from '../components/desktop/';

const Index = () => (
  <div className="wrapper">
    <div className="mobile">
      <FoodablesMobile />
    </div>
    <div className="desktop">
      <FoodablesDesktop />
    </div>
    <style jsx>{`
      :global(#__next) {
        height: 100%;
      }
      :global(input, button, select, .ui.fluid.dropdown) {
        border-radius: 0 !important;
      }
      :global(.searchBtn) {
        background: linear-gradient(270deg, #F34343 18.23%, #FF7E52 100%) !important;
        color: #fff !important;
        width: 100%;
      }
      :global(.fdbDropdown) {
        font-size: 1.12300000em !important;
      }
      .wrapper {
        height: 100%;
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

export default Index;
