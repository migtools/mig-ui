import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import AddClusterForm from './AddEditClusterForm';
import { Modal } from '@patternfly/react-core';
import { Creators } from '../../duck/actions';
import {
  defaultAddEditStatus,
  AddEditMode,
} from '../../../common/add_edit_state';

const AddEditClusterModal = ({
  addEditStatus,
  initialClusterValues,
  isOpen,
  ...props
}) => {
  const onAddEditSubmit = (clusterValues) => {
    switch(addEditStatus.mode) {
      case AddEditMode.Edit: {
        props.updateCluster(clusterValues);
        break;
      }
      case AddEditMode.Add: {
        props.addCluster(clusterValues);
        break;
      }
      default: {
        console.warn(
          `onAddEditSubmit, but unknown mode was found: ${addEditStatus.mode}. Ignoring.`, );
      }
    }
  }

  const onClose = () => {
    props.cancelAddEditWatch();
    props.resetAddEditState();
    props.onHandleClose();
  }

  // useEffect(() => {
  //   console.log('AddEditClusterModal::useEffect');
  //   console.log('isOpen: ', isOpen);
  //   if(isOpen) {
  //     console.log('suspending cluster polling since it was opened');
  //   }
  //   return () => {
  //     console.log('return effect');
  //     if(!isOpen) {
  //       console.log('starting polling again since the modal is closed');
  //     }
  //   }
  // }, [isOpen])

  return (
    <Modal isSmall isOpen={isOpen} onClose={props.onHandleClose} title="Cluster">
      <AddClusterForm
        onAddEditSubmit={onAddEditSubmit}
        onClose={onClose}
        addEditStatus={addEditStatus}
        initialClusterValues={initialClusterValues}
      />
    </Modal>
  );
}

export default connect(
  state => {
    return {
      addEditStatus: state.cluster.addEditStatus,
    };
  },
  dispatch => ({
    addCluster: clusterValues => dispatch(Creators.addClusterRequest(clusterValues)),
    updateCluster: updatedClusterValues => dispatch(
      Creators.updateClusterRequest(updatedClusterValues)),
    cancelAddEditWatch: () => dispatch(Creators.cancelWatchClusterAddEditStatus()),
    resetAddEditState: () => {
      dispatch(Creators.setClusterAddEditStatus(defaultAddEditStatus()));
    },
  })
)(AddEditClusterModal);
