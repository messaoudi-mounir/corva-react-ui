import React, { Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Button, Input, Row, Col} from 'react-materialize';
import { Map } from 'immutable';
import NotificationSystem from 'react-notification-system';
import L from 'mapbox.js';
import 'mapbox.js/theme/style.css';

import * as api from '../../../api';

import {METADATA} from './constants';
import parseLatLng from './helpers';
import './MapApp.css';

class MapApp extends Component {

  constructor(props) {
    super(props);
    L.mapbox.accessToken = 'pk.eyJ1IjoiYm9yaXMtcGV0cm92IiwiYSI6ImNqMG5nbXV4ZTAwYW8yd2xkZmJldjQ3b2QifQ.AYJSB4RNRS7kpk0q_Z4kgw';
    this.state = {};
  }

  componentDidMount() {    
    this.map = L.mapbox.map(this.mapContainer).setView([40, -74.50], 8);
    L.mapbox.styleLayer('mapbox://styles/mapbox/dark-v9').addTo(this.map);
    this._notificationSystem = this.refs.notificationSystem;
    if (this.props.asset) {
      this.loadRecords(this.props.asset);
    }
  }

  async loadRecords(asset) {
    const records = await api.getAppStorage(METADATA.recordProvider, METADATA.recordCollection, asset.get('id'), Map({limit: 1}));
    console.log(records.toJS());
    let record = records.get(0);      
    this.setState({
      record: record,
      top_hole: record?record.getIn(["data","top_hole"]):'',
      bottom_hole: record?record.getIn(["data","bottom_hole"]):''
    });
    console.log(this.state);
    this.updateMap();        
  }

  render() {
    return (      
      <div className="c-map">
        <h4>{METADATA.title}</h4>
        <div>{METADATA.subtitle}</div> 
        {this.state.top_hole!==undefined && this.state.bottom_hole!==undefined ?
          <Row className="c-map-latlng">
            <Col m={5} s={12}>
              <Input type="text"
                s={12}
                label="Asset Top Hole Location"
                defaultValue={this.state.top_hole}
                onChange={(e)=>this.setState({top_hole:e.target.value})}/>
            </Col>

            <Col m={5} s={12}>            
              <Input type="text"
                s={12}
                label="Asset Bottom Hole Location"
                defaultValue={this.state.bottom_hole}
                onChange={(e)=>this.setState({bottom_hole:e.target.value})}/>
            </Col>
            <Button waves='light' onClick={()=>this.save()}>save</Button>
          </Row>: '' }
        <NotificationSystem ref="notificationSystem"/>
        <div id="map" ref={(mapContainer)=>this.mapContainer=mapContainer}></div>        
      </div>
    );
  }
  
  async save() {    
    
    let tLatLng = parseLatLng(this.state.top_hole);
    if (tLatLng.length===2) {
      const data = Map({
        top_hole: this.state.top_hole,
        bottom_hole: this.state.bottom_hole
      });

      const record = (this.state.record || Map({
        asset_id: this.props.asset.get('id'),
        data: Map({})
      })).set("data",data);
      
      console.log(record.toJS());
      const savedRecord = record.has('_id')? 
        await api.putAppStorage(METADATA.recordProvider, METADATA.recordCollection, record.get('_id') , record) :
        await api.postAppStorage(METADATA.recordProvider, METADATA.recordCollection, record);

      this.setState({record: savedRecord});
      this.updateMap();
      
    } else {
      this._notificationSystem.addNotification({
        message: "We are not able to parse the given geolocation data.",
        level: 'error'
      });  
    }

  }

  updateMap() {
    if (!this.state.record) {
      return;
    }

    let tLatLng = parseLatLng(this.state.record.getIn(["data","top_hole"]));

    if (tLatLng.length===2) {
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
      this.marker = L.marker(tLatLng);
      this.map.addLayer(this.marker);
      this.map.setView(tLatLng,8);
    }

  }
  
}

MapApp.propTypes = {
  asset: ImmutablePropTypes.map
};

export default MapApp;
