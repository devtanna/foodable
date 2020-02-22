import React, { useState, useEffect } from 'react';
import { Input, Dropdown, Button } from 'semantic-ui-react';
import { slugify, trackEvent } from '../helpers/utils';
import { device } from '../helpers/device';
import qs from 'qs';

const Search = ({ cuisines, filters, onSearch }) => {
  let cuisinesOptions = [];

  cuisines.forEach(cuisine => {
    let key = slugify(cuisine);

    if (cuisinesOptions.filter(option => option.key === key).length > 0 || key === '') {
      return false;
    }

    cuisinesOptions.push({
      key: slugify(cuisine),
      text: cuisine,
      value: slugify(cuisine),
    });
  });

  const [keywords, setKeywords] = useState(filters.keywords);
  const [selectedCuisine, setSelectedCuisine] = useState(filters.cuisine);

  useEffect(() => {
    setKeywords(filters.keywords);
    setSelectedCuisine(filters.cuisine);
  }, [filters]);

  const handleSearch = () => {
    let query = {};

    if (keywords) {
      query.keywords = keywords;
      trackEvent('search', 'engagement', query.keywords);
    }

    if (selectedCuisine.length) {
      query.cuisine = selectedCuisine;
      trackEvent('search', 'engagement', query.cuisine);
    }

    if (keywords === '' && selectedCuisine.length === 0) {
      window.location.href = '/';
    } else {
      window.location.search = `${qs.stringify(query)}`;
    }

    onSearch && onSearch();
  };

  return (
    <section className="wrapper">
      <div>
        <Input
          value={keywords}
          onChange={e => setKeywords(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSearch()}
          fluid
          icon="search"
          iconPosition="left"
          size="large"
          placeholder="Search by restaurant name"
        />
      </div>
      <div>
        <Dropdown
          value={selectedCuisine}
          onChange={(e, { value }) => setSelectedCuisine(value)}
          onKeyPress={e => e.key === 'Enter' && handleSearch()}
          placeholder="Search by cuisines"
          fluid
          multiple
          search
          selection
          clearable
          closeOnChange
          options={cuisinesOptions}
          id="cuisineDropdown"
        />
      </div>
      <div>
        <Button size="large" id="searchBtn" onClick={handleSearch}>
          Search
        </Button>
      </div>
      <style jsx>{`
        .wrapper {
          margin: 50px 0 30px 0;
          display: grid;
          grid-row-gap: 15px;
        }
        :global(#searchBtn) {
          background: linear-gradient(270deg, #f34343 18.23%, #ff7e52 100%) !important;
          color: #fff !important;
          width: 100%;
        }
        :global(#cuisineDropdown) {
          font-size: 1.1em !important;
        }
        @media ${device.tablet} {
          .wrapper {
            margin: 0 auto 30px;
            display: grid;
            grid-template-columns: 1fr 1fr 100px;
            grid-column-gap: 15px;
            align-items: flex-start;
          }
        }
      `}</style>
    </section>
  );
};

export default Search;
