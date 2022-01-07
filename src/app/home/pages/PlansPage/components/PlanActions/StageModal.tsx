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

  // TODO alter text by migration type

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
                <TextList>
                  <TextListItem>PV data is copied to the target cluster.</TextListItem>
                  <TextListItem>PV references are not moved.</TextListItem>
                  <TextListItem>Source pods continue running.</TextListItem>
                </TextList>
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
