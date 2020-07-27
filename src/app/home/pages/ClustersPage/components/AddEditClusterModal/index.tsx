import React, { useState, useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import AddEditClusterForm from './AddEditClusterForm';
import { Modal } from '@patternfly/react-core';
import { ClusterActions } from '../../../../../cluster/duck/actions';
import {
  defaultAddEditStatus,
  AddEditMode,
  createAddEditStatus,
  AddEditState,
} from '../../../../../common/add_edit_state';
import { PollingContext } from '../../../../duck/context';
import { IReduxState } from '../../../../../../reducers';

// TODO add types here
const AddEditClusterModal = ({
  addEditStatus,
  initialClusterValues,
  isOpen,
  isPolling,
  checkConnection,
  clusterList,
  cluster,
  isAdmin,
  ...props
}) => {
  if (!isAdmin) return null;

  const pollingContext = useContext(PollingContext);
  const [currentClusterName, setCurrentClusterName] = useState(
    initialClusterValues ? initialClusterValues.clusterName : null
  );
  useEffect(() => {
    /* currentClusterName was not gettting set when exiting and re-entering the modal. 
    Fixed by passing in cluster to modal component to trigger rerender when it changes & set 
    cluster name inside this useEffect. 
    
   */
    if (initialClusterValues) {
      setCurrentClusterName(initialClusterValues.clusterName);
    }
  });

  const onAddEditSubmit = (clusterValues) => {
    switch (addEditStatus.mode) {
      case AddEditMode.Edit: {
        props.updateCluster(clusterValues);
        break;
      }
      case AddEditMode.Add: {
        props.addCluster(clusterValues);
        setCurrentClusterName(clusterValues.name);
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
    props.cancelAddEditWatch();
    props.resetAddEditState();
    setCurrentClusterName(null);
    props.onHandleClose();
    pollingContext.startAllDefaultPolling();
  };

  const modalTitle = addEditStatus.mode === AddEditMode.Edit ? 'Edit cluster' : 'Add cluster';

  const currentCluster = clusterList.find((c) => {
    return c.MigCluster.metadata.name === currentClusterName;
  });

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
