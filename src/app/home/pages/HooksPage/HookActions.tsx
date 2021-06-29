import React from 'react';
import { useState, useContext } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownPosition,
  KebabToggle,
  Flex,
  FlexItem,
  Tooltip,
} from '@patternfly/react-core';
import { IMigHook } from './types';
import planUtils from '../../../plan/duck/utils';

interface IHookActions {
  migHook: IMigHook;
  allHooks: any;
  setInitialHookValues: any;
  setIsAddHooksOpen: any;
  watchHookAddEditStatus: any;
  removeHookRequest: any;
}

const HookActions = (props: IHookActions) => {
  const {
    migHook,
    allHooks,
    setInitialHookValues,
    setIsAddHooksOpen,
    watchHookAddEditStatus,
    removeHookRequest,
  } = props;
  const removeItem = (
    <DropdownItem
      isDisabled={migHook.HookStatus.associatedPlanCount > 0}
      onClick={() => {
        removeHookRequest(migHook.metadata.name);
      }}
      key="removeHook"
    >
      Delete
    </DropdownItem>
  );

  const [kebabIsOpen, setKebabIsOpen] = useState(false);
  const kebabDropdownItems = [
    <DropdownItem
      onClick={() => {
        const matchingHook: IMigHook = allHooks.find(
          (hook: IMigHook) => hook.metadata.name === migHook.metadata.name
        );

        const currentHook = planUtils.convertMigHookToUIObject(null, matchingHook);
        setInitialHookValues(currentHook);
        setIsAddHooksOpen(true);
        watchHookAddEditStatus(migHook.metadata.name);
      }}
      key="editHook"
    >
      Edit
    </DropdownItem>,
    migHook.HookStatus.associatedPlanCount > 0 ? (
      <Tooltip
        position="top"
        content={<div>Hook is associated with a plan and cannot be removed.</div>}
        key="removeHookTooltip"
      >
        {removeItem}
      </Tooltip>
    ) : (
      removeItem
    ),
  ];
  return (
    <Flex>
      <FlexItem>
        <Dropdown
          toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
          isOpen={kebabIsOpen}
          isPlain
          dropdownItems={kebabDropdownItems}
          position={DropdownPosition.right}
        />
      </FlexItem>
    </Flex>
  );
};

export default HookActions;
