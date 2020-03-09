import React, { useEffect, useContext, useState } from 'react';
import {
  Modal,
  Button,
  Grid,
  GridItem
} from '@patternfly/react-core';
import { useHistory } from "react-router-dom";
import { AlertActions } from '../duck/actions';
import { connect } from 'react-redux';
import { PollingContext } from '../../home/duck/context';
const styles = require('./ErrorModal.module')

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
  if (!errorModalObj) { return null; }
  return (
    <Modal
      isSmall
      isOpen={isOpen}
      onClose={() => clearErrors()}
      title={`Error while fetching ${errorModalObj.name || 'data'}`}
    >
      <Grid gutter="md">
        <form
        >
          <GridItem className={styles.modalHeader}>
            Unable to retrieve one or more resource objects (migcluster, migstorage, migplan).
          </GridItem>
          <GridItem className={styles.gridMargin}>
            Refresh your certificate and try again
          </GridItem>
          <GridItem>
            <Grid gutter="md">
              <GridItem>
                <Button variant="primary"
                  onClick={() => {
                    history.push('/cert-error');
                    clearErrors()

                  }
                  }
                >
                  Refresh Certificate
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
