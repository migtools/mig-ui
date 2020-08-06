import React, { useState } from 'react';
import classNames from 'classnames';
import { AngleRightIcon } from '@patternfly/react-icons';

const styles = require('./TreeView.module');

export interface ITreeViewListItemProps {
  name: React.ReactNode;
  defaultExpanded?: boolean;
  children?: React.ReactNode;
}

export const TreeViewListItem: React.FunctionComponent<ITreeViewListItemProps> = ({
  name,
  defaultExpanded = false,
  children = null,
}: ITreeViewListItemProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  return (
    <li
      className={classNames(styles['pf-c-tree-view__list-item'], {
        [styles['pf-m-expandable']]: !!children,
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
            if (children) setIsExpanded(!isExpanded);
          }}
        >
          {children ? (
            <span className={styles['pf-c-tree-view__node-toggle-icon']}>
              <i>
                <AngleRightIcon aria-hidden="true" />
              </i>
            </span>
          ) : null}
          <span className={styles['pf-c-tree-view__node-text']}>{name}</span>
        </button>
      </div>
      {isExpanded ? children : null}
    </li>
  );
};
