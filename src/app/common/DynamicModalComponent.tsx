import React from 'react';
import { connect } from 'react-redux';
import { css } from '@emotion/core';
import { Flex, Box } from '@rebass/emotion';
// import AddClusterModal from 'V../cluster/components/AddClusterModal';
import { IMigrationCluster, IClusterFormObject } from '../../models';
import { Modal } from '@patternfly/react-core';
import AddClusterForm from '../cluster/components/AddClusterForm';
import { clusterOperations } from '../cluster/duck';

class DynamicModalComponent extends React.Component<any, any> {
  state = {};

  handleAddClusterSubmit = (newCluster: IClusterFormObject) => {
    if (newCluster) {
      this.props.addCluster(newCluster);
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
            onAddClusterSubmit={this.handleAddClusterSubmit}
            onHandleModalToggle={this.props.onHandleModalToggle}
            {...this.props}
          />
        </Modal>

        // <AddClusterModal
        //   isOpen={this.props.isOpen}
        //   onHandleModalToggle={this.props.onHandleModaltoggle}
        // />
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
  }),
)(DynamicModalComponent);
