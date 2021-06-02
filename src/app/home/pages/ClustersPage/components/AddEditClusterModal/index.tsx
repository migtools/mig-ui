import React, { useState, useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import AddEditClusterForm, { IFormValues } from './AddEditClusterForm';
import { Modal } from '@patternfly/react-core';
import { ClusterActions } from '../../../../../cluster/duck/actions';
import {
  defaultAddEditStatus,
  AddEditMode,
  createAddEditStatus,
  AddEditState,
  IAddEditStatus,
} from '../../../../../common/add_edit_state';
import { ICluster } from '../../../../../cluster/duck/types';
import { IClusterInfo } from '../../helpers';
import { DefaultRootState } from '../../../../../../configureStore';

interface IAddEditClusterModal {
  addEditStatus: IAddEditStatus;
  initialClusterValues: IClusterInfo;
  isOpen: boolean;
  isPolling: boolean;
  checkConnection: (name) => void;
  clusterList: ICluster[];
  addCluster: (cluster) => void;
  cancelAddEditWatch: () => void;
  onHandleClose: () => void;
  resetAddEditState: () => void;
  updateCluster: (updatedCluster) => void;
  currentCluster: ICluster;
  setCurrentCluster: (currentCluster: ICluster) => void;
  resetClusterPage: () => void;
}

const AddEditClusterModal: React.FunctionComponent<IAddEditClusterModal> = ({
  addEditStatus,
  initialClusterValues,
  isOpen,
  isPolling,
  checkConnection,
  clusterList,
  addCluster,
  cancelAddEditWatch,
  onHandleClose,
  resetAddEditState,
  updateCluster,
  currentCluster,
  setCurrentCluster,
  resetClusterPage,
}: IAddEditClusterModal) => {
  const onAddEditSubmit = (clusterValues) => {
    switch (addEditStatus.mode) {
      case AddEditMode.Edit: {
        updateCluster(clusterValues);
        break;
      }
      case AddEditMode.Add: {
        addCluster(clusterValues);
        break;
      }
      default: {
        console.warn(
          `onAddEditSubmit, but unknown mode was found: ${addEditStatus.mode}. Ignoring.`
        );
      }
    }
  };

  const handleClose = () => {
    resetAddEditState();
    cancelAddEditWatch();
    setCurrentCluster(null);
    onHandleClose();
    resetClusterPage();
  };

  const modalTitle = addEditStatus.mode === AddEditMode.Edit ? 'Edit cluster' : 'Add cluster';

  return (
    <Modal
      variant="small"
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      className="always-scroll"
    >
      <AddEditClusterForm
        onAddEditSubmit={onAddEditSubmit}
        handleClose={handleClose}
        addEditStatus={addEditStatus}
        initialClusterValues={initialClusterValues}
        currentCluster={currentCluster}
        checkConnection={checkConnection}
      />
    </Modal>
  );
};

export default connect(
  (state: DefaultRootState) => {
    return {
      addEditStatus: state.cluster.addEditStatus,
      isPolling: state.cluster.isPolling,
      currentCluster: state.cluster.currentCluster,
      clusterList: state.cluster.clusterList,
    };
  },
  (dispatch) => ({
    addCluster: (clusterValues) => dispatch(ClusterActions.addClusterRequest(clusterValues)),
    updateCluster: (updatedClusterValues) =>
      dispatch(ClusterActions.updateClusterRequest(updatedClusterValues)),
    checkConnection: (clusterName: string) => {
      dispatch(
        ClusterActions.setClusterAddEditStatus(
          createAddEditStatus(AddEditState.Fetching, AddEditMode.Edit)
        )
      );
      dispatch(ClusterActions.watchClusterAddEditStatus(clusterName));
    },
    cancelAddEditWatch: () => dispatch(ClusterActions.cancelWatchClusterAddEditStatus()),
    resetAddEditState: () => {
      dispatch(ClusterActions.setClusterAddEditStatus(defaultAddEditStatus()));
    },
    setCurrentCluster: (currentCluster: ICluster) =>
      dispatch(ClusterActions.setCurrentCluster(currentCluster)),
    resetClusterPage: () => dispatch(ClusterActions.resetClusterPage()),
  })
)(AddEditClusterModal);
