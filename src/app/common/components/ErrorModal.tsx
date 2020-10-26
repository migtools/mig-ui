import React, { useEffect, useContext, useState } from 'react';
import { Modal, Button, Grid, GridItem, Title, BaseSizes } from '@patternfly/react-core';
import ErrorCircleOIcon from '@patternfly/react-icons/dist/js/icons/error-circle-o-icon';
import { useHistory } from 'react-router-dom';
import { AlertActions } from '../duck/actions';
import { connect } from 'react-redux';
import { PollingContext } from '../../home/duck';
const styles = require('./ErrorModal.module');

interface IProps {
  onHandleClose: () => null;
  isOpen: boolean;
  clearErrors: () => null;
  errorModalObj: any;
}

const ErrorModal: React.FunctionComponent<IProps> = (props) => {
  const history = useHistory();
  const pollingContext = useContext(PollingContext);

  const { isOpen, errorModalObj, clearErrors } = props;
  if (!errorModalObj) {
    return null;
  }

  const header = (
    <React.Fragment>
      <Title headingLevel={'h1'} size={BaseSizes['2xl']}>
        <ErrorCircleOIcon className={styles.errorIconStyles} />
        {`Error while fetching ${errorModalObj.name || 'data'}`}
      </Title>
    </React.Fragment>
  );

  return (
    <Modal
      header={header}
      variant="small"
      isOpen={isOpen}
      onClose={() => clearErrors()}
      title={`Error while fetching ${errorModalObj.name || 'data'}`}
    >
      <Grid hasGutter>
        <form>
          <GridItem className={styles.modalHeader}>
            Unable to retrieve one or more resource objects (migcluster, migstorage, migplan).
          </GridItem>
          <GridItem className={styles.gridMargin}>Refresh your certificate and try again</GridItem>
          <GridItem className={styles.actionButtons}>
            <Grid hasGutter>
              <GridItem span={5}>
                <Button
                  variant="primary"
                  onClick={() => {
                    history.push('/cert-error');
                    clearErrors();
                  }}
                >
                  Refresh Certificate
                </Button>
              </GridItem>
              <GridItem span={4}>
                <Button
                  key="cancel"
                  variant="secondary"
                  onClick={() => {
                    clearErrors();
                    pollingContext.startAllDefaultPolling();
                  }}
                >
                  Cancel
                </Button>
              </GridItem>
            </Grid>
          </GridItem>
        </form>
      </Grid>
    </Modal>
  );
};

export default connect(
  (state) => ({
    migMeta: state.auth.migMeta,
  }),
  (dispatch) => ({
    clearErrors: () => dispatch(AlertActions.errorModalClear()),
  })
)(ErrorModal);
