/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useContext } from 'react';
import { PlanContext } from '../../../duck/context';
import {
  Dropdown,
  DropdownItem,
  DropdownPosition,
  KebabToggle
} from '@patternfly/react-core';
import { useOpenModal } from '../../../duck/hooks';
import MigrateModal from '../../../../plan/components/MigrateModal';
import { withRouter } from 'react-router-dom';
import WizardContainer from '../../../../plan/components/Wizard/WizardContainer';

const PlanActions = ({ plan, history, toggleWizardOpen, isWizardOpen }) => {
  const [isMigrateModalOpen, toggleMigrateModalOpen] = useOpenModal(false);
  const planContext = useContext(PlanContext);
  const {
    hasClosedCondition,
    hasReadyCondition,
    hasErrorCondition,
    hasRunningMigrations,
    hasAttemptedMigration,
    finalMigrationComplete,
    isPlanLocked
  } = plan.PlanStatus;

  const editPlan = () => {
    const name = plan.MigPlan.metadata.name;
    // planContext.watchPlanAddEditStatus(name);
    toggleWizardOpen();
  };

  const [kebabIsOpen, setKebabIsOpen] = useState(false);
  const kebabDropdownItems = [
    <DropdownItem
      onClick={() => {
        setKebabIsOpen(false);
        editPlan();
      }}
      key="editPlan"
    >
      Edit
    </DropdownItem>,

    <DropdownItem
      onClick={() => {
        setKebabIsOpen(false);
        planContext.handleStageTriggered(plan);
      }}
      key="stagePlan"
      isDisabled={
        hasClosedCondition ||
        !hasReadyCondition ||
        hasErrorCondition ||
        hasRunningMigrations ||
        hasAttemptedMigration ||
        finalMigrationComplete ||
        isPlanLocked
      }
    >
      Stage
    </DropdownItem>,
    <DropdownItem
      onClick={() => {
        setKebabIsOpen(false);
        toggleMigrateModalOpen();
      }}
      key="migratePlan"
      isDisabled={
        hasClosedCondition ||
        !hasReadyCondition ||
        hasErrorCondition ||
        hasRunningMigrations ||
        finalMigrationComplete ||
        isPlanLocked
      }
    >
      Migrate
    </DropdownItem>,
    <DropdownItem
      onClick={() => {
        planContext.handleDeletePlan(plan);
        setKebabIsOpen(false);
      }}
      key="deletePlan"
      isDisabled={
        hasRunningMigrations ||
        isPlanLocked
      }
    >
      Delete
    </DropdownItem>,
    <DropdownItem
      key="showLogs"
      onClick={() => {
        setKebabIsOpen(false);
        history.push('/logs/' + plan.MigPlan.metadata.name);
      }}
    >
      Logs
    </DropdownItem>,
  ];

  return (
    <div className="pf-l-flex pf-m-nowrap">
      <div className="pf-l-flex__item pf-m-align-right">
        <Dropdown
          toggle={<KebabToggle
            onToggle={() => setKebabIsOpen(!kebabIsOpen)}
          />}
          isOpen={kebabIsOpen}
          isPlain
          dropdownItems={kebabDropdownItems}
          position={DropdownPosition.right}
        />
        <WizardContainer
          planList={planContext.planList}
          clusterList={planContext.clusterList}
          storageList={planContext.storageList}
          isOpen={isWizardOpen}
          onHandleWizardModalClose={toggleWizardOpen}
        />

        <MigrateModal
          plan={plan}
          isOpen={isMigrateModalOpen}
          onHandleClose={toggleMigrateModalOpen}
        />
      </div>
    </div>
  );
};

export default withRouter(PlanActions);
