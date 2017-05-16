import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { List, Map } from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Button } from 'react-materialize';
import NotificationSystem from 'react-notification-system';

import * as api from '../../../api';

import {METADATA} from './constants';
import CasingSummary from './CasingSummary';
import CasingItem from './CasingItem';

import './CasingApp.css';

class CasingApp extends Component {
 
  constructor(props) {
    super(props);
    this.state = {
      records: List(),
      preRecords: List()
    };
  }

  componentDidMount() {
    if (this.props.asset) {
      this.loadRecords(this.props.asset);
    }
    this._notificationSystem = this.refs.notificationSystem;
  }

  componentWillReceiveProps(newProps) {
    if (newProps.asset !== this.props.asset) {
      this.loadRecords(newProps.asset);
    }
  }

  async loadRecords(asset) {
    const records = await api.getAppStorage(METADATA.recordProvider, METADATA.recordCollection, asset.get('id'), Map({limit: 0}));
    this.setState({
      records: records.sortBy(r=>r.get("timestamp"))
    });
  }

  render() {
    return (
      <div className="c-casing">
        <h4>{METADATA.title}</h4>
        <div>{METADATA.subtitle}</div>
        
        <CasingSummary
          records={this.state.records} 
          onAdd={()=>this.add()}/>

        {(this.state.records.size > 0 || this.state.preRecords.size > 0)?

          <table className="c-casing__casing-table">
            <thead>
              <tr>
                <th>{this.state.records.size}</th>
                <th className="c-casing__id-header"> I.D({this.props.convert.getUnitDisplay('shortLength')}) </th>
                <th className="c-casing__od-header"> O.D({this.props.convert.getUnitDisplay('shortLength')}) </th>
                <th className="c-casing__td-header hide-on-med-and-down"> Top Depth({this.props.convert.getUnitDisplay('length')}) </th>
                <th className="c-casing__bd-header hide-on-med-and-down"> Bottom Depth({this.props.convert.getUnitDisplay('length')}) </th>
                <th className="c-casing__length-header"> Length({this.props.convert.getUnitDisplay('length')}) </th>
                <th className="c-casing__lm-header hide-on-med-and-down"> Linear Mass({this.props.convert.getUnitDisplay('mass')}/{this.props.convert.getUnitDisplay('length')}) </th>
                <th className="c-casing__grade-header hide-on-med-and-down"> Grade </th>
                <th className="c-casing__action-header hide-on-med-and-down"> </th>
              </tr>
            </thead>
            <tbody>
              {this.state.records.map(record=> {
                return <CasingItem
                          key={record.get("_id")} 
                          record={record} 
                          convert={this.props.convert}
                          onSave={(record)=>this.saveRecord(record)}
                          onRemove={(record)=>this.removeRecord(record)}/>;
              })}

              {this.state.preRecords.map((record)=> {
                return <CasingItem
                  key={record.get("_pre_id")}
                  record={record}
                  convert={this.props.convert}
                  onSave={(record,continuousAdd)=>this.saveRecord(record,continuousAdd)}                  
                  onCancel={(preRecord)=>this.cancelAdd(preRecord)} />;
              })}
            </tbody>
          </table> :           
          <div className="c-casing__no-data">            
            <div>No Existing Casing Items</div>
            <div className="c-casing__no-data-description">Create a new one to begin</div>
          </div>
        }
          <Button floating large className='lightblue' style={{marginTop:10}} waves='light' icon='add'  onClick={(e)=>{this.add();}} />
          
          <a ref="scrollHelperAnchor"></a>
        <NotificationSystem ref="notificationSystem" noAnimation={true} />
      </div>
    );
  }

  add() {
    const record = Map({
      asset_id: this.props.asset.get('id'),
      _pre_id: new Date().getTime(),
      data: Map({})
    });
    
    this.setState({
      preRecords: this.state.preRecords.push(record)
    });
    
    setTimeout(()=>{
      ReactDOM.findDOMNode(this.refs.scrollHelperAnchor).scrollIntoView({behavior: "smooth"});
    },0);
  }

  cancelAdd(preRecord) {
    this.setState({
      preRecords: this.state.preRecords.filterNot(r => r.get('_pre_id') === preRecord.get('_pre_id'))
    });
  }

  async saveRecord(record,continuousAdd) {
    let savedRecord;
    try {
      savedRecord = record.has('_id')? 
        await api.putAppStorage(METADATA.recordProvider, METADATA.recordCollection, record.get('_id') , record) :
        await api.postAppStorage(METADATA.recordProvider, METADATA.recordCollection, record);
    }
    catch(error) {
      this._notificationSystem.addNotification({
        message: 'Error when saving a record.',
        level: 'error'
      });
    }

    if (!savedRecord) {
      return;
    }

    let index = this.state.records.findIndex(r=>r.get("_id")===savedRecord.get("_id"));                  

    if (index!==-1) { //update record
      this.setState({
        records: this.state.records.delete(index).insert(index,savedRecord)});
    }
    else { //create record id      
      let recordsAfterSave = this.state.records.push(savedRecord);
      let preRecordsAfterSave = this.state.preRecords.filterNot(r => r.get('_pre_id') === record.get('_pre_id'));

      this.setState({
        records: recordsAfterSave,
        preRecords: preRecordsAfterSave
      });
    }

    this._notificationSystem.addNotification({
      message: 'The record has been saved successfully.',
      level: 'success'
    });

    if (continuousAdd) {
      this.add();
    }
  }

  async removeRecord(record) {    
    try {
      await api.deleteAppStorage(METADATA.recordProvider, METADATA.recordCollection, record.get('_id'));
    }
    catch(error) {
      this._notificationSystem.addNotification({
        message: 'Error when deleting a record.',
        level: 'error'
      });
      return;
    }

    const recordsAfterDelete = this.state.records.filterNot(r => r.get('_id') === record.get('_id'));
    this.setState({
      records: recordsAfterDelete,
    });

    this._notificationSystem.addNotification({
      message: 'The record has been deleted successfully.',
      level: 'success'
    });

  }

 
}

CasingApp.propTypes = {
  asset: ImmutablePropTypes.map
};

export default CasingApp;
