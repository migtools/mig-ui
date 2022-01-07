import React, { useState, useContext } from 'react';
import {
  Modal,
  Grid,
  GridItem,
  TextContent,
  TextList,
  TextListItem,
  Title,
} from '@patternfly/react-core';
import { Button, Checkbox } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useDispatch } from 'react-redux';
import { PlanActions } from '../../../../../plan/duck/actions';
import { getPlanInfo } from '../../helpers';

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

  const { migrationType } = getPlanInfo(plan);

  // TODO alter text by migration type

  return (
    <Modal
      variant="small"
      isOpen={isOpen}
      onClose={() => onHandleClose()}
      title={`Cutover migration`}
    >
      <Grid hasGutter>
        <form>
          <GridItem>
            <TextContent>
              <Title headingLevel="h6">
                By default, a cutover migration halts all transactions on the source cluster before
                the migration begins and they remain halted for the duration of the migration.
              </Title>
              <TextList>
                <TextListItem>
                  Persistent volumes associated with the projects being migrated will be moved or
                  copied to the target cluster as specified in the migration plan.
                </TextListItem>
              </TextList>
            </TextContent>
          </GridItem>
          {migrationType !== 'scc' ? (
            <GridItem className={spacing.mtMd}>
              <Checkbox
                label="Halt transactions on the source cluster during migration."
                aria-label="halt-label"
                id="transaction-halt-checkbox"
                isChecked={enableQuiesce}
                onChange={handleChange}
              />
            </GridItem>
          ) : null}
          <GridItem className={spacing.mtMd}>
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
