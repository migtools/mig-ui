import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Dropdown, KebabToggle, DropdownItem, Tooltip, Alert } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { IDebugTreeNode } from '../../../../debug/duck/types';
import { getOCCommandAndClusterType } from '../helpers';
import { AlertActions } from '../../../../common/duck/actions';

interface ITreeActionsDropdownProps {
  rawNode: IDebugTreeNode;
  viewRawDebugObject: (node: IDebugTreeNode) => void;
  copiedToClipboard: (text: string) => void;
}

const TreeActionsDropdown: React.FunctionComponent<ITreeActionsDropdownProps> = ({
  rawNode,
  viewRawDebugObject,
  copiedToClipboard,
}: ITreeActionsDropdownProps) => {
  const [kebabIsOpen, setKebabIsOpen] = useState(false);
  const [clusterType, setClusterType] = useState('');

  const onCopy = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const clipboard = event.currentTarget.parentElement;
    const el = document.createElement('textarea');
    const { ocCommand, clusterType } = getOCCommandAndClusterType(rawNode);
    setClusterType(clusterType);
    el.value = ocCommand;
    clipboard.appendChild(el);
    el.select();
    document.execCommand('copy');
    clipboard.removeChild(el);
    copiedToClipboard(
      `Command copied to clipboard. Run 'oc get' on 
      ${clusterType} cluster to view resource details.`
    );
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
        >
          <span>
            Copy
            <pre className={spacing.mxSm} style={{ display: 'inline' }}>
              oc get
            </pre>
            command
          </span>
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

export default connect(
  () => {
    return {};
  },
  (dispatch) => ({
    copiedToClipboard: (text) => dispatch(AlertActions.alertSuccess(text)),
  })
)(TreeActionsDropdown);
