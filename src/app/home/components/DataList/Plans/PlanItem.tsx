import React, { Component } from 'react';
import { Flex, Box } from '@rebass/emotion';
import theme from '../../../../../theme';
import {
    Button,
    DataList,
    DataListToggle,
    DataListContent,
    Dropdown,
    KebabToggle,
    DataListItem,
    DataListCell,
    DataListItemRow,
    DataListItemCells,
    DataListAction,
} from '@patternfly/react-core';
import styled from '@emotion/styled';
import {
    ServiceIcon,
    DatabaseIcon,
} from '@patternfly/react-icons';
import PlanStatusIcon from '../../Card/Status/PlanStatusIcon';
import PlanStatus from './PlanStatus';
import MigrateModal from '../../../../plan/components/MigrateModal';


const PlanItem = ({ plan, planIndex, isLoading, ...props }) => {
    const index = planIndex + 1;
    const MigrationsIcon = styled(ServiceIcon)`
                color: ${() =>
            plan.migrations.length > 0 ? theme.colors.blue : theme.colors.black};
              `;
    const PVIcon = styled(DatabaseIcon)`
                color: ${() =>
            plan.persistentVolumes.length > 0 ? theme.colors.blue : theme.colors.black};
              `;
    const StyledDataListAction = styled(DataListAction)`
    width: 15em;
`;

    return (
        <DataListItem
            key={0}
            aria-labelledby="simple-item1"
        >
            <DataListItemRow>
                <DataListItemCells
                    dataListCells={[
                        <DataListCell key="name" width={1}>
                            <Flex>
                                <Box m="0 5px 0 0" >
                                    <PlanStatusIcon status={plan.status.state || 'N/A'} />
                                </Box>
                                <Box m="auto 0 auto 0">
                                    <span >{plan.planName}</span>
                                </Box>
                            </Flex>
                        </DataListCell>,
                        <DataListCell key="migrations" width={1}>
                            <Flex>
                                <Box m="0 5px 0 0" fontSize="2em">
                                    <MigrationsIcon />
                                </Box>
                                <Box m="auto 0 auto 0">
                                    <span>{plan.migrations.length}</span>
                                </Box>
                            </Flex>
                        </DataListCell>,
                        <DataListCell key="source" width={1}>
                            <span>{plan.sourceCluster}</span>
                        </DataListCell>,
                        <DataListCell key="target" width={1}>
                            <span>{plan.targetCluster}</span>
                        </DataListCell>,
                        <DataListCell key="repo" width={1}>
                            <span>{plan.selectedStorage}</span>
                        </DataListCell>,
                        <DataListCell key="vols" width={1}>
                            <Flex>
                                <Box m="0 5px 0 0" fontSize="2em">
                                    <PVIcon />

                                </Box>
                                <Box m="auto 0 auto 0">
                                    <span>{plan.persistentVolumes.length}</span>

                                </Box>
                            </Flex>
                        </DataListCell>,
                        <DataListCell key="status" width={3}>
                            <PlanStatus plan={plan} {...props} />
                        </DataListCell>,
                        <DataListCell width={1} key="spacer" />,

                    ]}
                />
                <StyledDataListAction aria-label="add-plan" aria-labelledby="plan-item" id="add-plan">
                    <Flex justifyContent="flex-end">
                        <Box mx={1}>
                            <Button
                                isDisabled={isLoading}
                                variant="primary"
                                onClick={() => props.onStageTriggered(plan)}
                            >
                                Stage
                         </Button>
                        </Box>
                        <Box mx={1}>
                            <Button
                                isDisabled={isLoading}
                                variant="primary"
                            >
                                Migrate
                             </Button>
                            <MigrateModal
                                plan={plan}>
                            </MigrateModal>
                        </Box>
                    </Flex>

                </StyledDataListAction>
            </DataListItemRow>
        </DataListItem>

        // <DataListItem
        //     key={index}
        //     isExpanded={false}
        //     aria-labelledby="simple-item1"
        // >
        //     <DataListCell width={1}>
        //         <Flex>
        //             <Box m="0 5px 0 0" >
        //                 <PlanStatusIcon status={plan.status.state || 'N/A'} />
        //             </Box>
        //             <Box m="auto 0 auto 0">
        //                 <span >{plan.planName}</span>
        //             </Box>
        //         </Flex>
        //     </DataListCell>
        //     <DataListCell width={1}>
        //         <Flex>
        //             <Box m="0 5px 0 0" fontSize="2em">
        //                 <MigrationsIcon />

        //             </Box>
        //             <Box m="auto 0 auto 0">
        //                 <span>{plan.migrations.length}</span>

        //             </Box>
        //         </Flex>
        //     </DataListCell>
        //     <DataListCell width={1}>
        //         <span>{plan.sourceCluster}</span>
        //     </DataListCell>
        //     <DataListCell width={1}>
        //         <span>{plan.targetCluster}</span>
        //     </DataListCell>
        //     <DataListCell width={1}>
        //         <span>{plan.selectedStorage}</span>
        //     </DataListCell>
        //     <DataListCell width={1}>
        //         <Flex>
        //             <Box m="0 5px 0 0" fontSize="2em">
        //                 <PVIcon />

        //             </Box>
        //             <Box m="auto 0 auto 0">
        //                 <span>{plan.persistentVolumes.length}</span>

        //             </Box>
        //         </Flex>
        //     </DataListCell>
        //     <DataListCell width={1}>
        //         <PlanStatus plan={plan} {...props} />
        //     </DataListCell>
        //     <DataListCell width={2}>
        //         <Flex justifyContent="flex-end">
        //             <Box mx={1}>
        //                 <Button
        //                     isDisabled={isLoading}
        //                     variant="primary"
        //                     onClick={() => props.onStageTriggered(plan)}
        //                 >
        //                     Stage
        //                 </Button>
        //             </Box>
        //             <Box mx={1}>
        //                 <MigrateModal
        //                     plan={plan}
        //                     trigger={
        //                         <Button
        //                             isDisabled={isLoading}
        //                             variant="primary"
        //                         >
        //                             Migrate
        //                     </Button>
        //                     }
        //                 />

        //             </Box>
        //         </Flex>
        //     </DataListCell>
        //     <DataListCell
        //     >
        //         <Dropdown
        //             toggle={<KebabToggle />}
        //             isPlain
        //         />

        //     </DataListCell>
        // </DataListItem>
    );
}


export default PlanItem;

