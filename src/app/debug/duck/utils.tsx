import React from 'react';
import { Flex, FlexItem, TreeViewDataItem } from '@patternfly/react-core';
import { IDebugRefWithStatus, IDebugTreeNode } from './types';
import crawl from 'tree-crawl';
import TreeActionsDropdown from '../../home/pages/PlanDebugPage/components/TreeActionsDropdown';
import TreeViewStatusIcon from '../components/TreeViewStatusIcon';
import { IPlan } from '../../plan/duck/types';
const styles = require('./utils.module').default;

const getShallowPropsForNode = (
  rawNode: IDebugTreeNode,
  debugRefs: IDebugRefWithStatus[],
  plans: IPlan[]
) => {
  const matchingDebugRef = debugRefs?.find((ref) => ref?.refName === rawNode?.name);
  return {
    id: rawNode.name,
    kind: rawNode.kind,
    namespace: rawNode.namespace,
    status: (
      <Flex className={matchingDebugRef?.debugResourceStatus?.hasRunning && styles.activeHighlight}>
        <FlexItem className={styles.statusIcon}>
          <div className={styles.alignStatus}>
            <TreeViewStatusIcon plans={plans} debugRef={matchingDebugRef} />
          </div>
        </FlexItem>
      </Flex>
    ),
    dropdown: (
      <>
        <TreeActionsDropdown rawNode={rawNode} />
      </>
    ),
  };
};

const convertNode = (rawNode: IDebugTreeNode, ctx, debugRefs, plans): void => {
  const outNode: any = getShallowPropsForNode(rawNode, debugRefs, plans);

  if (rawNode.children) {
    outNode.children = rawNode.children;
  }

  if (ctx.parent) {
    ctx.parent.children[ctx.index] = outNode;
  }
  console.log('convertNode');
  ctx.replace(outNode);
};

export const convertRawTreeToViewTree = (
  inTree: IDebugTreeNode,
  debugRefs: IDebugRefWithStatus[],
  plans: IPlan[]
) => {
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
  console.log('convertRawTreeToViewTree');
  return [
    {
      ...getShallowPropsForNode(workingTree, debugRefs, plans),
      children: workingTree.children,
      defaultExpanded: true,
    },
  ];
};
