import React from 'react';
import { Modal, Button, Grid, GridItem, Title, BaseSizes } from '@patternfly/react-core';
import ErrorCircleOIcon from '@patternfly/react-icons/dist/js/icons/error-circle-o-icon';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { usePausedPollingEffect } from '../context';
import { errorModalClear } from '../duck/slice';
import { DefaultRootState } from '../../../configureStore';

const styles = require('./ErrorModal.module').default;

interface IProps {
  isOpen: boolean;
  errorModalObj: any;
}

const ErrorModal: React.FunctionComponent<IProps> = (props) => {
  const dispatch = useDispatch();

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
