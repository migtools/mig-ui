import React, { useState, useEffect, useContext, useRef } from 'react';
import { connect } from 'react-redux';
import { Modal } from '@patternfly/react-core';
import { PollingContext } from '../../../home/duck/';
import AddEditTokenForm from './AddEditTokenForm';
import { ITokenFormValues, IToken } from '../../../token/duck/types';
import { IReduxState } from '../../../../reducers';
import { ICluster } from '../../../cluster/duck/types';
import { TokenActions } from '../../../token/duck/actions';
import { INameNamespaceRef } from '../../duck/types';
import { IMigMeta } from '../../../auth/duck/types';
import {
  createAddEditStatus,
  AddEditState,
  AddEditMode,
  IAddEditStatus,
  defaultAddEditStatus,
} from '../../../common/add_edit_state';

interface IAddEditTokenModalProps {
  tokenAddEditStatus: IAddEditStatus;
  isPolling: boolean;
  preventPollingWhileOpen?: boolean;
  clusterList: ICluster[];
  tokenList: IToken[];
  updateToken: (tokenValues: ITokenFormValues) => void;
  addToken: (tokenValues: ITokenFormValues) => void;
  cancelAddEditWatch: () => void;
  resetAddEditState: () => void;
  onTokenAdded?: (tokenRef: INameNamespaceRef) => void;
  preSelectedClusterName?: string;
  migMeta: IMigMeta;
  toggleAddEditTokenModal: () => void;
  isAddEditTokenModalOpen: boolean;
  currentToken: IToken;
  setCurrentToken: (currentToken: IToken) => void;
  checkConnection: (tokenName: string) => void;
  setAssociatedCluster: (clusterName: string) => void;
  associatedCluster: string;
}

const AddEditTokenModal: React.FunctionComponent<IAddEditTokenModalProps> = ({
  tokenAddEditStatus,
  addToken,
  updateToken,
  clusterList,
  isPolling,
  preventPollingWhileOpen = true,
  onTokenAdded,
  preSelectedClusterName,
  migMeta,
  tokenList,
  cancelAddEditWatch,
  resetAddEditState,
  isAddEditTokenModalOpen,
  toggleAddEditTokenModal,
  currentToken,
  setCurrentToken,
  checkConnection,
  associatedCluster,
  setAssociatedCluster,
}: IAddEditTokenModalProps) => {
  const containerRef = useRef(document.createElement('div'));
  useEffect(() => {
    // Hack to make it possible to show this modal on top of the wizard...
    containerRef.current.className = 'modal-in-modal-container';
    document.body.appendChild(containerRef.current);
    return () => {
      document.body.removeChild(containerRef.current);
    };
  }, []);

  const pollingContext = useContext(PollingContext);

  useEffect(() => {
    if (isPolling && preventPollingWhileOpen) {
      pollingContext.stopAllPolling();
      return () => pollingContext.startAllDefaultPolling();
    }
  }, []);

  const modalTitle = tokenAddEditStatus.mode === AddEditMode.Edit ? 'Edit token' : 'Add token';

  const handleAddEditSubmit = (tokenValues: ITokenFormValues) => {
    switch (tokenAddEditStatus.mode) {
      case AddEditMode.Edit: {
        updateToken(tokenValues);
        break;
      }
      case AddEditMode.Add: {
        addToken(tokenValues);
        onTokenAdded && onTokenAdded({ name: tokenValues.name, namespace: migMeta.namespace });
        break;
      }
      default: {
        console.warn(
          `onAddEditSubmit, but unknown mode was found: ${tokenAddEditStatus.mode}. Ignoring.`
        );
      }
    }
  };

  const handleClose = () => {
    resetAddEditState();
    cancelAddEditWatch();
    setCurrentToken(null);
    setAssociatedCluster(null);
    toggleAddEditTokenModal();
    pollingContext.startAllDefaultPolling();
  };

  return (
    <Modal
      appendTo={containerRef.current}
      isSmall
      isOpen
      onClose={handleClose}
      title={modalTitle}
      className="always-scroll"
    >
      <AddEditTokenForm
        tokenAddEditStatus={tokenAddEditStatus}
        clusterList={clusterList}
        onAddEditSubmit={handleAddEditSubmit}
        handleClose={handleClose}
        preSelectedClusterName={associatedCluster}
        currentToken={currentToken}
        checkConnection={checkConnection}
      />
    </Modal>
  );
};

const mapStateToProps = (state: IReduxState) => ({
  tokenAddEditStatus: state.token.tokenAddEditStatus,
  isPolling: state.token.isPolling,
  clusterList: state.cluster.clusterList,
  tokenList: state.token.tokenList,
  migMeta: state.auth.migMeta,
  currentToken: state.token.currentToken,
  associatedCluster: state.token.associatedCluster,
});

const mapDispatchToProps = (dispatch) => ({
  addToken: (tokenValues: ITokenFormValues) => dispatch(TokenActions.addTokenRequest(tokenValues)),
  updateToken: (tokenValues: ITokenFormValues) =>
    dispatch(TokenActions.updateTokenRequest(tokenValues)),
  cancelAddEditWatch: () => dispatch(TokenActions.cancelWatchTokenAddEditStatus()),
  resetAddEditState: () => {
    dispatch(TokenActions.setTokenAddEditStatus(defaultAddEditStatus()));
  },
  removeToken: (tokenName: string) => dispatch(TokenActions.removeTokenRequest(tokenName)),
  setCurrentToken: (currentToken: IToken) => dispatch(TokenActions.setCurrentToken(currentToken)),
  toggleAddEditTokenModal: () => dispatch(TokenActions.toggleAddEditTokenModal()),
  checkConnection: (tokenName: string) => {
    dispatch(
      TokenActions.setTokenAddEditStatus(
        createAddEditStatus(AddEditState.Fetching, AddEditMode.Edit)
      )
    );
    dispatch(TokenActions.watchTokenAddEditStatus(tokenName));
  },
  setAssociatedCluster: (associatedCluster: string) =>
    dispatch(TokenActions.setAssociatedCluster(associatedCluster)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AddEditTokenModal);
