import React, { Component, PropTypes } from 'react';
import { NavItem, Navbar, Dropdown, Icon } from 'react-materialize';
import ImmutablePropTypes from 'react-immutable-proptypes';
import RoutingNavItem from './common/RoutingNavItem';

import './MainNav.css';

class MainNav extends Component {

  render() {
    return (
      <Navbar href={this.getPathToFirstDashboard()} className="c-main-nav">
        <RoutingNavItem className="navbar-brand" to={this.getPathToFirstDashboard()}>Corva</RoutingNavItem>
        {this.hasDashboards() &&
        <RoutingNavItem to={this.getPathToFirstDashboard()}>Dashboards</RoutingNavItem>}
        <Dropdown trigger={<NavItem>Assets</NavItem>}>
          <RoutingNavItem to="/assets/well"><Icon left>dashboard</Icon>All Wells</RoutingNavItem>
          <RoutingNavItem to="/assets/rig"><Icon left>dashboard</Icon>All Rigs</RoutingNavItem>
          {this.props.recentAssets && this.props.recentAssets.map(asset =>
            <RoutingNavItem key={asset.get('id')} to={`/assets/${asset.get('id')}/overview`}>
              <div className="c-main-nav__dropdown__outer-icon-circle">
                {asset.get('status') === 'active' ? <div className="c-main-nav__dropdown__inner-icon-circle-active"></div> : <div className="c-main-nav__dropdown__inner-icon-circle-inactive"></div>}
              </div>
              <div className="c-main-nav__dropdown__spacer"></div>{asset.get('name')}
            </RoutingNavItem>)}
        </Dropdown>
        {this.props.currentUser &&
          <Dropdown trigger={<NavItem className="c-user-menu"><Icon className="c-user-menu">perm_identity</Icon></NavItem>} className="c-user-menu">
            <NavItem onClick={() => this.logOut()}>Sign Out</NavItem>
          </Dropdown>
        }
      </Navbar>
      /*
        This doesn't currently seem to do anything when added, but I'm leaving it here just in case Tero has more insight into it.
        {this.props.currentUser &&
          <NavItem className="c-main-nav__current-user">
            {this.props.currentUser.getIn(['company', 'name'])}
          </NavItem>
        }*/
    );
  }

  // This takes a click event on a navitem and loads the link without a reload of the page.
  navLoad(event) {
    event.preventDefault();

    let to = event.target.href;
    to = to.replace("https://", "").replace("http://", "");
    to = to.split("/").splice(1).join("/");
    to = "/" + to;
    this.context.router["push"](to);
  }

  hasDashboards() {
    return !this.props.dashboards.isEmpty();
  }

  getPathToFirstDashboard() {
    if (this.hasDashboards()) {
      const id = this.props.dashboards.first().get('id');
      return `/dashboards/${id}`;
    } else {
      return '/';
    }
  }

  logOut() {
    this.props.logOut();
  }
  
}

MainNav.propTypes = {
  dashboards: ImmutablePropTypes.seq.isRequired,
  recentAssets: ImmutablePropTypes.list.isRequired,
  currentUser: ImmutablePropTypes.map,
  logOut: PropTypes.func.isRequired,
};

MainNav.contextTypes = {
  router: PropTypes.object.isRequired
};

export default MainNav;
