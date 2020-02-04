import React from 'react';
import {
  Badge,
  Button,
  DataListItem,
  DataListToggle,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
  DataListAction,
} from '@patternfly/react-core';
import { useOpenModal } from '../../../duck/hooks';
import WizardContainer from '../../../../plan/components/Wizard/WizardContainer';
import PlanContent from './PlanContent';
import { IAddPlanDisabledObjModel } from '../../../AddPlanDisabledObjModel';

type PlanDataListItemProps = {
  id: string;
  clusterList: Array<any>;
  storageList: Array<any>;
  planList: Array<any>;
  addPlanDisabledObj: IAddPlanDisabledObjModel;

}

const PlanDataListItem = ({
  id,
  clusterList,
  storageList,
  planList,
  addPlanDisabledObj,
  isExpanded,
  toggleExpanded,
  planCount
}: PlanDataListItemProps) => {
  const [isWizardOpen, toggleWizardOpen] = useOpenModal(false);
  if (planList) {
    return (
      <DataListItem aria-labelledby="ex-item1" isExpanded={isExpanded}>
        <DataListItemRow>
          <DataListToggle
            onClick={() => {
              toggleExpanded(id);
            }}
            isExpanded={isExpanded}
            id="plan-toggle"
          />
          <DataListItemCells
            dataListCells={[
              <DataListCell id="plan-item" key="plans">
                <div className="pf-l-flex">
                  <div className="pf-l-flex__item">
                    <span id="plans">Plans</span>
                  </div>
                  <div className="pf-l-flex__item">
                    <Badge isRead>{planCount}</Badge>
                  </div>
                </div>

              </DataListCell>,
            ]}
          />
          <DataListAction aria-label="add-plan" aria-labelledby="plan-item" id="add-plan">
            <Button isDisabled={addPlanDisabledObj.isAddPlanDisabled} onClick={toggleWizardOpen} variant="secondary">
              Add
            </Button>
            <WizardContainer
              planList={planList}
              clusterList={clusterList}
              storageList={storageList}
              isEdit={false}
              isOpen={isWizardOpen}
              onHandleWizardModalClose={toggleWizardOpen}
            />
          </DataListAction>
        </DataListItemRow>
        <PlanContent
          addPlanDisabledObj={addPlanDisabledObj}
          planList={planList}
          clusterList={clusterList}
          storageList={storageList}
          isExpanded={isExpanded}
          toggleWizardOpen={toggleWizardOpen}
        />
      </DataListItem>
    );
  }
  return null;
};

export default PlanDataListItem;
