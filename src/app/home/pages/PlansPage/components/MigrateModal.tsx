import React, { useState, useContext } from 'react';
import { Modal, Grid, GridItem } from '@patternfly/react-core';
import { Button, Checkbox } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { PlanActions } from '../../../../plan/duck/actions';
import { useDispatch } from 'react-redux';
const styles = require('./MigrateModal.module').default;

interface IProps {
  onHandleClose: () => void;
  id?: string;
  isOpen: boolean;
  plan: any;
}

const MigrateModal: React.FunctionComponent<IProps> = ({ onHandleClose, isOpen, plan }) => {
  const dispatch = useDispatch();
  const [enableQuiesce, toggleQuiesce] = useState(true);
  const handleChange = (checked: boolean, _event: React.FormEvent<HTMLElement>) => {
    toggleQuiesce(!!checked);
  };

  return (
    <Modal
      variant="small"
      isOpen={isOpen}
      onClose={() => onHandleClose()}
      title={`${plan.MigPlan.metadata.name} - Cutover migration`}
    >
      <Grid hasGutter>
        <form>
          <GridItem>
            By default, a cutover migration halts all transactions on the source cluster before the
            migration begins and they remain halted for the duration of the migration.
            <br />
            <br />
            Persistent volumes associated with the projects being migrates will be moved or copied
            to the target cluster as specified in the migration plan.
          </GridItem>
          <GridItem className={styles.gridMargin}>
            <Checkbox
              label="Halt transactions on the source cluster during migration."
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
                    dispatch(PlanActions.runMigrationRequest(plan, enableQuiesce));
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
