import React, { useEffect, useContext, useRef } from 'react';
import { connect } from 'react-redux';
import { Modal } from '@patternfly/react-core';
import { IAddEditStatus, AddEditMode } from '../../add_edit_state';
import { PollingContext } from '../../../home/duck/context';
import AddEditTokenForm from './AddEditTokenForm';
import { ITokenFormValues } from '../../../token/duck/types';
import { IReduxState } from '../../../../reducers';
import { ICluster } from '../../../cluster/duck/types';
import { TokenActions } from '../../../token/duck/actions';

interface IAddEditTokenModalProps {
  addEditStatus: IAddEditStatus;
  isOpen: boolean;
  isPolling: boolean;
  clusterList: ICluster[];
  addToken: (tokenValues: ITokenFormValues) => void;
  onClose: () => void;
  onTokenCreated?: (tokenName: string) => void;
}

const AddEditTokenModal: React.FunctionComponent<IAddEditTokenModalProps> = ({
  addEditStatus,
  addToken,
  clusterList,
  isOpen,
  isPolling,
  onClose,
  onTokenCreated,
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
    if (isOpen && isPolling) {
      pollingContext.stopAllPolling();
    }
  });

  const modalTitle = addEditStatus.mode === AddEditMode.Edit ? 'Edit token' : 'Add token';

  const handleAddEditSubmit = (tokenValues: ITokenFormValues) => {
    // NATODO: Switch on add or edit, for now just add
    addToken(tokenValues);
    onTokenCreated && onTokenCreated(tokenValues.name);
    onClose();
  };

  return (
    <Modal
      appendTo={containerRef.current}
      isSmall
      isOpen={isOpen}
      onClose={() => {
        // NATODO cancel/reset add/edit watch/state
        onClose();
        pollingContext.startAllDefaultPolling();
      }}
      title={modalTitle}
      className="always-scroll"
    >
      <AddEditTokenForm
        addEditStatus={addEditStatus}
        clusterList={clusterList}
        onAddEditSubmit={handleAddEditSubmit}
        onClose={onClose}
      />
    </Modal>
  );
};

const mapStateToProps = (state: IReduxState) => ({
  addEditStatus: state.token.addEditStatus,
  isPolling: state.token.isPolling,
  clusterList: state.cluster.clusterList,
});

const mapDispatchToProps = (dispatch) => ({
  addToken: (tokenValues: ITokenFormValues) => dispatch(TokenActions.addTokenRequest(tokenValues)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AddEditTokenModal);
