import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Card, PageSection, DataList } from '@patternfly/react-core';
import { IAddPlanDisabledObjModel } from '../../AddPlanDisabledObjModel';
import { DataListItems } from '../../HomeComponent';
import { PlanContext } from '../../duck/context';
import PlanDataListItem from './components/PlanDataListItem';
import planSelectors from '../../../plan/duck/selectors';
import clusterSelectors from '../../../cluster/duck/selectors';
import storageSelectors from '../../../storage/duck/selectors';
import { PlanActions } from '../../../plan/duck';

interface IPlansPageBaseProps {
  planList: any[]; // TODO type?
  clusterList: any[]; // TODO type?
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
    <PageSection>
      <Card>
        <DataList aria-label="data-list-main-container">
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
            <PlanDataListItem
              id={DataListItems.PlanList}
              planList={planList}
              clusterList={clusterList}
              storageList={storageList}
              addPlanDisabledObj={addPlanDisabledObj}
              isExpanded
              planCount={planList.length}
            />
          </PlanContext.Provider>
        </DataList>
      </Card>
    </PageSection>
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
