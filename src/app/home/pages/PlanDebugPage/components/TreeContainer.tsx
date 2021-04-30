import React, { useState } from 'react';
import { useDebugViewPollingEffect, usePausedPollingEffect } from '../../../../common/context';
import isEqual from 'react-fast-compare';
import {
  CardBody,
  Split,
  SplitItem,
  SearchInput,
  TreeView,
  TreeViewDataItem,
} from '@patternfly/react-core';

interface ITreeContainerProps {
  treeData: any;
}
interface ITreeComponentProps {
  filteredTreeData: any;
}
const TreeComponent = React.memo(({ filteredTreeData }: ITreeComponentProps) => {
  return <TreeView data={filteredTreeData ? filteredTreeData : []} defaultAllExpanded />;
}, isEqual);

const TreeContainer: React.FunctionComponent<ITreeContainerProps> = ({ treeData }) => {
  useDebugViewPollingEffect();
  // usePausedPollingEffect();
  const [searchText, setSearchText] = useState('');
  const filterSubtree = (items: TreeViewDataItem[]): TreeViewDataItem[] =>
    items
      .map((item) => {
        const nameMatches = (item.id as string).toLowerCase().includes(searchText.toLowerCase());
        if (!item.children) {
          return nameMatches ? item : null;
        }
        const filteredChildren = filterSubtree(item.children);
        if (filteredChildren.length > 0) {
          return {
            ...item,
            children: filteredChildren,
          };
        }
        return null;
      })
      .filter((item) => !!item) as TreeViewDataItem[];

  let filteredTreeData = treeData;
  if (searchText && treeData) {
    filteredTreeData = filterSubtree(treeData);
  }
  return (
    <CardBody>
      <Split hasGutter>
        <SplitItem isFilled>
          <SearchInput
            placeholder="Type to search"
            value={searchText}
            onChange={setSearchText}
            onClear={() => setSearchText('')}
          />
        </SplitItem>
      </Split>
      <TreeComponent filteredTreeData={filteredTreeData} />
    </CardBody>
  );
};
export default TreeContainer;
