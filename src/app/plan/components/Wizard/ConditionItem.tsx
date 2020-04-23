import React from 'react';
import {
  Button,
  DataListItem,
  DataListCell,
  DataListItemCells,
  DataListItemRow,
  Flex,
  FlexItem,
  Popover,
  PopoverPosition,
  List,
  ListItem,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  IconSize,
  CheckCircleIcon,
  ExclamationCircleIcon,
  WarningTriangleIcon,
} from '@patternfly/react-icons';

const ConditionItem = ({ condition, conditionIndex, incompatibleNamespaces }) => {
  return (
    <DataListItem key={conditionIndex} aria-labelledby="cluster-item">
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="type" width={1}>
              <Flex>
                {condition.type === 'Ready' && (
                  <FlexItem>
                    <span className="pf-c-icon pf-m-success">
                      <CheckCircleIcon size={IconSize.sm} />
                    </span>
                  </FlexItem>
                )}
                {condition.type === 'Warn' && (
                  <FlexItem>
                    <span className="pf-c-icon pf-m-warning">
                      <WarningTriangleIcon size={IconSize.sm} />
                    </span>
                  </FlexItem>
                )}
                {condition.type === 'Error' && (
                  <FlexItem>
                    <span className="pf-c-icon pf-m-danger">
                      <ExclamationCircleIcon size={IconSize.sm} />
                    </span>
                  </FlexItem>
                )}
                <FlexItem>
                  <span id="condition-icon">{condition.type}</span>
                </FlexItem>
              </Flex>
            </DataListCell>,
            <DataListCell key="message" width={5}>
              <Flex>
                <FlexItem>
                  <span id="condition-message">{condition.message}</span>
                  {condition.isGVKCondition && (
                    <Popover
                      minWidth="30em"
                      position={PopoverPosition.top}
                      headerContent={
                        <Flex>
                          <FlexItem>
                            <span className="pf-c-icon pf-m-warning">
                              <WarningTriangleIcon size={IconSize.sm} />
                            </span>
                          </FlexItem>
                          <FlexItem>
                            <TextContent className={spacing.mbMd}>
                              <Text component={TextVariants.h2}>Unsupported resource GVKs</Text>
                            </TextContent>
                          </FlexItem>
                        </Flex>
                      }
                      bodyContent={
                        <>
                          <List>
                            <ListItem>
                              <TextContent className={spacing.mbMd}>
                                <Text component={TextVariants.p}>
                                  The GVKs below will not be migrated with the rest of the plan and
                                  will need to be updated in the target namespaces post migration.
                                </Text>
                              </TextContent>
                            </ListItem>
                            <ListItem>
                              <TextContent className={spacing.mbMd}>
                                <Text component={TextVariants.p}>
                                  Optionally, you can return to the namespace selection page and
                                  remove namespaces with unsupported GVKs from the plan.
                                </Text>
                              </TextContent>
                            </ListItem>
                          </List>
                          <TextContent className={spacing.mbMd}>
                            <Text component={TextVariants.h3}>
                              Namespaces with resource GVKs not supported by the target cluster:
                            </Text>
                          </TextContent>
                          <div aria-label="storage-item-list">
                            {incompatibleNamespaces.map((namespace, namespaceIndex) => {
                              return (
                                <div>
                                  <TextContent>
                                    <Text component={TextVariants.h6}>{namespace.name}</Text>
                                  </TextContent>
                                  {namespace.gvks.map((gvk, gvkIndex) => {
                                    return (
                                      <TextContent className={spacing.mlSm}>
                                        <Text component={TextVariants.p}>
                                          {`${gvk.group}/${gvk.version} Resource=${gvk.kind}`}
                                        </Text>
                                      </TextContent>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      }
                    >
                      <Button variant="link">See details</Button>
                    </Popover>
                  )}
                </FlexItem>
              </Flex>
            </DataListCell>,
          ]}
        />
        ,
      </DataListItemRow>
    </DataListItem>
  );
};
export default ConditionItem;
