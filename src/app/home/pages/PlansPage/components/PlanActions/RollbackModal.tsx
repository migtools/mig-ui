import React from 'react';
import { useDispatch } from 'react-redux';
import {
  Modal,
  Grid,
  GridItem,
  TextList,
  TextListItem,
  Title,
  TextContent,
} from '@patternfly/react-core';
import { Button } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { PlanActions } from '../../../../../plan/duck/actions';
import { IPlan } from '../../../../../plan/duck/types';
import { getPlanInfo } from '../../helpers';

interface IProps {
  onHandleClose: () => void;
  id?: string;
  isOpen: boolean;
  plan: IPlan;
}

const RollbackModal: React.FunctionComponent<IProps> = ({ onHandleClose, isOpen, plan }) => {
  const dispatch = useDispatch();
  const { migrationType } = getPlanInfo(plan);
  return (
    <Modal
      variant="small"
      isOpen={isOpen}
      onClose={() => onHandleClose()}
      title={`Rollback migration`}
    >
      <Grid hasGutter>
        <form>
          <GridItem>
            <TextContent>
              <Title headingLevel="h5">
                Rolling back the migration plan will revert migrated resources and volumes to their
                original states and locations, including:
              </Title>
              {migrationType === 'full' || migrationType === 'state' ? (
                <TextList>
                  <Title headingLevel="h6">Source cluster:</Title>
                  <TextList>
                    <TextListItem>
                      Restoring original replica counts (Un-Quiescing) on Deployments,
                      DeploymentConfigs, StatefulSets, StatefulSets, ReplicaSets, DaemonSets,
                      CronJobs, and Jobs
                    </TextListItem>
                  </TextList>
                  <Title headingLevel="h6">Target cluster:</Title>
                  <TextList>
                    <TextListItem>Deleting migrated resources.</TextListItem>
                  </TextList>
                  <Title headingLevel="h6">Source and Target cluster:</Title>
                  <TextList>
                    <TextListItem>
                      Deleting Velero Backups and Restores created during the migration Removing
                      migration annotations and labels from PVs, PVCs, Pods, ImageStreams, and
                      namespaces
                    </TextListItem>
                  </TextList>
                </TextList>
              ) : migrationType === 'scc' ? (
                <TextList>
                  <TextListItem>
                    Restoring original replica counts (Un-Quiescing) on Deployments,
                    DeploymentConfigs, StatefulSets, StatefulSets, ReplicaSets, DaemonSets,
                    CronJobs, and Jobs
                  </TextListItem>
                  <TextListItem>Deleting converted PVCs</TextListItem>
                </TextList>
              ) : null}
            </TextContent>
          </GridItem>
          <GridItem>
            <Grid hasGutter className={spacing.mtXl}>
              <GridItem>
                <Button
                  className={`${spacing.mrMd}`}
                  variant="primary"
                  onClick={() => {
                    onHandleClose();
                    dispatch(PlanActions.runRollbackRequest(plan));
                  }}
                >
                  Rollback
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
export default RollbackModal;
