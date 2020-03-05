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
const styles = require('./AlertModal.module')

interface IProps {
  // alertMessage: string;
  // alertType: AlertProps['variant'];
  onHandleClose: () => null;
  isOpen: boolean;
  clearErrors: () => null;
  errorMessage: string;
}

const ErrorModal: React.FunctionComponent<IProps> = (props) => {
  const pollingContext = useContext(PollingContext);


  const { isOpen, errorMessage, clearErrors } = props;
  if (!errorMessage) { return null; }
  return (
    <Modal
      isSmall
      isOpen={isOpen}
      onClose={() => clearErrors()}
      title={`Error`}
    >
      <Grid gutter="md">
        <form
        >
          <GridItem>
            text
          </GridItem>
          <GridItem className={styles.gridMargin}>
            item
          </GridItem>
          <GridItem>
            <Grid gutter="md">
              <GridItem>
                <Button variant="primary"
                  onClick={() => {
                    pollingContext.startAllDefaultPolling();
                    clearErrors()

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
                    pollingContext.startAllDefaultPolling();
                    clearErrors()
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
  null,
  dispatch => ({
    clearErrors: () => dispatch(AlertActions.errorModalClear()),
  })
)(ErrorModal);
