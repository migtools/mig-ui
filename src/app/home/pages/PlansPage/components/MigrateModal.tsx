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
      title={`Migrate ${plan.MigPlan.metadata.name}`}
    >
      <Grid hasGutter>
        <form>
          <GridItem>
            By default, the pods on the source cluster are scaled to zero before migration.
            Persistent volumes are then moved or copied to the target cluster. See the product
            documentation for more information.
          </GridItem>
          <GridItem className={styles.gridMargin}>
            <Checkbox
              label="Shut down the pods on the source cluster before migration."
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
