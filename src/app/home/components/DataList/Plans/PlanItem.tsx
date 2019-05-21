import React from 'react';
import { Flex, Box } from '@rebass/emotion';
import theme from '../../../../../theme';
import {
    Button,
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
import { useOpenModal } from '../../../duck/hooks';


const PlanItem = ({ plan, planIndex, isLoading, ...props }) => {
    const MigrationsIcon = styled(ServiceIcon)`
                    color: ${() =>
            plan.planState.migrations.length > 0 ? theme.colors.blue : theme.colors.black};
                  `;
    const PVIcon = styled(DatabaseIcon)`
                    color: ${() =>
            plan.planState.persistentVolumes.length > 0 ? theme.colors.blue : theme.colors.black};
                  `;
    const StyledDataListAction = styled(DataListAction)`
        width: 15em;
    `;
    const [isOpen, toggleOpen] = useOpenModal(false);

    return (
        <DataListItem
            key={planIndex}
            aria-labelledby="simple-item1"
        >
            <DataListItemRow>
                <DataListItemCells
                    dataListCells={[
                        <DataListCell key="name" width={2}>
                            <Flex>
                                <Box m="0 5px 0 0" >
                                    <PlanStatusIcon status={plan.planState.status.state || 'N/A'} />
                                </Box>
                                <Box m="auto 0 auto 0">
                                    <span >{plan.MigPlan.metadata.name}</span>
                                </Box>
                            </Flex>
                        </DataListCell>,
                        <DataListCell key="migrations" width={2}>
                            <Flex>
                                <Box m="0 5px 0 0" >
                                    <MigrationsIcon />
                                </Box>
                                <Box m="auto 0 auto 0">
                                    <span>{plan.planState.migrations.length}</span>
                                </Box>
                            </Flex>
                        </DataListCell>,
                        <DataListCell key="source" width={2}>
                            <span>{plan.MigPlan.spec.srcMigClusterRef.name}</span>
                        </DataListCell>,
                        <DataListCell key="target" width={2}>
                            <span>{plan.MigPlan.spec.destMigClusterRef.name}</span>
                        </DataListCell>,
                        <DataListCell key="repo" width={2}>
                            <span>{plan.MigPlan.spec.migStorageRef.name}</span>
                        </DataListCell>,
                        <DataListCell key="vols" width={2}>
                            <Flex>
                                <Box m="0 5px 0 0" >
                                    <PVIcon />
                                </Box>
                                <Box m="auto 0 auto 0">
                                    <span>{plan.planState.persistentVolumes.length}</span>

                                </Box>
                            </Flex>
                        </DataListCell>,
                        <DataListCell key="status" width={3}>
                            <PlanStatus plan={plan.planState} {...props} />
                        </DataListCell>,

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
                                onClick={toggleOpen}
                            >
                                Migrate
                            </Button>
                            <MigrateModal
                                plan={plan}
                                isOpen={isOpen}
                                onHandleClose={toggleOpen}
                            />
                        </Box>
                    </Flex>

                </StyledDataListAction>
            </DataListItemRow>
        </DataListItem>
    );
};

export default PlanItem;
