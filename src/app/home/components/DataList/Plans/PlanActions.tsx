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
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router-dom';

const PlanActions = ({ plan, history }) => {
  const [isOpen, toggleOpen] = useOpenModal(false);
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

  const [kebabIsOpen, setKebabIsOpen] = useState(false);

  // const logsLink = <Link to={'/logs/' + plan.MigPlan.metadata.name}>Logs</Link>

  const kebabDropdownItems = [
    <DropdownItem
      onClick={() => {
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
      onClick={toggleOpen}
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
      <MigrateModal plan={plan} isOpen={isOpen} onHandleClose={toggleOpen} />
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
      logs

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
      </div>
    </div>
  );
};

export default withRouter(PlanActions);
