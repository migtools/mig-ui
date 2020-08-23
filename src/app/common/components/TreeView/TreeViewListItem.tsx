import React, { useState } from 'react';
import classNames from 'classnames';
import { AngleRightIcon } from '@patternfly/react-icons';
import { ClipboardCopy, Button } from '@patternfly/react-core';
import { connect } from 'react-redux';
import { IDecompDebugObject } from '../../../debug/duck/types';

const styles = require('./TreeView.module');

export interface ITreeViewListItemProps {
  name: string;
  defaultExpanded?: boolean;
  children?: React.ReactNode;
  viewRawDebugObject: (IDecompDebugObject) => void;
}

const decompCompositeName = (compName: string): IDecompDebugObject => {
  const decompRegex = /(^.*): (.*)\/(.*)$/;
  const decompMatch = compName.match(decompRegex);
  // TODO: Error handling...
  return {
    kind: decompMatch[1],
    namespace: decompMatch[2],
    name: decompMatch[3],
  };
};

export const TreeViewListItem: React.FunctionComponent<ITreeViewListItemProps> = ({
  name,
  defaultExpanded = false,
  children = null,
  viewRawDebugObject,
}: ITreeViewListItemProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const onCopy = (event: React.ClipboardEvent<HTMLDivElement>, text?: React.ReactNode) => {
    event.preventDefault();
    const decomp: IDecompDebugObject = decompCompositeName(name);
    const clipboard = event.currentTarget.parentElement;
    const el = document.createElement('textarea');
    el.value = `oc get ${decomp.kind} -n ${decomp.namespace} ${decomp.name}`;
    clipboard.appendChild(el);
    el.select();
    document.execCommand('copy');
    clipboard.removeChild(el);
  };

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
        </button>
        <ClipboardCopy
          style={{ width: '80%', marginRight: '10px' }}
          onCopy={onCopy}
          hoverTip={'Copy `oc get` command'}
          isReadOnly
        >
          {name}
        </ClipboardCopy>
        <Button onClick={() => viewRawDebugObject(decompCompositeName(name))}>View Raw</Button>
      </div>
      {isExpanded ? children : null}
    </li>
  );
};

export default TreeViewListItem;
