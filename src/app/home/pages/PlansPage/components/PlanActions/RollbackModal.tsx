import React from 'react';
import { useDispatch } from 'react-redux';
import { Modal, Grid, GridItem } from '@patternfly/react-core';
import { Button } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { PlanActions } from '../../../../../plan/duck/actions';

interface IProps {
  onHandleClose: () => void;
  id?: string;
  isOpen: boolean;
  plan: any;
}

const RollbackModal: React.FunctionComponent<IProps> = ({ onHandleClose, isOpen, plan }) => {
  const dispatch = useDispatch();
  return (
    <Modal
      variant="small"
      isOpen={isOpen}
      onClose={() => onHandleClose()}
      title={`Rollback ${plan.MigPlan.metadata.name}`}
    >
      <Grid hasGutter>
        <form>
          <GridItem>
            Rolling back the migration plan will revert migrated resources and volumes to their
            original states and locations, including:
            <GridItem>
              <br />
              Source Cluster:
              <li>
                Restoring original replica counts (Un-Quiescing) on Deployments, DeploymentConfigs,
                StatefulSets, StatefulSets, ReplicaSets, DaemonSets, CronJobs, and Jobs
              </li>
              <br />
              Target Cluster:
              <li>Deleting migrated resources</li>
              <br />
              Source and Target Cluster:
              <li>Deleting Velero Backups and Restores created during the migration</li>
              <li>
                Removing migration annotations and labels from PVs, PVCs, Pods, ImageStreams, and
                namespaces
              </li>
              <br />
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
