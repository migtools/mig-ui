import React, { useState, useRef, useEffect } from 'react';
import {
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
  onPlanSubmit,
  isLoading,
  planList,
  plansDisabled,
  onStartPolling,
  onStopPolling,
  isExpanded,
  toggleExpanded,
}) => {
  const [isOpen, toggleOpen] = useOpenModal(false);
  const [myPlanList, setMyPlanList] = useState([]);
  const [myClusterList, setMyClusterList] = useState([]);
  const [myStorageList, setMyStorageList] = useState([]);

  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  const prevStorage: any = usePrevious(storageList);
  const prevPlans: any = usePrevious(planList);
  const prevClusters: any = usePrevious(clusterList);

  useEffect(() => {
    if (JSON.stringify(prevStorage) !== JSON.stringify(storageList)) {
      setMyStorageList(storageList);
    }
    if (JSON.stringify(prevPlans) !== JSON.stringify(planList)) {
      setMyPlanList(planList);
    }
    if (JSON.stringify(prevClusters) !== JSON.stringify(clusterList)) {
      setMyClusterList(clusterList);
    }
  }, [planList, clusterList, storageList]);

  if (myPlanList) {
    return (
      <DataListItem aria-labelledby="ex-item1" isExpanded={isExpanded}>
        <DataListItemRow>
          <DataListToggle
            onClick={() => {
              if (isExpanded) {
                onStopPolling();
              } else {
                onStartPolling();
              }
              toggleExpanded(id);
            }}
            isExpanded={isExpanded}
            id="plan-toggle"
          />
          <DataListItemCells
            dataListCells={[
              <DataListCell id="plan-item" key="plans">
                <span id="name">Plans</span>
              </DataListCell>,
            ]}
          />
          <DataListAction aria-label="add-plan" aria-labelledby="plan-item" id="add-plan">
            <Button isDisabled={plansDisabled} onClick={toggleOpen} variant="link">
              <PlusCircleIcon /> Add Plan
            </Button>
            <WizardContainer
              planList={myPlanList}
              clusterList={myClusterList}
              storageList={myStorageList}
              isOpen={isOpen}
              onHandleClose={toggleOpen}
              isLoading={isLoading}
              onPlanSubmit={onPlanSubmit}
            />
          </DataListAction>
        </DataListItemRow>
        <PlanContent
          onPlanSubmit={onPlanSubmit}
          plansDisabled={plansDisabled}
          planList={myPlanList}
          clusterList={myClusterList}
          storageList={myStorageList}
          isLoading={isLoading}
          isExpanded={isExpanded}
        />
      </DataListItem>
    );
  }
  return null;
};

export default PlanDataListItem;
