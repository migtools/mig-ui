import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Dropdown, KebabToggle, DropdownItem } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  DEBUG_PATH_SEARCH_KEY,
  IDebugTreeNode,
  RAW_OBJECT_VIEW_ROUTE,
} from '../../../../debug/duck/types';
import { getOCCommandAndClusterType } from '../helpers';
import { alertSuccess } from '../../../../common/duck/slice';

interface ITreeActionsDropdownProps {
  rawNode: IDebugTreeNode;
}

const TreeActionsDropdown: React.FunctionComponent<ITreeActionsDropdownProps> = ({
  rawNode,
}: ITreeActionsDropdownProps) => {
  const dispatch = useDispatch();
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
    dispatch(
      alertSuccess(
        `Command copied to clipboard. Run 'oc get' on 
      ${clusterType} cluster to view resource details.`
      )
    );
  };
  const nodeIdentifier = rawNode.namespace
    ? `${rawNode.kind}: ${rawNode.clusterType}/${rawNode.namespace}/${rawNode.name}`
    : `${rawNode.kind}: ${rawNode.clusterType}/${rawNode.name}`;

  const encodedPath = encodeURI(rawNode.objectLink);

  return (
    <Dropdown
      key={nodeIdentifier}
      aria-label="Actions"
      toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
      isOpen={kebabIsOpen}
      isPlain
      position="right"
      dropdownItems={[
        <DropdownItem
          key={`${nodeIdentifier} - copy command`}
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
          key={rawNode.name}
        >
          <DropdownItem
            key={`${nodeIdentifier} - view JSON`}
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
export default TreeActionsDropdown;
