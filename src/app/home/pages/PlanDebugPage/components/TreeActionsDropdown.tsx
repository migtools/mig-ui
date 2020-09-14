import React, { useState } from 'react';
import { Dropdown, KebabToggle, DropdownItem, Tooltip } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { IDebugTreeNode } from '../../../../debug/duck/types';
import { getFullKindName } from '../helpers';

interface ITreeActionsDropdownProps {
  rawNode: IDebugTreeNode;
  viewRawDebugObject: (node: IDebugTreeNode) => void;
}

const TreeActionsDropdown: React.FunctionComponent<ITreeActionsDropdownProps> = ({
  rawNode,
  viewRawDebugObject,
}: ITreeActionsDropdownProps) => {
  const [kebabIsOpen, setKebabIsOpen] = useState(false);

  const onCopy = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const clipboard = event.currentTarget.parentElement;
    const el = document.createElement('textarea');
    el.value = `oc get ${getFullKindName(rawNode.kind)} -n ${rawNode.namespace} ${rawNode.name}`;
    clipboard.appendChild(el);
    el.select();
    document.execCommand('copy');
    clipboard.removeChild(el);
  };

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
          isDisabled={rawNode.kind !== ('Migration' || 'Plan')}
        >
          <Tooltip
            trigger="click"
            exitDelay={100}
            entryDelay={100}
            position="top"
            content={<div>Copied to clipboard!</div>}
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
