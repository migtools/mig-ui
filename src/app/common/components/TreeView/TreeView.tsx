// This is based on the unreleased PatternFly core (HTML) component here: https://patternfly-pr-3354.surge.sh/documentation/core/components/treeview
// We should try to contribute this back to patternfly-react, or switch to the eventual patternfly-react component if someone else implements it.

// TODO: should maybe be able to override local expanded state with a property in the data items, maybe enabled with a top-level prop isControlled
// TODO before PatternFly contribution: support for active items, search, checkboxes, icons, badges, actions

import React from 'react';
import { TreeViewList } from './TreeViewList';
import { TreeViewListItem } from './TreeViewListItem';

export interface ITreeDataItem {
  name: string;
  children?: ITreeDataItem[];
  defaultExpanded?: boolean;
}

export interface ITreeViewProps {
  data: ITreeDataItem[];
  isNested?: boolean;
  defaultAllExpanded?: boolean;
  viewRawDebugObject: (IDecompDebugObject) => void;
}

export const TreeView: React.FunctionComponent<ITreeViewProps> = ({
  data,
  isNested = false,
  defaultAllExpanded = false,
  viewRawDebugObject,
}: ITreeViewProps) => (
  <TreeViewList isNested={isNested}>
    {data.map((item) => (
      <TreeViewListItem
        key={item.name}
        name={item.name}
        defaultExpanded={defaultAllExpanded || item.defaultExpanded || false}
        viewRawDebugObject={viewRawDebugObject}
        {...(item.children && {
          children: (
            <TreeView
              data={item.children}
              isNested
              defaultAllExpanded={defaultAllExpanded}
              viewRawDebugObject={viewRawDebugObject}
            />
          ),
        })}
      />
    ))}
  </TreeViewList>
);
