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
  Bullseye,
  Spinner,
} from '@patternfly/react-core';
import AddCircleOIcon from '@patternfly/react-icons/dist/js/icons/add-circle-o-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { PlanContext } from '../../duck/context';
import planSelectors from '../../../plan/duck/selectors';
import clusterSelectors from '../../../cluster/duck/selectors';
import storageSelectors from '../../../storage/duck/selectors';
import { PlanActions } from '../../../plan/duck';
import PlansTable from './components/PlansTable';
import { useOpenModal } from '../../duck';
import WizardContainer from './components/Wizard/WizardContainer';
import AddPlanDisabledTooltip from './components/AddPlanDisabledTooltip';
import { ICluster } from '../../../cluster/duck/types';
import { IPlan } from '../../../plan/duck/types';
import { IStorage } from '../../../storage/duck/types';
import { IReduxState } from '../../../../reducers';
import { usePlansContext } from './context';

interface IPlansPageBaseProps {
  planList: IPlan[];
  clusterList: ICluster[];
  storageList: IStorage[];
  runStageRequest: (plan: IPlan) => void;
  runMigrationRequest: (plan: IPlan, disableQuiesce: boolean) => void;
  planCloseAndDeleteRequest: (planName: string) => void;
  planRollbackRequest: (planName: string) => void;
  migrationCancelRequest: (migrationName: string) => void;
  refreshAnalyticRequest: (analyticName: string) => void;
  isFetchingInitialPlans: boolean;
  isRefreshingAnalytic: boolean;
}

const PlansPageBase: React.FunctionComponent<IPlansPageBaseProps> = ({
  planList,
  clusterList,
  storageList,
  runStageRequest,
  runMigrationRequest,
  planCloseAndDeleteRequest,
  planRollbackRequest,
  migrationCancelRequest,
  refreshAnalyticRequest,
  isFetchingInitialPlans,
  isRefreshingAnalytic,
}: IPlansPageBaseProps) => {
  const [isAddWizardOpen, toggleAddWizardOpen] = useOpenModal(false);
  const { setAddPlanDisabledObj, addPlanDisabledObj } = usePlansContext();

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
        {isFetchingInitialPlans ? (
          <Bullseye>
            <EmptyState variant="large">
              <div className="pf-c-empty-state__icon">
                <Spinner size="xl" />
              </div>
              <Title headingLevel="h2" size="xl">
                Loading...
              </Title>
            </EmptyState>
          </Bullseye>
        ) : (
          <Card>
            <CardBody>
              <PlanContext.Provider
                value={{
                  handleStageTriggered: runStageRequest,
                  handleRunMigration: runMigrationRequest,
                  handleDeletePlan: (plan: IPlan) => {
                    planCloseAndDeleteRequest(plan.MigPlan.metadata.name);
                  },
                  handleRollbackPlan: (plan: IPlan) => {
                    planRollbackRequest(plan.MigPlan.metadata.name);
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
                    <Title headingLevel="h3" size="lg" className={spacing.mbLg}>
                      No migration plans exist
                    </Title>
                    <AddPlanDisabledTooltip addPlanDisabledObj={addPlanDisabledObj}>
                      <div>
                        <Button
                          isDisabled={addPlanDisabledObj.isAddPlanDisabled}
                          onClick={toggleAddWizardOpen}
                          variant="primary"
                        >
                          Add migration plan
                        </Button>
                      </div>
                    </AddPlanDisabledTooltip>
                  </EmptyState>
                ) : (
                  <PlansTable
                    planList={planList}
                    addPlanDisabledObj={addPlanDisabledObj}
                    toggleAddWizardOpen={toggleAddWizardOpen}
                    refreshAnalyticRequest={refreshAnalyticRequest}
                    isRefreshingAnalytic={isRefreshingAnalytic}
                  />
                )}
                <WizardContainer
                  planList={planList}
                  clusterList={clusterList}
                  storageList={storageList}
                  isEdit={false}
                  isOpen={isAddWizardOpen}
                  onHandleWizardModalClose={toggleAddWizardOpen}
                />
              </PlanContext.Provider>
            </CardBody>
          </Card>
        )}
      </PageSection>
    </>
  );
};

const mapStateToProps = (state: IReduxState) => ({
  planList: planSelectors.getPlansWithStatus(state),
  clusterList: clusterSelectors.getAllClusters(state),
  storageList: storageSelectors.getAllStorage(state),
  isFetchingInitialPlans: state.plan.isFetchingInitialPlans,
  isRefreshingAnalytic: state.plan.isRefreshingAnalytic,
});

const mapDispatchToProps = (dispatch) => ({
  runStageRequest: (plan: IPlan) => dispatch(PlanActions.runStageRequest(plan)),
  runMigrationRequest: (plan: IPlan, disableQuiesce: boolean) =>
    dispatch(PlanActions.runMigrationRequest(plan, disableQuiesce)),
  planCloseAndDeleteRequest: (planName: string) =>
    dispatch(PlanActions.planCloseAndDeleteRequest(planName)),
  planRollbackRequest: (planName: string) => dispatch(PlanActions.planRollbackRequest(planName)),
  migrationCancelRequest: (migrationName: string) =>
    dispatch(PlanActions.migrationCancelRequest(migrationName)),
  refreshAnalyticRequest: (analyticName: string) =>
    dispatch(PlanActions.refreshAnalyticRequest(analyticName)),
});

export const PlansPage = connect(mapStateToProps, mapDispatchToProps)(PlansPageBase);
