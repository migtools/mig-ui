import React from 'react';
import { Flex, FlexItem, TreeViewDataItem } from '@patternfly/react-core';
import { IDebugTreeNode } from './types';
import crawl from 'tree-crawl';
import TreeActionsDropdown from '../../home/pages/PlanDebugPage/components/TreeActionsDropdown';
import TreeViewStatusIcon from '../components/TreeViewStatusIcon';
import { IPlan } from '../../plan/duck/types';
const styles = require('./utils.module').default;

const getShallowPropsForNode = (rawNode: IDebugTreeNode, plans: IPlan[]): TreeViewDataItem => {
  const nodeIdentifier = rawNode.namespace
    ? `${rawNode.kind}: ${rawNode.clusterType}/${rawNode.namespace}/${rawNode.name}`
    : `${rawNode.kind}: ${rawNode.clusterType}/${rawNode.name}`;
  return {
    id: rawNode.name,
    name: (
      <Flex className={rawNode.debugRef?.debugResourceStatus?.hasRunning && styles.activeHighlight}>
        <FlexItem className={styles.treeID}>{`${nodeIdentifier}`}</FlexItem>
        <FlexItem className={styles.statusIcon}>
          <div className={styles.alignStatus}>
            <TreeViewStatusIcon plans={plans} debugRef={rawNode.debugRef} />
          </div>
        </FlexItem>
      </Flex>
    ),
    action: <TreeActionsDropdown rawNode={rawNode} />,
  };
};

const convertNode = (rawNode: IDebugTreeNode, ctx, plans): void => {
  const outNode: TreeViewDataItem = getShallowPropsForNode(rawNode, plans);

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
  plans: IPlan[]
): TreeViewDataItem[] => {
  // Deep clone. Not the most efficient, but easy and we're not going for
  // blazing performance here.
  const workingTree: IDebugTreeNode = JSON.parse(JSON.stringify(inTree));

  crawl(workingTree, (rawNode: IDebugTreeNode, ctx) => convertNode(rawNode, ctx, plans), {
    order: 'pre',
  });

  // Doesn't seem to be an easy way from within the crawler to replace
  // the root node, so doing that here and just bringing in the rest of it

  return [
    {
      ...getShallowPropsForNode(workingTree, plans),
      children: workingTree.children,
      defaultExpanded: true,
    },
  ];
};
