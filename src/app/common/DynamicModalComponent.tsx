import React from 'react';
import { connect } from 'react-redux';
import { css } from '@emotion/core';
import { Flex, Box } from '@rebass/emotion';
import {
  IMigrationCluster,
  IClusterFormObject,
  IMigrationStorage,
  IStorageFormObject,
} from '../../models';
import { Modal } from '@patternfly/react-core';
import AddClusterForm from '../cluster/components/AddClusterForm';
import AddStorageForm from '../storage/components/AddStorageForm';
import { clusterOperations } from '../cluster/duck';
import { storageOperations } from '../storage/duck';

class DynamicModalComponent extends React.Component<any, any> {
  state = {};

  handleAddItemSubmit = (type, dataItem) => {
    if (type === 'cluster') {
      this.props.addCluster(dataItem);
    }
    if (type === 'storage') {
      this.props.addStorage(dataItem);
    }
  }

  render() {
    if (this.props.modalType === 'cluster') {
      return (
        <Modal
          isOpen={this.props.isOpen}
          onClose={this.props.onHandleModalToggle}
          title="Add Cluster"
        >
          <AddClusterForm
            onAddItemSubmit={this.handleAddItemSubmit}
            onHandleModalToggle={this.props.onHandleModalToggle}
            {...this.props}
          />
        </Modal>
      );
    }
    if (this.props.modalType === 'storage') {
      return (
        <Modal
          isOpen={this.props.isOpen}
          onClose={this.props.onHandleModalToggle}
          title="Add Storage"
        >
          <AddStorageForm
            onAddItemSubmit={this.handleAddItemSubmit}
            onHandleModalToggle={this.props.onHandleModalToggle}
          />
        </Modal>
      );
    } else {
      return null;
    }

    // if(this.props.type ===
    //   'storage'){

    //   return <AddStorageModal isModalOpen={this.props.isOpen} />;
    //   }
  }
}

export default connect(
  state => ({
    migrationClusterList: state.home.migrationClusterList,
  }),
  dispatch => ({
    addCluster: values => dispatch(clusterOperations.addCluster(values)),
    addStorage: values => dispatch(storageOperations.addStorage(values)),
  }),
)(DynamicModalComponent);
