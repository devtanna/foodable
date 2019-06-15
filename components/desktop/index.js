import Listings from './Listings';

const Foodables = ({ offers, randomOffers, location, page }) => (
  <Listings
    offers={offers}
    randomOffers={randomOffers}
    location={location}
    page={page}
  />
);

export default Foodables;
