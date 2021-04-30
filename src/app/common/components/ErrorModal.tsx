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
        {`Error while fetching ${errorModalObj?.name || 'data'}`}
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
      title={`Error while fetching ${errorModalObj.name || 'data'}`}
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
                A certificate error has occurred, likely caused by using self-signed CA certificates
                in one of the clusters. Navigate to the following URL and accept the certificate:
                <br />
                <br />
                <a target="_blank" href={certError.failedUrl}>
                  {certError.failedUrl}
                </a>
                <br />
                <br />
                <div />
                If an "Unauthorized" message appears after you have accepted the certificate,
                navigate to the MTC console and refresh the page.
                <div />
                To fix this issue permanently, add the certificate to your web browser's trust
                store.
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
