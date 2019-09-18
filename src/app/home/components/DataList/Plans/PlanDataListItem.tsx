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
import { PlusCircleIcon } from '@patternfly/react-icons';
import WizardContainer from '../../../../plan/components/Wizard/WizardContainer';
import PlanContent from './PlanContent';

const PlanDataListItem = ({
  id,
  clusterList,
  storageList,
  planList,
  plansDisabled,
  isExpanded,
  toggleExpanded,
  planCount
}) => {
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
            <Button isDisabled={plansDisabled} onClick={toggleWizardOpen} variant="secondary">
              Add plan
            </Button>
            <WizardContainer
              planList={planList}
              clusterList={clusterList}
              storageList={storageList}
              isOpen={isWizardOpen}
              onHandleWizardModalClose={toggleWizardOpen}
            />
          </DataListAction>
        </DataListItemRow>
        <PlanContent
          plansDisabled={plansDisabled}
          planList={planList}
          clusterList={clusterList}
          storageList={storageList}
          isExpanded={isExpanded}
          toggleWizardOpen={toggleWizardOpen}
          isWizardOpen={isWizardOpen}

        />
      </DataListItem>
    );
  }
  return null;
};

export default PlanDataListItem;
