import React, { useState, useContext } from 'react';
import { Modal, Grid, GridItem } from '@patternfly/react-core';
import { Button, Checkbox } from '@patternfly/react-core';
import { PlanContext } from '../../home/duck/context';
const styles = require('./MigrateModal.module');

interface IProps {
    onHandleClose: () => void;
    id?: string;
    isOpen: boolean;
    plan: any;
}

const MigrateModal: React.FunctionComponent<IProps> = ({ onHandleClose, isOpen, plan }) => {
  const [disableQuiesce, toggleQuiesce] = useState(false);
  const handleChange = (checked, _event) => {
    toggleQuiesce(!!checked);
  };
  const planContext = useContext(PlanContext);

  return (
    <Modal
      isSmall
      isOpen={isOpen}
      onClose={() => onHandleClose()}
      title={`Migrate ${plan.MigPlan.metadata.name}`}
    >
      <Grid gutter="md">
        <form
        >
          <GridItem>
                        Migrating a migration plan means that all transactions on the source cluster will be
                        halted before the migration begins and will remain halted for the duration of the
                        migration. Persistent volumes associated with the projects being migrated will be moved or
                        copied to the target cluster as specified in the migration plan.
          </GridItem>
          <GridItem className={styles.gridMargin}>
            <Checkbox
              label="Don't halt transactions on the source during migration."
              aria-label="halt-label"
              id="transaction-halt-checkbox"
              isChecked={disableQuiesce}
              onChange={handleChange}
            />
          </GridItem>
          <GridItem>
            <Grid gutter="md">
              <GridItem>
                <Button variant="primary"
                  onClick={() => {
                    onHandleClose();
                    planContext.handleRunMigration(plan, disableQuiesce);
                  }
                  }
                >
                                    Migrate
                </Button>
              </GridItem>
              <GridItem>
                <Button
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