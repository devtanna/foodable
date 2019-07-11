import React, { useContext } from 'react';
import Link from 'next/link';
import { Icon, Modal, Button, Input, Dropdown } from 'semantic-ui-react';
import { AppContext } from '../../helpers/contexts';
import Search from '../Search';

const SearchModal = ({ cuisines, filters }) => {
  const { searchModalOpen, setSearchModalOpen } = useContext(AppContext);

  return (
    <Modal
      closeIcon
      basic
      centered={false}
      open={searchModalOpen}
      onClose={() => setSearchModalOpen(false)}>
      <Modal.Content>
        <Search
          cuisines={cuisines}
          filters={filters}
          onSearch={() => setSearchModalOpen(false)}
        />
      </Modal.Content>
    </Modal>
  );
};

const Header = ({ cuisines, filters }) => {
  const { setSidebarVisible, setSearchModalOpen } = useContext(AppContext);

  return (
    <header>
      <div className="wrapper">
        <div>
          <Icon name="search" onClick={() => setSearchModalOpen(true)} />
        </div>
        <div className="logoWrapper">
          <Link href="/">
            <a>
              <img
                className="logo"
                src="/static/logo.svg"
                alt="Foodable logo"
              />
            </a>
          </Link>
        </div>
        <nav>
          <div className="menuToggle">
            <Icon name="content" onClick={() => setSidebarVisible(true)} />
          </div>
        </nav>
      </div>
      <SearchModal cuisines={cuisines} filters={filters} />
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
