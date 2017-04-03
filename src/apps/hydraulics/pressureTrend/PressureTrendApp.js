import React, { Component, PropTypes } from 'react';
import { Map, List } from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';

import { SUBSCRIPTIONS, SUPPORTED_CHART_SERIES } from './constants';
import Chart from '../../../common/Chart';
import ChartSeries from '../../../common/ChartSeries';
import LoadingIndicator from '../../../common/LoadingIndicator';
import subscriptions from '../../../subscriptions';

import './PressureTrendApp.css';

class PressureTrendApp extends Component {

  constructor(props) {
    super(props);
    this.state = {series: List()};
  }

  render() {
    return (
      <div className="c-hydraulics-pressure-trend">
        {this.getData() ?
          <Chart
            xField="measured_depth"
            xAxisTitle={{text:"Measured Depth - " + this.props.convert.getUnitDisplay('length')}}
            xAxisWidth="2"
            xAxisColor="white"
            horizontal={true}
            multiAxis={true}
            size={this.props.size}
            widthCols={this.props.widthCols}>
            {this.getSeries().map(({renderType, title, type, yAxis, yAxisTitle, yAxisOpposite, data}) => (
              <ChartSeries
                key={title}
                id={title}
                type={renderType}
                title={title}
                data={data}
                yField="value"
                yAxis={yAxis}
                yAxisTitle={{text:yAxisTitle}}
                yAxisOpposite={yAxisOpposite}
                color={this.getSeriesColor(type)} />
            )).toJS()}
          </Chart> :
          <LoadingIndicator />}
      </div>
    );
  }

  getData() {
    return subscriptions.selectors.firstSubData(this.props.data, SUBSCRIPTIONS);
  }


  getSeries() {
    return List([this.getMudWeightSeries(), this.getECDSeries(), this.getStandpipePressureSeries()]);
  }

  getMudWeightSeries() {
    const type = 'mudWeight';
    return {
        renderType: `${SUPPORTED_CHART_SERIES[type].type}`,
        title: `${SUPPORTED_CHART_SERIES[type].label}`,
        type: type,
        yAxis: 0,
        yAxisOpposite: false,
        yAxisTitle: "Mud Weight - " + this.props.convert.getUnitDisplay('pressure'),
        data: List(this.getSeriesData('mud_weight', 'pressure', 'psi'))
    };
  }

  getECDSeries() {
    const type = 'equivalentCirculatingDensity';
    return {
        renderType: `${SUPPORTED_CHART_SERIES[type].type}`,
        title: `${SUPPORTED_CHART_SERIES[type].label}`,
        type: type,
        yAxis: 0,
        yAxisOpposite: false,
        yAxisTitle: "Mud Weight - " + this.props.convert.getUnitDisplay('pressure'),
        data: List(this.getSeriesData('equivalent_circulating_density', 'pressure', 'psi'))
    };
  }

  getStandpipePressureSeries() {
    const type = 'standpipePressure';
    return {
        renderType: `${SUPPORTED_CHART_SERIES[type].type}`,
        title: `${SUPPORTED_CHART_SERIES[type].label}`,
        type: type,
        yAxis: 1,
        yAxisOpposite: true,
        yAxisTitle: "Pressure - " + this.props.convert.getUnitDisplay('pressure'),
        data: List(this.getSeriesData('standpipe_pressure', 'pressure', 'psi'))
    };
  }



  getSeriesData(serieName, value_category, value_unit) {
    let data = subscriptions.selectors.firstSubData(
        this.props.data, SUBSCRIPTIONS).getIn(['data', serieName]).toJSON();
    data = this.props.convert.convertImmutables(data, 'measured_depth', 'length', 'ft'); 
    data = this.props.convert.convertImmutables(data, 'value', 'volume', 'gal'); 
    data = data.map(({measure_depth, value})  =>  
    {
        return Map({
          measure_depth: measure_depth,
          value: value
        });
    });
    return data;
  }



  getSeriesColor(seriesType) {
    if (this.props.graphColors && this.props.graphColors.has(seriesType)) {
      return this.props.graphColors.get(seriesType);
    } else {
      return SUPPORTED_CHART_SERIES[seriesType].defaultColor;
    }
  }

}

PressureTrendApp.propTypes = {
  data: ImmutablePropTypes.map,
  graphColors: ImmutablePropTypes.map,
  size: PropTypes.string.isRequired,
  widthCols: PropTypes.number.isRequired
};

export default PressureTrendApp;
