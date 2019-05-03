import React, { useContext } from 'react';
import { Icon, Modal, Button, Input, Dropdown } from 'semantic-ui-react';
import { AppContext } from '../../helpers/contexts';

const cuisines = [
  { key: 'angular', text: 'Angular', value: 'angular' },
  { key: 'css', text: 'CSS', value: 'css' },
  { key: 'design', text: 'Graphic Design', value: 'design' },
]

const SearchModal = () => {
  const { searchModalOpen, setSearchModalOpen } = useContext(AppContext);

  return (
    <Modal dimmer="blurring" closeIcon basic centered={false} open={searchModalOpen} onClose={() => setSearchModalOpen(false)}>
      <Modal.Content>
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
          <Button size="large" className="searchBtn">Search</Button>
        </section>
      </Modal.Content>
      <style jsx>{`
        .wrapper {
          margin: 50px 0 30px 0;
          display: grid;
          grid-row-gap: 15px;
        }
        .actions {
          text-align: center;
        }
      `}</style>
    </Modal>
  );
};

const Header = () => {
  const { setSidebarVisible, setSearchModalOpen } = useContext(AppContext);

  return (
    <header>
      <div className="wrapper">
        <div><Icon name="search" onClick={() => setSearchModalOpen(true)} /></div>
        <div className="logoWrapper">
          <img className="logo" src="/static/logo.svg" alt="Foodable logo" />
        </div>
        <nav>
          <div className="menuToggle">
            <Icon name="content" onClick={() => setSidebarVisible(true)} />
          </div>
        </nav>
      </div>
      <SearchModal />
      <style jsx>{`
        header {
          padding: 10px 0;
          box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 1;
        }
        .wrapper {
          padding: 0 15px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          align-items: center;  
          justify-content: center;
        }
        .logoWrapper {
          text-align: center;
        }
        .logo {
          max-width: 170px;
        }
        nav {
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
    </header>
  );
};

export default Header;
