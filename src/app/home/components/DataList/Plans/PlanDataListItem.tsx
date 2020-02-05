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
  TooltipPosition, 
  Tooltip
} from '@patternfly/react-core';
import { useOpenModal } from '../../../duck/hooks';
import WizardContainer from '../../../../plan/components/Wizard/WizardContainer';
import PlanContent from './PlanContent';
import { IAddPlanDisabledObjModel } from '../../../AddPlanDisabledObjModel';

interface IPlanDataListItemProps  {
  id: string;
  clusterList: any;
  storageList: any;
  planList: any;
  addPlanDisabledObj: IAddPlanDisabledObjModel;
  isExpanded: boolean;
  toggleExpanded: (id) => void;
  planCount: number;
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
}: IPlanDataListItemProps) => {
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

          <Tooltip
            position={TooltipPosition.top}
            content={<div>
              {addPlanDisabledObj.disabledText}
            </div>}>
              <span>
             <Button isDisabled={addPlanDisabledObj.isAddPlanDisabled} onClick={toggleWizardOpen} variant="secondary">
               Add
             </Button>
              </span>
          </Tooltip>
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
          isExpanded={isExpanded}
          toggleWizardOpen={toggleWizardOpen}
        />
      </DataListItem>
    );
  }
  return null;
};

export default PlanDataListItem;
