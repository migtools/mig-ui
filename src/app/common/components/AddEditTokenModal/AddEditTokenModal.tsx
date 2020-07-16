import React, { useState, useEffect, useContext, useRef } from 'react';
import { connect } from 'react-redux';
import { Modal } from '@patternfly/react-core';
import { IAddEditStatus, AddEditMode } from '../../add_edit_state';
import { PollingContext, TokenContext } from '../../../home/duck/';
import AddEditTokenForm from './AddEditTokenForm';
import { ITokenFormValues } from '../../../token/duck/types';
import { IReduxState } from '../../../../reducers';
import { ICluster } from '../../../cluster/duck/types';
import { TokenActions } from '../../../token/duck/actions';
import { INameNamespaceRef } from '../../duck/types';
import { IMigMeta } from '../../../auth/duck/types';

interface IAddEditTokenModalProps {
  tokenAddEditStatus: IAddEditStatus;
  isPolling: boolean;
  preventPollingWhileOpen?: boolean;
  clusterList: ICluster[];
  addToken: (tokenValues: ITokenFormValues) => void;
  onClose: () => void;
  cancelAddEditWatch: () => void;
  resetAddEditState: () => void;
  onTokenAdded?: (tokenRef: INameNamespaceRef) => void;
  preSelectedClusterName?: string;
  migMeta: IMigMeta;
}

const AddEditTokenModal: React.FunctionComponent<IAddEditTokenModalProps> = ({
  tokenAddEditStatus,
  addToken,
  clusterList,
  isPolling,
  preventPollingWhileOpen = true,
  onClose,
  onTokenAdded,
  preSelectedClusterName,
  migMeta,
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
  const tokenContext = useContext(TokenContext);

  useEffect(() => {
    if (isPolling && preventPollingWhileOpen) {
      pollingContext.stopAllPolling();
      return () => pollingContext.startAllDefaultPolling();
    }
  }, []);

  const modalTitle = tokenAddEditStatus.mode === AddEditMode.Edit ? 'Edit token' : 'Add token';

  const handleAddEditSubmit = (tokenValues: ITokenFormValues) => {
    // NATODO: Switch on add or edit, for now just add
    addToken(tokenValues);
    onTokenAdded && onTokenAdded({ name: tokenValues.name, namespace: migMeta.namespace });
    onClose();
  };

  return (
    <Modal
      appendTo={containerRef.current}
      isSmall
      isOpen
      onClose={() => {
        // NATODO cancel/reset add/edit watch/state
        tokenContext.resetAddEditState();
        tokenContext.cancelAddEditWatch();
        tokenContext.setInitialTokenValues(null);
        pollingContext.startAllDefaultPolling();
        onClose();
      }}
      title={modalTitle}
      className="always-scroll"
    >
      <AddEditTokenForm
        tokenAddEditStatus={tokenAddEditStatus}
        clusterList={clusterList}
        onAddEditSubmit={handleAddEditSubmit}
        initialTokenValues={tokenContext.initialTokenValues}
        onClose={onClose}
        preSelectedClusterName={preSelectedClusterName}
      />
    </Modal>
  );
};

const mapStateToProps = (state: IReduxState) => ({
  tokenAddEditStatus: state.token.tokenAddEditStatus,
  isPolling: state.token.isPolling,
  clusterList: state.cluster.clusterList,
  migMeta: state.auth.migMeta,
});

const mapDispatchToProps = (dispatch) => ({
  addToken: (tokenValues: ITokenFormValues) => dispatch(TokenActions.addTokenRequest(tokenValues)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AddEditTokenModal);
