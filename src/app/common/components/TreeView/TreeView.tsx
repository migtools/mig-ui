// This is based on the unreleased PatternFly core (HTML) component here: https://patternfly-pr-3354.surge.sh/documentation/core/components/treeview
// We should try to contribute this back to patternfly-react, or switch to the eventual patternfly-react component if someone else implements it.

// TODO: should maybe be able to override local expanded state with a property in the data items, maybe enabled with a top-level prop isControlled
// TODO before PatternFly contribution: support for active items, search, checkboxes, icons, badges, actions

import React, { useState } from 'react';
import classNames from 'classnames';
import { AngleRightIcon } from '@patternfly/react-icons';

const styles = require('./TreeView.module');

export interface ITreeDataItem {
  name: string;
  children?: ITreeDataItem[];
  defaultExpanded?: boolean;
}

export interface ITreeViewProps {
  data: ITreeDataItem[];
  isNested?: boolean;
  defaultAllExpanded?: boolean;
}

const TreeView: React.FunctionComponent<ITreeViewProps> = ({
  data,
  isNested = false,
  defaultAllExpanded = false,
}: ITreeViewProps) => {
  const list = (
    <ul className={styles['pf-c-tree-view__list']} role={isNested ? 'group' : 'tree'}>
      {data.map((item) => (
        <TreeViewItem item={item} key={item.name} defaultAllExpanded={defaultAllExpanded} />
      ))}
    </ul>
  );
  return isNested ? list : <div className={styles['pf-c-tree-view']}>{list}</div>;
};

export interface ITreeViewItemProps {
  item: ITreeDataItem;
  defaultAllExpanded?: boolean;
}

const TreeViewItem: React.FunctionComponent<ITreeViewItemProps> = ({
  item,
  defaultAllExpanded = false,
}: ITreeViewItemProps) => {
  const [isExpanded, setIsExpanded] = useState(item.defaultExpanded || defaultAllExpanded || false);
  return (
    <li
      className={classNames(styles['pf-c-tree-view__list-item'], {
        [styles['pf-m-expandable']]: !!item.children,
        [styles['pf-m-expanded']]: isExpanded,
      })}
      {...(isExpanded && { ariaExpanded: 'true' })}
      role="treeitem"
      tabIndex={0}
    >
      <div className={styles['pf-c-tree-view__content']}>
        <button
          className={styles['pf-c-tree-view__node']}
          onClick={() => {
            if (item.children) setIsExpanded(!isExpanded);
          }}
        >
          {item.children ? (
            <span className={styles['pf-c-tree-view__node-toggle-icon']}>
              <AngleRightIcon aria-hidden="true" />
            </span>
          ) : null}
          <span className={styles['pf-c-tree-view__node-text']}>{item.name}</span>
        </button>
      </div>
      {item.children && isExpanded ? (
        <TreeView data={item.children} isNested defaultAllExpanded={defaultAllExpanded} />
      ) : null}
    </li>
  );
};

export default TreeView;
