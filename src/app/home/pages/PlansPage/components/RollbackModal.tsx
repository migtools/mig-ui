import React, { useState, useContext } from 'react';
import { Modal, Grid, GridItem } from '@patternfly/react-core';
import { Button, Checkbox } from '@patternfly/react-core';
import { PlanContext } from '../../../duck/context';
const styles = require('./MigrateModal.module');

interface IProps {
  onHandleClose: () => void;
  id?: string;
  isOpen: boolean;
  plan: any;
}

const RollbackModal: React.FunctionComponent<IProps> = ({ onHandleClose, isOpen, plan }) => {
  const planContext = useContext(PlanContext);

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
              <li>
                Deleting Velero Backups and Restores created during the migration on the source and
                target cluster
              </li>
              <li>
                Removing migration annotations and labels from PVs, PVCs, Pods, ImageStreams, and
                namespaces on the source and target cluster
              </li>
              <li>Deleting migrated resources on the target cluster</li>
              <li>
                Un-quiescing (scaling to N replicas) Deployments, DeploymentConfigs, StatefulSets,
                ReplicaSets, DaemonSets, CronJobs, and Jobs on the source cluster
              </li>
              <br />
            </GridItem>
          </GridItem>
          <GridItem>
            <Grid hasGutter>
              <GridItem>
                <Button
                  variant="primary"
                  onClick={() => {
                    onHandleClose();
                    planContext.handleRollbackTriggered(plan);
                  }}
                >
                  Rollback
                </Button>
              </GridItem>
              <GridItem>
                <Button key="cancel" variant="secondary" onClick={() => onHandleClose()}>
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
