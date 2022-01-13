import React from 'react';
import { useState } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownPosition,
  KebabToggle,
  Flex,
  FlexItem,
  DropdownGroup,
} from '@patternfly/react-core';
import { useOpenModal } from '../../../../duck';
import { useHistory } from 'react-router-dom';
import WizardContainer from '../Wizard/WizardContainer';
import ConfirmModal from '../../../../../common/components/ConfirmModal';
import { IPlan } from '../../../../../plan/duck/types';
import { useDispatch } from 'react-redux';
import { PlanActions } from '../../../../../plan/duck';
import { MigrationActionsDropdownGroup } from './MigrationActionsDropdownGroup';
import { MigrationConfirmModals, useMigrationConfirmModalState } from './MigrationConfirmModals';
interface IPlanActionsProps {
  plan: IPlan;
}
export const PlanActionsComponent: React.FunctionComponent<IPlanActionsProps> = (props) => {
  const { plan } = props;
  const [isDeleteModalOpen, toggleDeleteModalOpen] = useOpenModal(false);
  const [isEditWizardOpen, toggleEditWizardOpen] = useOpenModal(false);

  const migrationModalState = useMigrationConfirmModalState();

  const dispatch = useDispatch();

  const history = useHistory();

  const {
    hasClosedCondition = null,
    hasRunningMigrations = null,
    hasSucceededCutover = null,
    isPlanLocked = null,
  } = plan?.PlanStatus;

  const editPlan = () => {
    toggleEditWizardOpen();
  };

  const [kebabIsOpen, setKebabIsOpen] = useState(false);
  const kebabDropdownItems = [
    <DropdownGroup>
      <DropdownItem
        key="showLogs"
        onClick={() => {
          setKebabIsOpen(false);
          history.push('/logs/' + plan.MigPlan.metadata.name);
        }}
      >
        Logs
      </DropdownItem>
      <DropdownItem
        isDisabled={
          hasClosedCondition || hasRunningMigrations || hasSucceededCutover || isPlanLocked
        }
        onClick={() => {
          setKebabIsOpen(false);
          editPlan();
        }}
        key="editPlan"
      >
        Edit
      </DropdownItem>
      <DropdownItem
        onClick={() => {
          setKebabIsOpen(false);
          toggleDeleteModalOpen();
        }}
        key="deletePlan"
        isDisabled={hasRunningMigrations || isPlanLocked}
      >
        Delete
      </DropdownItem>
    </DropdownGroup>,
    <MigrationActionsDropdownGroup
      plan={plan}
      setKebabIsOpen={setKebabIsOpen}
      modalState={migrationModalState}
    />,
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
          isGrouped
        />
        <WizardContainer
          isOpen={isEditWizardOpen}
          onHandleWizardModalClose={toggleEditWizardOpen}
          editPlanObj={plan.MigPlan}
          isEdit={true}
        />

        <ConfirmModal
          title="Confirmation"
          message={`Do you really want to delete migration plan "${plan.MigPlan.metadata.name}"?`}
          isOpen={isDeleteModalOpen}
          onHandleClose={(isConfirmed) => {
            if (isConfirmed) {
              dispatch(PlanActions.planCloseAndDeleteRequest(plan.MigPlan.metadata.name));
            }
            toggleDeleteModalOpen();
          }}
          id="confirm-plan-removal"
        />

        <MigrationConfirmModals plan={plan} modalState={migrationModalState} />
      </FlexItem>
    </Flex>
  );
};
