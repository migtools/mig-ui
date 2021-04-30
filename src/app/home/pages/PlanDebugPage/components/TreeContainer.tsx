import React, { useState } from 'react';
import { TreeView } from '@patternfly/react-core';
import { useDebugViewPollingEffect } from '../../../../common/context';

interface ITreeContainerProps {
  filteredTreeData: any;
}
export const TreeContainer = React.memo(({ filteredTreeData }: ITreeContainerProps) => {
  useDebugViewPollingEffect();
  return <TreeView data={filteredTreeData ? filteredTreeData : []} defaultAllExpanded />;
});
