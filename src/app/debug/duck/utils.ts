import { IDebugTreeNode } from './types';
import { ITreeDataItem } from '../../common/components/TreeView';
import crawl from 'tree-crawl';

const buildViewName = (rawNode: IDebugTreeNode): string => {
  return `${rawNode.kind}: ${rawNode.namespace}/${rawNode.name}`;
};

const convertNode = (rawNode: IDebugTreeNode, ctx): void => {
  const outNode: ITreeDataItem = {
    name: buildViewName(rawNode),
  };

  if (rawNode.children) {
    outNode.children = rawNode.children;
  }

  if (ctx.parent) {
    ctx.parent.children[ctx.index] = outNode;
  }

  ctx.replace(outNode);
};

export const convertRawTreeToViewTree = (inTree: IDebugTreeNode): ITreeDataItem[] => {
  // Deep clone. Not the most efficient, but easy and we're not going for
  // blazing performance here.
  const workingTree: IDebugTreeNode = JSON.parse(JSON.stringify(inTree));

  crawl(workingTree, convertNode, { order: 'pre' });

  // Doesn't seem to be an easy way from within the crawler to replace
  // the root node, so doing that here and just bringing in the rest of it
  // TODO: Top level of this shouldn't be an array.
  return [
    {
      name: buildViewName(workingTree),
      children: workingTree.children,
      defaultExpanded: true,
    },
  ];
};
