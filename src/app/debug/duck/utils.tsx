import React from 'react';
import { Flex, FlexItem, TreeViewDataItem } from '@patternfly/react-core';
import { IDebugRefWithStatus, IDebugTreeNode } from './types';
import crawl from 'tree-crawl';
import TreeActionsDropdown from '../../home/pages/PlanDebugPage/components/TreeActionsDropdown';
import TreeViewStatusIcon from '../components/TreeViewStatusIcon';
import { IPlan } from '../../plan/duck/types';
const uuidv1 = require('uuid/v1');
const styles = require('./utils.module').default;

const getShallowPropsForNode = (
  rawNode: IDebugTreeNode,
  debugRefs: IDebugRefWithStatus[],
  plans: IPlan[]
): TreeViewDataItem => {
  const matchingDebugRef = debugRefs?.find((ref) => ref?.refName === rawNode?.name);
  const nodeIdentifier = rawNode.namespace
    ? `${rawNode.kind}: ${rawNode.clusterType}/${rawNode.namespace}/${rawNode.name}`
    : `${rawNode.kind}: ${rawNode.clusterType}/${rawNode.name}`;
  return {
    id: rawNode.name,
    name: (
      <Flex
        className={
          (matchingDebugRef?.debugResourceStatus?.hasPending ||
            matchingDebugRef?.debugResourceStatus?.hasRunning) &&
          styles.activeHighlight
        }
      >
        <FlexItem className={styles.treeID}>{`${nodeIdentifier}`}</FlexItem>
        <FlexItem className={styles.statusIcon}>
          <div className={styles.alignStatus}>
            <TreeViewStatusIcon plans={plans} debugRef={matchingDebugRef} />
          </div>
        </FlexItem>
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
