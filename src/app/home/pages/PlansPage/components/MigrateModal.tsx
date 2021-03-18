import React, { useState, useContext } from 'react';
import { Modal, Grid, GridItem } from '@patternfly/react-core';
import { Button, Checkbox } from '@patternfly/react-core';
import { PlanContext } from '../../../duck/context';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
const styles = require('./MigrateModal.module').default;

interface IProps {
  onHandleClose: () => void;
  id?: string;
  isOpen: boolean;
  plan: any;
}

const MigrateModal: React.FunctionComponent<IProps> = ({ onHandleClose, isOpen, plan }) => {
  const [enableQuiesce, toggleQuiesce] = useState(true);
  const handleChange = (checked, _event) => {
    toggleQuiesce(!!checked);
  };
  const planContext = useContext(PlanContext);

  return (
    <Modal
      variant="small"
      isOpen={isOpen}
      onClose={() => onHandleClose()}
      title={`Migrate ${plan.MigPlan.metadata.name}`}
    >
      <Grid hasGutter>
        <form>
          <GridItem>
            Migrating a migration plan means that all transactions on the source cluster will be
            halted before the migration begins and will remain halted for the duration of the
            migration. Persistent volumes associated with the projects being migrated will be moved
            or copied to the target cluster as specified in the migration plan.
          </GridItem>
          <GridItem className={styles.gridMargin}>
            <Checkbox
              label="Halt transactions on the source during migration."
              aria-label="halt-label"
              id="transaction-halt-checkbox"
              isChecked={enableQuiesce}
              onChange={handleChange}
            />
          </GridItem>
          <GridItem>
            <Grid hasGutter>
              <GridItem>
                <Button
                  className={`${spacing.mrMd}`}
                  variant="primary"
                  onClick={() => {
                    onHandleClose();
                    planContext.handleRunMigration(plan, enableQuiesce);
                  }}
                >
                  Migrate
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
export default MigrateModal;
