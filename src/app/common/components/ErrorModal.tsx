import React, { useEffect, useContext, useState } from 'react';
import {
  Modal,
  Button,
  Alert,
  AlertActionCloseButton,
  AlertProps,
  Grid,
  GridItem
} from '@patternfly/react-core';
import { AlertActions } from '../duck/actions';
import { connect } from 'react-redux';
import { PollingContext } from '../../home/duck/context';
const styles = require('./ErrorModal.module')

interface IProps {
  onHandleClose: () => null;
  isOpen: boolean;
  clearErrors: () => null;
  errorModalObject: string;
}

const ErrorModal: React.FunctionComponent<IProps> = (props) => {
  const pollingContext = useContext(PollingContext);


  const { isOpen, errorModalObject, clearErrors } = props;
  if (!errorModalObject) { return null; }
  return (
    <Modal
      isSmall
      isOpen={isOpen}
      onClose={() => clearErrors()}
      title={`Error while fetching data`}
    >
      <Grid gutter="md">
        <form
        >
          <GridItem className={styles.modalHeader}>
            Unable to retrieve one or more resource objects (migcluster, migstorage, migplan).
          </GridItem>
          <GridItem className={styles.gridMargin}>
            Refresh your browser and try again
          </GridItem>
          <GridItem>
            <Grid gutter="md">
              <GridItem>
                <Button variant="primary"
                  onClick={() => {
                    // window.location.reload();
                  }
                  }
                >
                  Try again
                </Button>
              </GridItem>
              <GridItem>
                <Button
                  key="cancel"
                  variant="secondary"
                  onClick={() => {
                    clearErrors();
                    pollingContext.startAllDefaultPolling();
                  }
                  }

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
  state => ({
    migMeta: state.migMeta,
  }),
  dispatch => ({
    clearErrors: () => dispatch(AlertActions.errorModalClear()),
  })
)(ErrorModal);
