import React, { Component } from 'react';
import { Icon } from 'react-materialize';
import moment from 'moment';

import './Alert.css';

class Alert extends Component {

  getFriendlyDataPointName(dataPoint) {
    if (dataPoint.indexOf('.') !== -1) {
      dataPoint = dataPoint.split('.').pop();
    }
    dataPoint = dataPoint.replace(/_/g, ' ');
    dataPoint = dataPoint.replace(/\b\w/g, w => w.toUpperCase());
    return dataPoint;
  }

  getFriendlyComparison(operator) {
    switch (operator) {
      case '=':
        return 'equaled';
      case '>=':
        return 'was greater than or equal to';
      case '>':
        return 'was greater than';
      case '<=':
        return 'was less than or equal to';
      case '<':
        return 'was less than';
      default:
        break;
    }

    return '';
  }

  getFriendlyTiming(definition) {
    return '30 minutes';
  }

  getFriendlyThreshold(threshold) {
    if (threshold.charAt(0) === '{') {
      threshold = this.getFriendlyDataPointName(threshold.slice(1, -1));
      return `the ${threshold} variable`;
    }

    return threshold;
  }

  getDecision(alert) {
    let dataPoints = alert.alert_definition.filters.map((filter) => {
      let sampleFunction = filter.sample_function.charAt(0).toUpperCase() + filter.sample_function.slice(1);
      let dataPoint = this.getFriendlyDataPointName(filter.data_point);
      let value = alert.data[filter.data_point];
      let comparison = this.getFriendlyComparison(filter.operator);
      let threshold = this.getFriendlyThreshold(filter.threshold);
      let timing = this.getFriendlyTiming(filter.period);
      return `${sampleFunction} ${dataPoint} of ${value} ${comparison} ${threshold} for ${timing}`;
    });

    let decision = dataPoints.join(' ' + alert.alert_definition.filter_logic.toLowerCase() + ' ');
    return decision;
  }

  formatDate(date) {
    date = moment(date);
    return date.format('M/D/YYYY h:mma');
  }

  render() {
    let decision = this.getDecision(this.props.alert);

    return (
      <div className={"c-alert c-alert-level-" + this.props.alert.alert_definition.level.toLowerCase()}>
        <div className="c-alert-contents">
            <div className="c-alert-header">
                <h3 className="pull-left">{this.props.alert.alert_definition.name}</h3>
                <div className="pull-right">
                    <span className="c-alert-asset">{this.props.alert.asset.name}</span>
                    <span className="c-alert-timestamp">{this.formatDate(this.props.alert.created_at)}</span>
                </div>
                <div className="clearfix"></div>
            </div>
            <p className="c-alert-description">{this.props.alert.alert_definition.description}</p>
            <h4 className="c-alert-decision-path-header"><Icon>swap_calls</Icon> Decision Path</h4>
            <p className="c-alert-decision-path">{decision}</p>
        </div>
      </div>
    );
  }

}

export default Alert;
