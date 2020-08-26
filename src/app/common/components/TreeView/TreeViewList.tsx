import React from 'react';

const styles = require('./TreeView.module');

export interface ITreeViewListProps {
  isNested?: boolean;
  children: React.ReactNode;
}

export const TreeViewList: React.FunctionComponent<ITreeViewListProps> = ({
  isNested = false,
  children,
}: ITreeViewListProps) => {
  const list = (
    <ul className={styles['pf-c-tree-view__list']} role={isNested ? 'group' : 'tree'}>
      {children}
    </ul>
  );
  return isNested ? list : <div className={styles['pf-c-tree-view']}>{list}</div>;
};
