import React from 'react';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { Bullseye, Title, Button, Flex, FlexModifiers, FlexItem } from '@patternfly/react-core';
import ConditionsGrid from './ConditionsGrid';
import { ICurrentPlanStatus, CurrentPlanState } from '../../duck/reducers';
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';
import {
  IconSize,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';

interface IProps {
  values: any;
  errors: any;
  startPlanStatusPolling: (planName) => void;
  onClose: () => void;
  currentPlan: any;
  currentPlanStatus: ICurrentPlanStatus;
  isPollingStatus: boolean;
}

const ResultsStep: React.FunctionComponent<IProps> = (props) => {
  const {
    values,
    currentPlan,
    currentPlanStatus,
    isPollingStatus,
    startPlanStatusPolling,
    onClose,
  } = props;

  const handlePollRestart = () => {
    startPlanStatusPolling(values.planName);
  };

  const HeaderIcon: React.FunctionComponent<{ state: CurrentPlanState }> = ({ state }) => {
    switch (state) {
      case CurrentPlanState.Pending:
        return <Spinner size="xl" />;
      case CurrentPlanState.Ready:
        return (
          <span className="pf-c-icon pf-m-success">
            <CheckCircleIcon size={IconSize.xl} />
          </span>
        );
      case CurrentPlanState.Critical:
        return (
          <span className="pf-c-icon pf-m-danger">
            <ExclamationCircleIcon size={IconSize.xl} />
          </span>
        );
      case CurrentPlanState.Warn:
        return (
          <span className="pf-c-icon pf-m-warning">
            <ExclamationTriangleIcon size={IconSize.xl} />
          </span>
        );
      default:
        return null;
    }
  };

  const getHeaderText = (state: CurrentPlanState): string => {
    switch (state) {
      case CurrentPlanState.Pending:
        return 'Validating migration plan';
      case CurrentPlanState.Ready:
        return 'Validation successful';
      case CurrentPlanState.Warn:
        return 'Validation completed with warnings';
      case CurrentPlanState.Critical:
        return 'Failed to validate migration plan';
      case CurrentPlanState.TimedOut:
        return 'Validation timed out';
      default:
        return null;
    }
  };

  const FooterButtons: React.FunctionComponent<{ state: CurrentPlanState }> = ({ state }) => {
    if (state === CurrentPlanState.Pending) return null;
    if (state === CurrentPlanState.TimedOut) {
      return (
        <>
          <Button onClick={onClose} variant="primary">
            Close
          </Button>
          <Button onClick={handlePollRestart} disabled={isPollingStatus} variant="secondary">
            Retry validation
          </Button>
        </>
      );
    }
    return (
      <Button onClick={onClose} variant="primary">
        Close
      </Button>
    );
  };

  return (
    <Bullseye>
      <Flex
        className={spacing.mtXl}
        breakpointMods={[
          { modifier: FlexModifiers['column'] },
          { modifier: FlexModifiers['align-items-center'] },
          { modifier: FlexModifiers['space-items-md'] },
        ]}
      >
        <Bullseye>
          <HeaderIcon state={currentPlanStatus.state} />
        </Bullseye>
        <Bullseye>
          <Title headingLevel="h3" size="2xl">
            {getHeaderText(currentPlanStatus.state)}
          </Title>
        </Bullseye>
        {currentPlanStatus.state !== CurrentPlanState.Pending && currentPlan && (
          <ConditionsGrid
            conditions={currentPlan.PlanStatus.displayedConditions}
            incompatibleNamespaces={currentPlan.status.incompatibleNamespaces}
          />
        )}
        <Flex
          className={spacing.mtMd}
          breakpointMods={[
            { modifier: FlexModifiers['space-items-md'] },
            { modifier: FlexModifiers['justify-content-center'] },
          ]}
        >
          <FooterButtons state={currentPlanStatus.state} />
        </Flex>
      </Flex>
    </Bullseye>
  );
};

export default ResultsStep;
