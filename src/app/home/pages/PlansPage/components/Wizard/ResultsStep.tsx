import React from 'react';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { Bullseye, Title, Button, Flex } from '@patternfly/react-core';
import ConditionsGrid from './ConditionsGrid';
import { ICurrentPlanStatus, CurrentPlanState } from '../../../../../plan/duck/reducers';
import { Spinner } from '@patternfly/react-core';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { useFormikContext } from 'formik';
import { IFormValues } from './WizardContainer';
import flex from '@patternfly/react-styles/css/utilities/Flex/flex';
import { usePausedPollingEffect } from '../../../../../common/context';
import { useDispatch, useSelector } from 'react-redux';
import { PlanActions } from '../../../../../plan/duck/actions';
import { IMigPlan, IPlan } from '../../../../../plan/duck/types';
import { planSelectors } from '../../../../../plan/duck';
import { DefaultRootState } from '../../../../../../configureStore';

interface IProps {
  currentPlanStatus: ICurrentPlanStatus;
  isPollingStatus: boolean;
  onClose: () => void;
}

const ResultsStep: React.FunctionComponent<IProps> = ({
  currentPlanStatus,
  isPollingStatus,
  onClose,
}: IProps) => {
  const dispatch = useDispatch();
  usePausedPollingEffect();
  const currentPlanWithStatus = useSelector((state: DefaultRootState) =>
    planSelectors.getCurrentPlanWithStatus(state)
  );

  const { values } = useFormikContext<IFormValues>();

  const handlePollRestart = () => {
    dispatch(PlanActions.startPlanStatusPolling(values.planName));
  };

  const HeaderIcon: React.FunctionComponent<{ state: CurrentPlanState }> = ({ state }) => {
    switch (state) {
      case CurrentPlanState.Pending:
        return <Spinner size="xl" />;
      case CurrentPlanState.Ready:
        return (
          <span className="pf-c-icon pf-m-success">
            <CheckCircleIcon size={'xl'} />
          </span>
        );
      case CurrentPlanState.Critical:
      case CurrentPlanState.TimedOut:
        return (
          <span className="pf-c-icon pf-m-danger">
            <ExclamationCircleIcon size={'xl'} />
          </span>
        );
      case CurrentPlanState.Warn:
        return (
          <span className="pf-c-icon pf-m-warning">
            <ExclamationTriangleIcon size={'xl'} />
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
    <Flex className={(spacing.mtXl, flex.justifyContentCenter)} direction={{ default: 'column' }}>
      <Bullseye className={spacing.mt_3xl}>
        <HeaderIcon state={currentPlanStatus.state} />
      </Bullseye>
      <Bullseye>
        <Title headingLevel="h3" size="2xl">
          {getHeaderText(currentPlanStatus.state)}
        </Title>
      </Bullseye>
      {currentPlanStatus.state !== CurrentPlanState.Pending && currentPlanWithStatus && (
        <ConditionsGrid
          conditions={currentPlanWithStatus?.PlanStatus?.displayedConditions}
          incompatibleNamespaces={currentPlanWithStatus?.status.incompatibleNamespaces}
        />
      )}
      <Flex className={(spacing.mtMd, flex.justifyContentCenter)}>
        <FooterButtons state={currentPlanStatus.state} />
      </Flex>
    </Flex>
  );
};

export default ResultsStep;
