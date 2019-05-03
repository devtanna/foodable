import React from 'react';
import { Input, Dropdown, Button } from 'semantic-ui-react';

const cuisines = [
  { key: 'angular', text: 'Angular', value: 'angular' },
  { key: 'css', text: 'CSS', value: 'css' },
  { key: 'design', text: 'Graphic Design', value: 'design' },
]

const Search = () => (
  <section className="wrapper">
    <div>
      <Input 
        fluid
        icon="search" 
        iconPosition="left" 
        size="large"
        placeholder="Search for restaurant" 
      />
    </div>
    <div>
      <Dropdown 
        placeholder='Cuisine' 
        fluid 
        multiple 
        search
        selection 
        options={cuisines} 
        className="fdbDropdown"
      />
    </div>
    <div>
      <Button size="large" className="searchBtn">Search</Button>
    </div>
    <style jsx>{`
      .wrapper {
        margin: 0 auto 30px;
        display: grid;
        grid-template-columns: 1fr 1fr 100px;
        grid-column-gap: 15px;
        align-items: flex-start;
      }
    `}</style>
  </section>
);

export default Search;
