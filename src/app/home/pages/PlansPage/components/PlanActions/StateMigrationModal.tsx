import React from 'react';
import { Modal, Grid, GridItem } from '@patternfly/react-core';
import StateMigrationTable from './StateMigrationTable';
import StateMigrationFormik from './StateMigrationFormik';

interface IProps {
  onHandleClose: () => void;
  id?: string;
  isOpen: boolean;
  plan: any;
}

const StateMigrationModal: React.FunctionComponent<IProps> = ({ onHandleClose, isOpen, plan }) => {
  return (
    <Modal
      variant="default"
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
                <StateMigrationTable onHandleClose={onHandleClose} plan={plan} />
              </StateMigrationFormik>
            </GridItem>
          </GridItem>
        </form>
      </Grid>
    </Modal>
  );
};
export default StateMigrationModal;
