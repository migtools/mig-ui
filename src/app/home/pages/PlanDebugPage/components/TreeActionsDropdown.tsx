import React, { useState } from 'react';
import { Dropdown, KebabToggle, DropdownItem, Tooltip, Alert } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { IDebugTreeNode } from '../../../../debug/duck/types';
import { getOCCommandAndClusterType } from '../helpers';

interface ITreeActionsDropdownProps {
  rawNode: IDebugTreeNode;
  viewRawDebugObject: (node: IDebugTreeNode) => void;
}

const TreeActionsDropdown: React.FunctionComponent<ITreeActionsDropdownProps> = ({
  rawNode,
  viewRawDebugObject,
}: ITreeActionsDropdownProps) => {
  const [kebabIsOpen, setKebabIsOpen] = useState(false);
  const [clusterType, setClusterType] = useState('');

  const onCopy = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const clipboard = event.currentTarget.parentElement;
    const el = document.createElement('textarea');
    const {ocCommand, clusterType} = getOCCommandAndClusterType(rawNode)
    setClusterType(clusterType);
    el.value = ocCommand;
    clipboard.appendChild(el);
    el.select();
    document.execCommand('copy');
    clipboard.removeChild(el);
  };

  const regex = RegExp('^Plan|Migration', 'i');
  // const isCopyDisabled = !regex.test(rawNode.kind);
  const isCopyDisabled = false;

  return (
    <Dropdown
      aria-label="Actions"
      toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
      isOpen={kebabIsOpen}
      isPlain
      position="right"
      dropdownItems={[
        <DropdownItem
          key="copy-oc-command"
          onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
            onCopy(event);
          }}
          isDisabled={isCopyDisabled}
        >
          <Tooltip
            trigger="click"
            exitDelay={100}
            entryDelay={100}
            position="top"
            content={
              <Alert
                isInline
                variant="success"
                title={`Copied to clipboard! Run the oc get command on 
                ${clusterType} cluster to view resource details.`}
              />
            }
          >
            <span>
              Copy
              <pre className={spacing.mxSm} style={{ display: 'inline' }}>
                oc get
              </pre>
              command
            </span>
          </Tooltip>
        </DropdownItem>,
        <DropdownItem
          key="view-raw"
          onClick={() => {
            setKebabIsOpen(false);
            viewRawDebugObject(rawNode);
          }}
        >
          View JSON
        </DropdownItem>,
      ]}
    />
  );
};

export default TreeActionsDropdown;
