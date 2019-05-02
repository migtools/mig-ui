import React, { Component } from 'react';
import { Flex, Box } from '@rebass/emotion';
import {
    Button,
    DataListItem,
    DataListCell,
    DataListItemCells,
    DataListItemRow,
} from '@patternfly/react-core';
import StatusIcon from '../../../../common/components/StatusIcon';
import { LinkIcon } from '@patternfly/react-icons';

const StorageItem = ({ storage, storageIndex, isLoading, ...props }) => {
    const clusterName = storage.MigCluster.metadata.name;
    const clusterStatus = storage.status;
    const clusterUrl =
        storage.Cluster.spec.kubernetesApiEndpoints.serverEndpoints[0].serverAddress;

    const associatedPlanCount = props.associatedPlans[clusterName];
    const planText = associatedPlanCount === 1 ? 'plan' : 'plans';

    return (
        <DataListItem
            key={storageIndex}
            aria-labelledby=""
        >
            <DataListItemRow>
                <DataListItemCells
                    dataListCells={[
                        <DataListCell key={name} width={1}>
                            <StatusIcon status="success" />
                            <span id="simple-item1">{storage.metadata.name}</span>
                        </DataListCell>,
                        <DataListCell key="url" width={2}>
                            <a
                                target="_blank"
                                href={storage.spec.bucketUrl}
                            >
                                {storage.spec.bucketUrl}
                            </a>
                        </DataListCell>,
                        <DataListCell key="count" width={2}>
                            <LinkIcon /> {associatedPlanCount} associated migration {planText}
                        </DataListCell>,
                        <DataListCell key="actions" width={2}>
                            <Flex justifyContent="flex-end">
                                <Box mx={1}>
                                    <Button variant="secondary">Edit</Button>
                                </Box>
                                <Box mx={1}>
                                    <Button
                                        variant="danger"
                                    >
                                        Remove
                      </Button>
                                </Box>
                            </Flex>
                        </DataListCell>,
                    ]} />

            </DataListItemRow>
        </DataListItem>
    );
};
export default StorageItem;
