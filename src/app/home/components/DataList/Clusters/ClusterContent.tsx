import React, { Component } from 'react';
import { Flex, Box } from '@rebass/emotion';
import theme from '../../../../../theme';
import {
    DataList,
    DataListContent,
} from '@patternfly/react-core';
import ClusterItem from './ClusterItem';

const ClusterContent = ({ dataList, isLoading, isExpanded, associatedPlans, ...props }) => {
    return (
        <DataListContent
            noPadding
            aria-label="cluster-items-content-container"
            isHidden={!isExpanded}
        >
            <DataList aria-label="cluster-item-list">
                {dataList.map((cluster, clusterIndex) => {
                    return (
                        <ClusterItem
                            key={clusterIndex}
                            isLoading
                            cluster={cluster}
                            clusterIndex={clusterIndex}
                            associatedPlans={associatedPlans}
                        />
                    );
                })}
            </DataList>
        </DataListContent>
    );
};
export default ClusterContent;
