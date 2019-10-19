import React, { useContext } from 'react';
import { Icon, Modal, Button, Input, Dropdown } from 'semantic-ui-react';
import { AppContext } from '../../helpers/contexts';
import Search from '../Search';

const SearchModal = ({ cuisines, filters }) => {
  const { searchModalOpen, setSearchModalOpen } = useContext(AppContext);

  return (
    <Modal closeIcon basic centered={false} open={searchModalOpen} onClose={() => setSearchModalOpen(false)}>
      <Modal.Content>
        <Search cuisines={cuisines} filters={filters} onSearch={() => setSearchModalOpen(false)} />
      </Modal.Content>
    </Modal>
  );
};

const Header = ({ cuisines, filters }) => {
  const { setSidebarVisible, setSearchModalOpen } = useContext(AppContext);

  return (
    <header>
      <div className="wrapper">
        <nav>
          <Icon name="content" onClick={() => setSidebarVisible(true)} />
        </nav>
        <div className="logoWrapper">
          <a href="/">
            <img className="logo" src="/static/logo.svg" alt="Foodable logo" />
          </a>
        </div>
        <ul className="menuWrapper">
          <li>
            <a className="add2favs" href="/favourites">
              <Icon name="heart outline" />
            </a>
          </li>
          <li>
            <Icon name="search" onClick={() => setSearchModalOpen(true)} />
          </li>
        </ul>
      </div>
      <SearchModal cuisines={cuisines} filters={filters} />
      <style jsx>{`
        header {
          padding: 0;
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
          padding: 5px 0;
        }
        .logo {
          max-width: 170px;
          margin-top: 7px;
        }
        ul.menuWrapper {
          list-style: none;
          display: flex;
          margin: 0;
          padding: 0;
          justify-content: flex-end;
          height: 100%;
        }
        ul.menuWrapper li {
          border-left: 1px solid #eaeaea;
          padding: 0 10px;
          display: flex;
          align-items: center;
        }
        ul.menuWrapper li:last-child {
          padding-right: 0;
        }
        :global(.menuWrapper i) {
          margin: 0;
        }
        :global(.add2favs i) {
          font-weight: bold;
          margin-top: 5px;
          color: rgba(0, 0, 0, 0.87);
        }
      `}</style>
    </header>
  );
};

export default Header;
