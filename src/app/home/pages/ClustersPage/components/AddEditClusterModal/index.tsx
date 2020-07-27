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
import { PollingContext } from '../../../../duck/context';
import { IReduxState } from '../../../../../../reducers';
import { ICluster } from '../../../../../cluster/duck/types';
import { IClusterInfo } from '../../helpers';

interface IAddEditClusterModal {
  addEditStatus: IAddEditStatus;
  initialClusterValues: IClusterInfo;
  isOpen: boolean;
  isPolling: boolean;
  checkConnection: (name) => void;
  clusterList: ICluster[];
  isAdmin: boolean;
  addCluster: (cluster) => void;
  cancelAddEditWatch: () => void;
  onHandleClose: () => void;
  resetAddEditState: () => void;
  updateCluster: (updatedCluster) => void;
}

const AddEditClusterModal: React.FunctionComponent<IAddEditClusterModal> = ({
  addEditStatus,
  initialClusterValues,
  isOpen,
  isPolling,
  checkConnection,
  clusterList,
  isAdmin,
  addCluster,
  cancelAddEditWatch,
  onHandleClose,
  resetAddEditState,
  updateCluster,
}: IAddEditClusterModal) => {
  if (!isAdmin) return null;

  const pollingContext = useContext(PollingContext);
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

  useEffect(() => {
    if (isOpen && isPolling) {
      pollingContext.stopAllPolling();
    }
  });

  const onClose = () => {
    cancelAddEditWatch();
    resetAddEditState();
    setCurrentCluster(null);
    onHandleClose();
    pollingContext.startAllDefaultPolling();
  };

  const modalTitle = addEditStatus.mode === AddEditMode.Edit ? 'Edit cluster' : 'Add cluster';

  return (
    <Modal isSmall isOpen={isOpen} onClose={onClose} title={modalTitle} className="always-scroll">
      <AddEditClusterForm
        onAddEditSubmit={onAddEditSubmit}
        onClose={onClose}
        addEditStatus={addEditStatus}
        initialClusterValues={initialClusterValues}
        currentCluster={currentCluster}
        checkConnection={checkConnection}
      />
    </Modal>
  );
};

export default connect(
  (state: IReduxState) => {
    return {
      addEditStatus: state.cluster.addEditStatus,
      isPolling: state.cluster.isPolling,
      clusterList: state.cluster.clusterList,
      isAdmin: state.auth.isAdmin,
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
  })
)(AddEditClusterModal);
