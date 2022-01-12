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
import { IPlan } from '../../../../../plan/duck/types';

interface IProps {
  onHandleClose: () => void;
  id?: string;
  isOpen: boolean;
  plan: IPlan;
}

const MigrateModal: React.FunctionComponent<IProps> = ({ onHandleClose, isOpen, plan }) => {
  const dispatch = useDispatch();
  const { migrationType } = getPlanInfo(plan);

  const [enableQuiesce, toggleQuiesce] = useState(migrationType === 'full');
  const handleChange = (checked: boolean, _event: React.FormEvent<HTMLElement>) => {
    toggleQuiesce(!!checked);
  };

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
              <Title headingLevel="h6">During a cutover migration:</Title>
              {migrationType === 'full' ? (
                <TextList>
                  <TextListItem>
                    By default, all applications on the source namespaces included in the plan are
                    halted for the duration of the migration.
                  </TextListItem>
                  <TextListItem>
                    Persistent volumes associated with the projects being migrated are moved or
                    copied to the target cluster as specified in the migration plan.
                  </TextListItem>
                </TextList>
              ) : migrationType === 'state' ? (
                <TextList>
                  <TextListItem>PV data is copied to the target PVs.</TextListItem>
                  <TextListItem>
                    Kubernetes resources on the Migration Plan are migrated to the target cluster.
                  </TextListItem>
                </TextList>
              ) : migrationType === 'scc' ? (
                <TextList>
                  <TextListItem>
                    All transactions on source applications are halted for the duration of the
                    migration.
                  </TextListItem>
                  <TextListItem>
                    PVC references in the applications are updated to new PVCs before restarting the
                    applications.
                  </TextListItem>
                </TextList>
              ) : null}
            </TextContent>
          </GridItem>
          {migrationType === 'full' ? (
            <GridItem className={spacing.mtMd}>
              <Checkbox
                label="Halt applications on the source namespaces during migration."
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
