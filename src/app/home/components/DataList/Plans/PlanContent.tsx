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

const PlanContent = ({ isLoading, isExpanded, ...props }) => {
    return (
        <DataListContent
            noPadding
            aria-label="Primary Content Details"
            isHidden={!isExpanded}
        >
            <DataList aria-label="Simple data list example">
                <PlanHeader />
                {props.dataList.map((plan, planIndex) => {
                    return (
                        <PlanItem key={planIndex} plan={plan} planIndex={planIndex} isLoading={isLoading} {...props} />
                    );
                })}

            </DataList>
        </DataListContent>
    );
}
export default PlanContent;
