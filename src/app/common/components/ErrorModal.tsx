import React from 'react';
import { Modal, Button, Grid, GridItem, Title, BaseSizes } from '@patternfly/react-core';
import ErrorCircleOIcon from '@patternfly/react-icons/dist/js/icons/error-circle-o-icon';
import { useHistory } from 'react-router-dom';
import { AlertActions } from '../duck/actions';
import { useDispatch, useSelector } from 'react-redux';
import { usePausedPollingEffect } from '../context';

const styles = require('./ErrorModal.module').default;

interface IProps {
  isOpen: boolean;
  errorModalObj: any;
}

const ErrorModal: React.FunctionComponent<IProps> = (props) => {
  const dispatch = useDispatch();
  const certError = useSelector((state) => state.auth.certError);

  usePausedPollingEffect();
  const history = useHistory();

  const { isOpen, errorModalObj } = props;

  const header = (
    <React.Fragment>
      <Title headingLevel={'h1'} size={BaseSizes['2xl']}>
        <ErrorCircleOIcon className={styles.errorIconStyles} />
        {`Error`}
      </Title>
    </React.Fragment>
  );

  return (
    <Modal
      header={header}
      variant="large"
      isOpen={isOpen}
      onClose={() => {
        dispatch(AlertActions.errorModalClear());
      }}
      title={`Error'}`}
    >
      <Grid hasGutter>
        <form>
          <GridItem className={styles.modalHeader}>
            {errorModalObj.error ? (
              <>{errorModalObj.error}</>
            ) : (
              <>
                Unable to retrieve one or more resource objects (migcluster, migstorage, migplan,
                mighook).
              </>
            )}
          </GridItem>
          {certError && (
            <>
              <br />
              <div>
                A network error has occurred. The likely cause of the error is one of the following
                issues:
                <br />
                <br />
                <ul>
                  <li>
                    1) The cluster is using self-signed certificates and you have not installed the
                    certificate authority so that it is trusted. To bypass the certificate check,
                    navigate to the following URL to accept the certificate:
                    <br />
                    <br />
                    <a target="_blank" href={certError.failedUrl}>
                      {certError.failedUrl}
                    </a>
                    <br />
                    <br />
                    The best practice is to install the certificate authority in the browser's trust
                    store.
                  </li>
                  <br />
                  <li>
                    2) Cross-origin resource sharing has not yet been configured. This process can
                    take at least 10 minutes. Wait for the process to complete and then refresh your
                    browser.
                  </li>
                </ul>
              </div>
            </>
          )}
          <GridItem className={styles.gridMargin}></GridItem>
          <GridItem className={styles.actionButtons}>
            <Grid hasGutter>
              <GridItem span={5}></GridItem>
              <GridItem span={4}>
                <Button
                  key="cancel"
                  variant="primary"
                  onClick={() => {
                    dispatch(AlertActions.errorModalClear());
                  }}
                >
                  Close
                </Button>
              </GridItem>
            </Grid>
          </GridItem>
        </form>
      </Grid>
    </Modal>
  );
};

export default ErrorModal;
