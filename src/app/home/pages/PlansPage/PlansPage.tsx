import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  Card,
  PageSection,
  CardBody,
  TextContent,
  Text,
  EmptyState,
  EmptyStateIcon,
  Title,
  Button,
} from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { IAddPlanDisabledObjModel } from './types';
import { PlanContext } from '../../duck/context';
import planSelectors from '../../../plan/duck/selectors';
import clusterSelectors from '../../../cluster/duck/selectors';
import storageSelectors from '../../../storage/duck/selectors';
import { PlanActions } from '../../../plan/duck';
import PlansTable from './components/PlansTable';
import { useOpenModal } from '../../duck/hooks';
import WizardContainer from './components/Wizard/WizardContainer';
import AddPlanDisabledTooltip from './components/AddPlanDisabledTooltip';
import { ICluster } from '../../../cluster/duck/types';

interface IPlansPageBaseProps {
  planList: any[]; // TODO type?
  clusterList: ICluster[];
  storageList: any[]; // TODO type?
  runStageRequest: (plan) => void; // TODO type?
  runMigrationRequest: (plan, disableQuiesce) => void; // TODO type?
  planCloseAndDeleteRequest: (planName: string) => void;
  migrationCancelRequest: (migrationName: string) => void;
}

// TODO replace the Card > DataList > DataListItem with a table? Talk to Vince.
const PlansPageBase: React.FunctionComponent<IPlansPageBaseProps> = ({
  planList,
  clusterList,
  storageList,
  runStageRequest,
  runMigrationRequest,
  planCloseAndDeleteRequest,
  migrationCancelRequest,
}: IPlansPageBaseProps) => {
  const [isWizardOpen, toggleWizardOpen] = useOpenModal(false);

  const [addPlanDisabledObj, setAddPlanDisabledObj] = useState<IAddPlanDisabledObjModel>({
    isAddPlanDisabled: true,
    disabledText: '',
  });

  useEffect(() => {
    if (clusterList.length < 2) {
      setAddPlanDisabledObj({
        isAddPlanDisabled: true,
        disabledText: 'A minimum of 2 clusters is required to create a plan.',
      });
      return;
    } else if (storageList.length < 1) {
      setAddPlanDisabledObj({
        isAddPlanDisabled: true,
        disabledText: 'A minimum of 1 replication repository is required to create a plan.',
      });
      return;
    } else {
      setAddPlanDisabledObj({
        isAddPlanDisabled: false,
        disabledText: 'Click to create a plan.',
      });
    }
  }, [clusterList, storageList]);

  return (
    <>
      <PageSection variant="light">
        <TextContent>
          <Text component="h1" className={spacing.mbAuto}>
            Migration plans
          </Text>
        </TextContent>
      </PageSection>
      <PageSection>
        <Card>
          <CardBody>
            <PlanContext.Provider
              value={{
                handleStageTriggered: runStageRequest,
                handleRunMigration: runMigrationRequest,
                handleDeletePlan: (plan) => {
                  // TODO arg type?
                  planCloseAndDeleteRequest(plan.MigPlan.metadata.name);
                },
                handleMigrationCancelRequest: migrationCancelRequest,
                planList,
                clusterList,
                storageList,
              }}
            >
              {!planList ? null : planList.length === 0 ? (
                <EmptyState variant="full">
                  <EmptyStateIcon icon={AddCircleOIcon} />
                  <Title size="lg">No migration plans exist</Title>
                  <AddPlanDisabledTooltip addPlanDisabledObj={addPlanDisabledObj}>
                    <Button
                      isDisabled={addPlanDisabledObj.isAddPlanDisabled}
                      onClick={toggleWizardOpen}
                      variant="primary"
                    >
                      Add migration plan
                    </Button>
                  </AddPlanDisabledTooltip>
                </EmptyState>
              ) : (
                <PlansTable
                  planList={planList}
                  addPlanDisabledObj={addPlanDisabledObj}
                  toggleWizardOpen={toggleWizardOpen}
                />
              )}
              <WizardContainer
                planList={planList}
                clusterList={clusterList}
                storageList={storageList}
                isEdit={false}
                isOpen={isWizardOpen}
                onHandleWizardModalClose={toggleWizardOpen}
              />
            </PlanContext.Provider>
          </CardBody>
        </Card>
      </PageSection>
    </>
  );
};

// TODO type for state arg? inherit from reducer?
const mapStateToProps = (state) => ({
  planList: planSelectors.getPlansWithStatus(state),
  clusterList: clusterSelectors.getAllClusters(state),
  storageList: storageSelectors.getAllStorage(state),
});

// TODO types for dispatch arg and args of each action prop?
const mapDispatchToProps = (dispatch) => ({
  runStageRequest: (plan) => dispatch(PlanActions.runStageRequest(plan)),
  runMigrationRequest: (plan, disableQuiesce) =>
    dispatch(PlanActions.runMigrationRequest(plan, disableQuiesce)),
  planCloseAndDeleteRequest: (planName) =>
    dispatch(PlanActions.planCloseAndDeleteRequest(planName)),
  migrationCancelRequest: (migrationName) =>
    dispatch(PlanActions.migrationCancelRequest(migrationName)),
});

export const PlansPage = connect(mapStateToProps, mapDispatchToProps)(PlansPageBase);
