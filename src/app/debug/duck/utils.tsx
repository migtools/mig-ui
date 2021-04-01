import React from 'react';
import { Flex, FlexItem, TreeViewDataItem } from '@patternfly/react-core';
import { IDebugRefRes, IDebugRefWithStatus, IDebugTreeNode } from './types';
import crawl from 'tree-crawl';
import TreeActionsDropdown from '../../home/pages/PlanDebugPage/components/TreeActionsDropdown';
import TreeViewStatusIcon from '../components/TreeViewStatusIcon';
import PlanStatus from '../../home/pages/PlansPage/components/PlanStatus';
import { IMigration, IPlan } from '../../plan/duck/types';
import MigrationStatusIcon from '../../home/pages/PlansPage/components/MigrationStatusIcon';
import { IMigrationWithStatus } from '../../home/pages/PlansPage/types';
const uuidv1 = require('uuid/v1');
const styles = require('./utils.module').default;

const getShallowPropsForNode = (
  rawNode: IDebugTreeNode,
  debugRefs: IDebugRefWithStatus[],
  plans: IPlan[]
): TreeViewDataItem => {
  const matchingPlanRef = plans?.find((plan) => plan.MigPlan.metadata.name === rawNode?.name);
  const matchingDebugRef = debugRefs?.find((ref) => ref?.refName === rawNode?.name);
  return {
    id: rawNode.name,
    name: (
      <Flex className={matchingDebugRef?.debugResourceStatus?.hasRunning && styles.activeHighlight}>
        <FlexItem
          className={styles.treeID}
        >{`${rawNode.kind}: ${rawNode.namespace}/${rawNode.name}`}</FlexItem>
        {matchingDebugRef?.resourceKind === 'Plan' ? (
          <FlexItem>
            <PlanStatus plan={matchingPlanRef} />
          </FlexItem>
        ) : (
          <FlexItem className={styles.statusIcon}>
            <div className={styles.alignStatus}>
              <TreeViewStatusIcon plans={plans} debugRef={matchingDebugRef} />
            </div>
          </FlexItem>
        )}
      </Flex>
    ),
    action: <TreeActionsDropdown rawNode={rawNode} />,
  };
};

const convertNode = (rawNode: IDebugTreeNode, ctx, debugRefs, plans): void => {
  const outNode: TreeViewDataItem = getShallowPropsForNode(rawNode, debugRefs, plans);

  if (rawNode.children) {
    outNode.children = rawNode.children;
  }

  if (ctx.parent) {
    ctx.parent.children[ctx.index] = outNode;
  }

  ctx.replace(outNode);
};

export const convertRawTreeToViewTree = (
  inTree: IDebugTreeNode,
  debugRefs: IDebugRefWithStatus[],
  plans: IPlan[]
): TreeViewDataItem[] => {
  // Deep clone. Not the most efficient, but easy and we're not going for
  // blazing performance here.
  const workingTree: IDebugTreeNode = JSON.parse(JSON.stringify(inTree));

  crawl(
    workingTree,
    (rawNode: IDebugTreeNode, ctx) => convertNode(rawNode, ctx, debugRefs, plans),
    {
      order: 'pre',
    }
  );

  // Doesn't seem to be an easy way from within the crawler to replace
  // the root node, so doing that here and just bringing in the rest of it
  return [
    {
      id: uuidv1(),
      ...getShallowPropsForNode(workingTree, debugRefs, plans),
      children: workingTree.children,
      defaultExpanded: true,
    },
  ];
};
