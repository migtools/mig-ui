import React from 'react';
import { useDispatch } from 'react-redux';
import { Modal, Grid, GridItem } from '@patternfly/react-core';
import { Button } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { PlanActions } from '../../../../../plan/duck/actions';
import StateMigrationTable from './StateMigrationTable';
import StateMigrationFormik from './StateMigrationFormik';

interface IProps {
  onHandleClose: () => void;
  id?: string;
  isOpen: boolean;
  plan: any;
}

const StateMigrationModal: React.FunctionComponent<IProps> = ({ onHandleClose, isOpen, plan }) => {
  const dispatch = useDispatch();
  return (
    <Modal
      variant="large"
      isOpen={isOpen}
      onClose={() => onHandleClose()}
      title={`${plan.MigPlan.metadata.name} - State migration`}
    >
      <Grid hasGutter>
        <form>
          <GridItem>
            <GridItem>
              During a state migration, PV data is copied to the target cluster. PV references are
              not moved, and source pods continue running. Select the persistent volumes you want to
              migrate and optionally rename the PVC for each on the target cluster.
              <br />
            </GridItem>
            <GridItem>
              <StateMigrationFormik plan={plan}>
                <StateMigrationTable plan={plan} />
              </StateMigrationFormik>
            </GridItem>
          </GridItem>
          <GridItem>
            <Grid hasGutter>
              <GridItem>
                <Button
                  className={`${spacing.mrMd}`}
                  variant="primary"
                  onClick={() => {
                    onHandleClose();
                    dispatch(PlanActions.runStageRequest(plan));
                  }}
                >
                  Stage
                </Button>
                <Button
                  className={`${spacing.mrMd}`}
                  key="cancel"
                  variant="secondary"
                  onClick={() => onHandleClose()}
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
export default StateMigrationModal;
