import React, { Fragment, useContext } from 'react';
import { Icon, Menu, Sidebar } from 'semantic-ui-react';
import { AppContext } from '../../helpers/contexts';
import Listings from './Listings';

const Foodables = () => {
  const { sidebarVisible, setSidebarVisible } = useContext(AppContext);

  return (
    <Fragment>
      <Sidebar.Pushable>
        <Sidebar
          as={Menu}
          direction='right'
          animation='overlay'
          onHide={() => setSidebarVisible(false)}
          vertical
          visible={sidebarVisible}
          width='thin'
        >
          <Menu.Item>
            <div className="location__current">
              <Icon name="map marker alternate" size="big" color="grey" /> 
              <div>
                <div className="addressHeading">Delivery address:</div>
                <div className="address">Dubai, Umm al Sheif</div>
              </div>
            </div>
            <div className="location__change">
              <a href="#"><Icon name="edit outline" /> Change Location</a>
            </div>
          </Menu.Item>
        </Sidebar>
        <Sidebar.Pusher dimmed={sidebarVisible}>
          <Listings />
        </Sidebar.Pusher>
      </Sidebar.Pushable>
      <style jsx>{`
        .location__current {
          text-align: center;
        }
        .addressHeading {
          margin-top: 5px;
          margin-bottom: 2px;
          font-size: 10px;
          color: #666;
        }
        .address {
          color: #333;
        }
        .location__change {
          font-size: 12px;
          margin-top: 10px;
        }
      `}</style>
    </Fragment>
  );
}

export default Foodables;
