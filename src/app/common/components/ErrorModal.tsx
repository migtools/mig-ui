import React from 'react';
import { Modal, Button, Grid, GridItem, Title, BaseSizes } from '@patternfly/react-core';
import ErrorCircleOIcon from '@patternfly/react-icons/dist/js/icons/error-circle-o-icon';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { usePausedPollingEffect } from '../context';
import { errorModalClear } from '../duck/slice';

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
        dispatch(errorModalClear());
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
                A network error has occurred and we are unable to fetch one or more resources. We
                are unable to determine the precise cause due to browser obfuscation, but based on
                the content of the error it is likely one of two root issues:
                <br />
                <br />
                <ul>
                  <li>
                    * Your cluster API and/or its services are using self-signed certificates and
                    you have not installed the CA as trusted. You can grant an exception within your
                    browser by visiting the following link and accepting the certificate:
                    <br />
                    <br />
                    <a target="_blank" href={certError.failedUrl}>
                      {certError.failedUrl}
                    </a>
                    <br />
                    <br />
                    NOTE: It is recommended if using a self-signed certificate to install the
                    trusted CA in your browser’s supported store prior to using the Migration
                    Toolkit.
                  </li>
                  <br />
                  <br />
                  <li>
                    * If you are sure that you have already accepted the requisite CAs, it could be
                    a Cross Origin Resource Sharing rejection. This is something that is configured
                    in the cluster’s API server settings by the MTC operator and can take up to 10
                    minutes to propagate across all related services. Please wait and check back in
                    at a later point in time.
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
                    dispatch(errorModalClear());
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
