import Listings from './Listings';

const Foodables = ({
  offers,
  randomOffers,
  location,
  page,
  cuisines,
  filters,
}) => (
  <Listings
    offers={offers}
    randomOffers={randomOffers}
    location={location}
    cuisines={cuisines}
    filters={filters}
    page={page}
  />
);

export default Foodables;
