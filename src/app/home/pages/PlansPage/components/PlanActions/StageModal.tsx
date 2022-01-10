import React from 'react';
import { useDispatch } from 'react-redux';
import {
  Modal,
  Grid,
  GridItem,
  TextContent,
  TextList,
  TextListItem,
  TextVariants,
  Title,
} from '@patternfly/react-core';
import { Button } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { PlanActions } from '../../../../../plan/duck/actions';
import { getPlanInfo } from '../../helpers';

interface IProps {
  onHandleClose: () => void;
  id?: string;
  isOpen: boolean;
  plan: any;
}

const StageModal: React.FunctionComponent<IProps> = ({ onHandleClose, isOpen, plan }) => {
  const dispatch = useDispatch();

  const { migrationType } = getPlanInfo(plan);

  return (
    <Modal
      variant="small"
      isOpen={isOpen}
      onClose={() => onHandleClose()}
      title={`Stage migration`}
    >
      <Grid hasGutter>
        <form>
          <GridItem>
            <GridItem>
              <TextContent>
                <Title headingLevel="h6">During a stage migration:</Title>
                {migrationType === 'full' ? (
                  <TextList>
                    <TextListItem>PV data is copied to the target cluster.</TextListItem>
                    <TextListItem>PV references are not moved.</TextListItem>
                    <TextListItem>Source pods continue running.</TextListItem>
                  </TextList>
                ) : migrationType === 'state' ? (
                  <TextList>
                    <TextListItem>PV data is copied to the target PVs.</TextListItem>
                    <TextListItem>PV references are moved.</TextListItem>
                    <TextListItem>Source pods continue running.</TextListItem>
                  </TextList>
                ) : migrationType === 'scc' ? (
                  <TextList>
                    <TextListItem>PV data is copied to the converted PVs.</TextListItem>
                    <TextListItem>
                      PVC references in the applications are not updated to new PVCs.
                    </TextListItem>
                  </TextList>
                ) : null}
              </TextContent>
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
                    dispatch(PlanActions.runStageRequest(plan));
                  }}
                >
                  Stage
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
export default StageModal;
