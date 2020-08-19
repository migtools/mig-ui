import React from 'react';
import {
  Button,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Popover,
  PopoverPosition,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import alignment from '@patternfly/react-styles/css/utilities/Alignment/alignment';
import {
  IconSize,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
const styles = require('./ResultsStep.module');

interface IConditionsGridProps {
  conditions: any[];
  incompatibleNamespaces: any[];
}

const ConditionsGrid: React.FunctionComponent<IConditionsGridProps> = ({
  conditions,
  incompatibleNamespaces,
}: IConditionsGridProps) => (
  <Grid
    hasGutter
    className={`${styles.conditionsGrid} ${spacing.mtMd} ${spacing.mxAuto} ${spacing.mbLg}`}
  >
    {conditions.map((condition, conditionIndex) => (
      <React.Fragment key={conditionIndex}>
        <GridItem span={1} className={alignment.textAlignRight}>
          {condition.type === 'Ready' && (
            <span className="pf-c-icon pf-m-success">
              <CheckCircleIcon size={IconSize.sm} />
            </span>
          )}
          {condition.type === 'Warn' && (
            <span className="pf-c-icon pf-m-warning">
              <ExclamationTriangleIcon size={IconSize.sm} />
            </span>
          )}
          {condition.type === 'Error' && (
            <span className="pf-c-icon pf-m-danger">
              <ExclamationCircleIcon size={IconSize.sm} />
            </span>
          )}
        </GridItem>
        <GridItem span={11}>
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
                          <ExclamationTriangleIcon size={IconSize.sm} />
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
                      <TextContent className={spacing.mbMd}>
                        <Text component={TextVariants.p}>
                          Namespaces with GVKs that are not supported on the target cluster will not
                          be migrated with the rest of the migration plan. They will need to be
                          migrated manually, post migration.
                        </Text>
                      </TextContent>
                      <TextContent className={spacing.mbMd}>
                        <Text component={TextVariants.h3}>
                          Namespaces with resource GVKs not supported on the target cluster:
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
        </GridItem>
      </React.Fragment>
    ))}
  </Grid>
);

export default ConditionsGrid;
