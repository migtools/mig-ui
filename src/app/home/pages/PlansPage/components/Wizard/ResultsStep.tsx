import React from 'react';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { Bullseye, Title, Button, Flex, FlexModifiers } from '@patternfly/react-core';
import ConditionsGrid from './ConditionsGrid';
import { ICurrentPlanStatus, CurrentPlanState } from '../../../../../plan/duck/reducers';
import { Spinner } from '@patternfly/react-core';
import {
  IconSize,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import { useFormikContext } from 'formik';
import { IFormValues } from './WizardContainer';

interface IProps {
  startPlanStatusPolling: (planName) => void;
  onClose: () => void;
  currentPlan: any;
  currentPlanStatus: ICurrentPlanStatus;
  isPollingStatus: boolean;
}

const ResultsStep: React.FunctionComponent<IProps> = ({
  currentPlan,
  currentPlanStatus,
  isPollingStatus,
  startPlanStatusPolling,
  onClose,
}: IProps) => {
  const { values } = useFormikContext<IFormValues>();

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
      case CurrentPlanState.TimedOut:
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
          <Button onClick={handlePollRestart} disabled={isPollingStatus} variant="primary">
            Retry validation
          </Button>
          <Button onClick={onClose} variant="secondary">
            Close
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
