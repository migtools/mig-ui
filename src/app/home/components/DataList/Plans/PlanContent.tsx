import React, { Component } from 'react';
import { Flex, Box } from '@rebass/emotion';
import theme from '../../../../../theme';
import {
    Button,
    DataList,
    DataListItem,
    DataListCell,
    DataListToggle,
    DataListContent,
} from '@patternfly/react-core';
import styled from '@emotion/styled';
import PlanHeader from './PlanHeader';
import PlanItem from './PlanItem';
import DataListEmptyState from '../DataListEmptyState';
interface PlanContentProps {
    planList: any,
    onPlanSubmit: () => void,
    clusterList: any,
    storageList: any
    isLoading: boolean,
    isExpanded: boolean,
    plansDisabled: boolean,

}

const PlanContent: React.FunctionComponent<PlanContentProps> = (props) => {
    return (
        <DataListContent
            noPadding
            aria-label="plan-items-content-containter"
            isHidden={!props.isExpanded}
        >
            {props.planList.length > 0 ?
                <DataList aria-label="plan-item-list">
                    <PlanHeader />
                    {props.planList.map((plan, planIndex) => {
                        return (
                            <PlanItem
                                key={planIndex}
                                plan={plan}
                                planIndex={planIndex}
                                isLoading={props.isLoading}
                                {...props}
                            />
                        );
                    })}

                </DataList>
                : (
                    <Flex alignItems="center" justifyContent="center">
                        <Box>
                            <DataListEmptyState
                                type="plan"
                                clusterList={props.clusterList}
                                storageList={props.storageList}
                                onPlanSubmit={props.onPlanSubmit}
                                isLoading={props.isLoading}
                                {...props}
                            />
                        </Box>
                    </Flex>
                )
            }
        </DataListContent>
    );
};
export default PlanContent;
