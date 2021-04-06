import React, { useState } from 'react';
import { connect } from 'react-redux';
import { useParams, useHistory, Link } from 'react-router-dom';
import { Dropdown, KebabToggle, DropdownItem, Tooltip, Alert } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  DEBUG_PATH_SEARCH_KEY,
  IDebugTreeNode,
  RAW_OBJECT_VIEW_ROUTE,
} from '../../../../debug/duck/types';
import { getOCCommandAndClusterType } from '../helpers';
import { AlertActions } from '../../../../common/duck/actions';
import { useDispatch, useSelector } from 'react-redux';

interface ITreeActionsDropdownProps {
  rawNode: IDebugTreeNode;
  viewRawDebugObject: (node: IDebugTreeNode) => void;
  copiedToClipboard: (text: string) => void;
}

const TreeActionsDropdown: React.FunctionComponent<ITreeActionsDropdownProps> = ({
  rawNode,
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
  const encodedPath = encodeURI(rawNode.objectLink);

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
        <Link
          to={`${RAW_OBJECT_VIEW_ROUTE}?${DEBUG_PATH_SEARCH_KEY}=${encodedPath}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <DropdownItem
            key="view-raw"
            onClick={() => {
              setKebabIsOpen(false);
            }}
          >
            View JSON
          </DropdownItem>
        </Link>,
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
