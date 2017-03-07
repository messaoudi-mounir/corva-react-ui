import React, { Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';


import { SUBSCRIPTIONS } from './constants';
import DrillingTrajectoryEditor from '../common/DrillingTrajectoryEditor';

import './SurveysApp.css';

class SurveysApp extends Component {

  render() {
    return <div className="c-surveys">
      <DrillingTrajectoryEditor data={this.props.data} asset={this.props.asset} subscriptionConfig={SUBSCRIPTIONS} />
    </div>;
  }

}

SurveysApp.propTypes = {
  data: ImmutablePropTypes.map,
  asset: ImmutablePropTypes.map.isRequired
};

export default SurveysApp;