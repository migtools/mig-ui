import React from 'react';
import {
  Button,
  DataList,
  DataListItem,
  DataListCell,
} from '@patternfly/react-core';
import { Flex, Box } from '@rebass/emotion';
import theme from '../../../theme';
import EmptyStateComponent from './EmptyStateComponent';
import MigrateModal from '../../plan/components/MigrateModal';
import styled from '@emotion/styled';
import { css } from '@emotion/core';
import {
  ServiceIcon,
  DatabaseIcon,
} from '@patternfly/react-icons';
import PlanStatusIcon from './PlanStatusIcon';
import { Progress, ProgressSize, ProgressMeasureLocation, ProgressVariant } from '@patternfly/react-core';
import {
  Dropdown, DropdownToggle, DropdownItem,
  DropdownSeparator, DropdownPosition, DropdownDirection, KebabToggle,
} from '@patternfly/react-core';

const HeaderDataListCell = styled(DataListCell)`
  font-weight: 600;
  margin: auto !important;
`;
const ChildDataListCell = styled(DataListCell)`
  margin: auto !important;
`;
const DataListComponent = ({ isLoading, onWizardToggle, dataList, ...props }) => {
  if (dataList) {
    return (
      <React.Fragment>
        {dataList.length > 0 ? (
          <DataList aria-label="Simple data list example">
            <DataListItem
              key={0}
              isExpanded={false}
              aria-labelledby="simple-item1"
            >
              <HeaderDataListCell width={1}
                //@ts-ignore
                css={css`flex: 0 0 9em !important;`}>
                <span>Name</span>
              </HeaderDataListCell>
              <HeaderDataListCell width={1}>
                <span>Migrations</span>
              </HeaderDataListCell>
              <HeaderDataListCell width={1}
                //@ts-ignore
                css={css`flex: 0 0 9em !important;`}>
                <span>Source</span>
              </HeaderDataListCell>
              <HeaderDataListCell width={1}
                //@ts-ignore
                css={css`flex: 0 0 9em !important;`}>
                <span>Target</span>
              </HeaderDataListCell>
              <HeaderDataListCell width={1}
                //@ts-ignore
                css={css`flex: 0 0 9em !important;`}>
                <span>Repository</span>
              </HeaderDataListCell>
              <HeaderDataListCell width={1}>
                <span>Persistent Volumes</span>
              </HeaderDataListCell>
              <HeaderDataListCell width={3}>
                <span>Last Status</span>
              </HeaderDataListCell>
              <HeaderDataListCell width={1}>
              </HeaderDataListCell>
            </DataListItem>
            {dataList.map((plan, i) => {
              const index = i + 1;
              const MigrationsIcon = styled(ServiceIcon)`
                color: ${() =>
                  plan.migrations.length > 0 ? theme.colors.blue : theme.colors.black};
              `;
              const PVIcon = styled(DatabaseIcon)`
                color: ${() =>
                  plan.persistentVolumes.length > 0 ? theme.colors.blue : theme.colors.black};
              `;

              return (
                <DataListItem
                  key={index}
                  isExpanded={false}
                  aria-labelledby="simple-item1"
                >
                  <ChildDataListCell width={1}
                    //@ts-ignore
                    css={css`flex: 0 0 9em !important;`}>
                    <Flex>
                      <Box m="0 5px 0 0" >
                        <PlanStatusIcon status={plan.status.state} />
                      </Box>
                      <Box m="auto 0 auto 0">
                        <span >{plan.planName}</span>
                      </Box>
                    </Flex>
                  </ChildDataListCell>
                  <ChildDataListCell width={1}>
                    <Flex>
                      <Box m="0 5px 0 0" fontSize="2em">
                        <MigrationsIcon />

                      </Box>
                      <Box m="auto 0 auto 0">
                        <span>{plan.migrations.length}</span>

                      </Box>
                    </Flex>
                  </ChildDataListCell>
                  <ChildDataListCell width={1}
                    //@ts-ignore
                    css={css`flex: 0 0 9em !important;`}>
                    <span>{plan.sourceCluster}</span>
                  </ChildDataListCell>
                  <ChildDataListCell width={1}
                    //@ts-ignore
                    css={css`flex: 0 0 9em !important;`}>
                    <span>{plan.targetCluster}</span>
                  </ChildDataListCell>
                  <ChildDataListCell width={1}
                    //@ts-ignore
                    css={css`flex: 0 0 9em !important;`}>
                    <span>{plan.selectedStorage}</span>
                  </ChildDataListCell>
                  <ChildDataListCell width={1}>
                    <Flex>
                      <Box m="0 5px 0 0" fontSize="2em">
                        <PVIcon />

                      </Box>
                      <Box m="auto 0 auto 0">
                        <span>{plan.persistentVolumes.length}</span>

                      </Box>
                    </Flex>
                  </ChildDataListCell>
                  <ChildDataListCell width={1}>
                    {statusComponent(plan)}
                  </ChildDataListCell>
                  <ChildDataListCell width={2}>
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
                        <MigrateModal
                          plan={plan}
                          trigger={
                            <Button
                              isDisabled={isLoading}
                              variant="primary"
                            >
                              Migrate
                            </Button>
                          }
                        />

                      </Box>
                    </Flex>
                  </ChildDataListCell>
                  <ChildDataListCell
                    //@ts-ignore
                    css={css` text-align: right;`}
                  >
                    <Dropdown
                      toggle={<KebabToggle />}
                      isPlain
                    />

                  </ChildDataListCell>
                </DataListItem>
              );
            })}
          </DataList>
        ) : (
            <Flex alignItems="center" justifyContent="center">
              <Box>

                <EmptyStateComponent onWizardToggle={onWizardToggle} type="plan" />
              </Box>
            </Flex>
          )}
      </React.Fragment>
    );
  }
  return null;
};

function statusComponent(plan) {
  let statusComponent;

  const printState =
    plan.status.state === 'Not Started' ||
    plan.status.state === 'Staged Successfully' ||
    plan.status.state === 'Migrated Successfully';

  const printStateAndProgress =
    plan.status.state === 'Staging' ||
    plan.status.state === 'Migrating';

  if (printState) {
    statusComponent = (
      <span>{plan.status.state}</span>
    );
  } else if (printStateAndProgress) {
    statusComponent = (
      <div>
        <div>{plan.status.state}</div>
        <Progress value={plan.status.progress} title="" size={ProgressSize.sm} />
      </div>
    );
  } else {
    statusComponent = (
      <span>Not understood</span>
    );
  }

  return statusComponent;
}

export default DataListComponent;
