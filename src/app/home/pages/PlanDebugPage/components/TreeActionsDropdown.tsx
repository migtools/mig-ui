import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Dropdown, KebabToggle, DropdownItem } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  DEBUG_PATH_SEARCH_KEY,
  IDebugTreeNode,
  RAW_OBJECT_VIEW_ROUTE,
} from '../../../../debug/duck/types';
import { alertSuccess } from '../../../../common/duck/slice';
import { getDebugCommand, hasLogsCommand } from '../helpers';
import { DefaultRootState } from '../../../../../configureStore';
import { ILogReducerState } from '../../../../logs/duck/slice';

interface ITreeActionsDropdownProps {
  rawNode: IDebugTreeNode;
}

const TreeActionsDropdown: React.FunctionComponent<ITreeActionsDropdownProps> = ({
  rawNode,
}: ITreeActionsDropdownProps) => {
  const dispatch = useDispatch();
  const logs: ILogReducerState = useSelector((state: DefaultRootState) => state.logs);

  const [kebabIsOpen, setKebabIsOpen] = useState(false);
  const [clusterType, setClusterType] = useState('');

  const nodeIdentifier = rawNode.namespace
    ? `${rawNode.kind}: ${rawNode.clusterType}/${rawNode.namespace}/${rawNode.name}`
    : `${rawNode.kind}: ${rawNode.clusterType}/${rawNode.name}`;

  const onCopyDescribe = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const clipboard = event.currentTarget.parentElement;
    const el = document.createElement('textarea');
    const { ocDescribeCommand: ocDescribeCommand, ocLogsCommand } = getDebugCommand(
      rawNode,
      logs.logPodObject
    );
    setClusterType(clusterType);
    el.value = ocDescribeCommand;
    clipboard.appendChild(el);
    el.select();
    document.execCommand('copy');
    clipboard.removeChild(el);
    dispatch(
      alertSuccess(
        `Command copied to clipboard. Run 'oc describe' on the 
      ${rawNode.clusterType} cluster to view resource details.`
      )
    );
  };

  const onCopyLogs = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const clipboard = event.currentTarget.parentElement;
    const el = document.createElement('textarea');
    const { ocDescribeCommand: ocDescribeCommand, ocLogsCommand } = getDebugCommand(
      rawNode,
      logs.logPodObject
    );
    setClusterType(clusterType);
    el.value = ocLogsCommand;
    clipboard.appendChild(el);
    el.select();
    document.execCommand('copy');
    clipboard.removeChild(el);
    dispatch(
      alertSuccess(
        `Command copied to clipboard. Run 'oc logs' on the 
      ${rawNode.clusterType} cluster to view resource details.`
      )
    );
  };

  const encodedPath = encodeURI(rawNode.objectLink);

  const describeDropdownButton = (
    <DropdownItem
      key="copy-oc-describe-command"
      onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
        onCopyDescribe(event);
        setKebabIsOpen(false);
      }}
    >
      <span>
        Copy
        <pre className={spacing.mxSm} style={{ display: 'inline' }}>
          oc describe
        </pre>
        command
      </span>
    </DropdownItem>
  );

  const logsDropdownButton = (
    <DropdownItem
      key="copy-oc-logs-command"
      onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
        onCopyLogs(event);
        setKebabIsOpen(false);
      }}
    >
      <span>
        Copy
        <pre className={spacing.mxSm} style={{ display: 'inline' }}>
          oc logs
        </pre>
        command
      </span>
    </DropdownItem>
  );

  const jsonLinkButton = (
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
    </Link>
  );

  const actionListWithLogsButton = [describeDropdownButton, logsDropdownButton, jsonLinkButton];
  const actionListWithoutLogsButton = [describeDropdownButton, jsonLinkButton];
  const nodeHasLogsCommand = hasLogsCommand(rawNode.kind);

  return (
    <Dropdown
      key={nodeIdentifier}
      aria-label="Actions"
      toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
      isOpen={kebabIsOpen}
      isPlain
      position="right"
      dropdownItems={nodeHasLogsCommand ? actionListWithLogsButton : actionListWithoutLogsButton}
    />
  );
};
export default TreeActionsDropdown;
