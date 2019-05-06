import React from 'react';
import { Flex, Box } from '@rebass/emotion';
import {
    Button,
    DataListItem,
    DataListToggle,
    DataListItemRow,
    DataListItemCells,
    DataListCell,
    DataListAction,
} from '@patternfly/react-core';
import { useExpandDataList, useOpenModal } from '../../../duck/hooks';
import { PlusCircleIcon } from '@patternfly/react-icons';
import Wizard from '../../../../plan/components/Wizard';
import PlanContent from './PlanContent';
import DataListEmptyState from '../DataListEmptyState';

const PlanDataListItem = ({
    clusterList,
    storageList,
    onPlanSubmit,
    isLoading,
    dataList,
    plansDisabled,
    ...props
}) => {
    const [isExpanded, toggleExpanded] = useExpandDataList(false);
    const [isOpen, toggleOpen] = useOpenModal(false);

    if (dataList) {
        return (
            <DataListItem aria-labelledby="ex-item1" isExpanded={isExpanded}>
                <DataListItemRow>
                    <DataListToggle
                        onClick={() => toggleExpanded()}
                        isExpanded={isExpanded}
                        id="cluster-toggle"
                    />
                    <DataListItemCells
                        dataListCells={[
                            <DataListCell id="plan-item" key="plans">
                                <span id="name" >Plans</span>
                            </DataListCell>,
                        ]}
                    />
                    <DataListAction aria-label="add-plan" aria-labelledby="plan-item" id="add-plan">
                        <Button isDisabled={plansDisabled} onClick={toggleOpen} variant="link">
                            <PlusCircleIcon /> Add Plan
                        </Button>
                        <Wizard
                            clusterList={clusterList}
                            storageList={storageList}
                            isOpen={isOpen}
                            onHandleClose={toggleOpen}
                            isLoading={isLoading}
                            onPlanSubmit={onPlanSubmit}
                        />
                    </DataListAction>
                </DataListItemRow>
                <PlanContent
                    plansDisabled={plansDisabled}
                    dataList={dataList}
                    isLoading={isLoading}
                    isExpanded={isExpanded}
                    {...props}
                />

            </DataListItem >
        );
    }
    return null;
};

export default PlanDataListItem;
