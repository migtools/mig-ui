import React, { useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import { Modal } from '@patternfly/react-core';
import { IAddEditStatus, AddEditMode } from '../../add_edit_state';
import { PollingContext } from '../../../home/duck/context';
import AddEditTokenForm from './AddEditTokenForm';
import { IReduxState } from '../../../../reducers';

interface IAddEditTokenModalProps {
  addEditStatus: IAddEditStatus;
  isOpen: boolean;
  isPolling: boolean;
  onClose: () => void;
}

const AddEditTokenModal: React.FunctionComponent<IAddEditTokenModalProps> = ({
  addEditStatus,
  isOpen,
  isPolling,
  onClose,
}: IAddEditTokenModalProps) => {
  const pollingContext = useContext(PollingContext);

  useEffect(() => {
    if (isOpen && isPolling) {
      pollingContext.stopAllPolling();
    }
  });

  const modalTitle = addEditStatus.mode === AddEditMode.Edit ? 'Edit token' : 'Add token';

  return (
    <Modal
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
        onAddEditSubmit={() => {
          // NATODO
        }}
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

const mapDispatchToProps = (dispatch) => ({}); // NATODO wire up actions here

export default connect(mapStateToProps, mapDispatchToProps)(AddEditTokenModal);
