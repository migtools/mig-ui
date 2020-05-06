import React from 'react';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  Bullseye,
  Title,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Tooltip,
  TooltipPosition,
  Grid,
  GridItem,
  DataList,
  DataListContent,
} from '@patternfly/react-core';
import ConditionItem from './ConditionItem';
import { ICurrentPlanStatus, CurrentPlanState } from '../../duck/reducers';
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';
import {
  QuestionCircleIcon,
  IconSize,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
const styles = require('./ResultsStep.module');

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

  function HeaderIcon({ state }) {
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
  }

  function getHeaderText(state: CurrentPlanState): string {
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
  }

  function BodyText({ state, errorMessage, warnMessage }): any {
    const StyledBodyText = (props) => (
      <span className={styles.styledBodyText}>{props.children}</span>
    );

    switch (state) {
      case CurrentPlanState.Pending:
        return <StyledBodyText>This might take a few minutes.</StyledBodyText>;
      case CurrentPlanState.Warn:
        return (
          <StyledBodyText>
            Select an action from the Migration Plans section of the dashboard to start the
            migration.
          </StyledBodyText>
        );
      case CurrentPlanState.Ready:
        return (
          <StyledBodyText>
            Select an action from the Migration Plans section of the dashboard to start the
            migration.
          </StyledBodyText>
        );
      default:
        return null;
    }
  }

  function FooterText({ state }): any {
    switch (state) {
      case CurrentPlanState.Pending:
        return null;
      case CurrentPlanState.Warn:
        return (
          <Button onClick={onClose} variant="primary">
            Close
          </Button>
        );
      case CurrentPlanState.Ready:
        return (
          <Button onClick={onClose} variant="primary">
            Close
          </Button>
        );
      case CurrentPlanState.Critical:
        return (
          <Button onClick={onClose} variant="primary">
            Close
          </Button>
        );
      case CurrentPlanState.TimedOut:
        return (
          <Grid gutter="md">
            <Button style={{ marginRight: '10px' }} onClick={onClose} variant="primary">
              Close
            </Button>
            <Button
              style={{ marginLeft: '10px', marginRight: '10px' }}
              onClick={handlePollRestart}
              disabled={isPollingStatus}
              variant="secondary"
            >
              Check Connection
            </Button>
            <Tooltip position={TooltipPosition.top} content={<div>Re-check plan status.</div>}>
              <span className="pf-c-icon">
                <QuestionCircleIcon />
              </span>
            </Tooltip>
          </Grid>
        );
      default:
        return null;
    }
  }

  return (
    <Grid gutter="md">
      <GridItem className={styles.centerCard}>
        <Card className={styles.styledCard}>
          <CardHeader>
            <Bullseye className={spacing.mbMd}>
              <HeaderIcon state={currentPlanStatus.state} />
            </Bullseye>
            <Bullseye>
              <Title headingLevel="h3" size="2xl">
                {getHeaderText(currentPlanStatus.state)}
              </Title>
            </Bullseye>
          </CardHeader>
          <CardBody>
            <BodyText
              state={currentPlanStatus.state}
              errorMessage={currentPlanStatus.errorMessage}
              warnMessage={currentPlanStatus.warnMessage}
            />
            {currentPlanStatus.state !== CurrentPlanState.Pending && currentPlan && (
              <DataListContent noPadding aria-label="current-plan-conditions-list">
                {currentPlan.PlanStatus.displayedConditions.length > 0 && (
                  <DataList aria-label="cluster-item-list">
                    {currentPlan.PlanStatus.displayedConditions.map((condition, conditionIndex) => {
                      return (
                        <ConditionItem
                          key={conditionIndex}
                          condition={condition}
                          conditionIndex={conditionIndex}
                          incompatibleNamespaces={currentPlan.status.incompatibleNamespaces}
                        />
                      );
                    })}
                  </DataList>
                )}
              </DataListContent>
            )}
          </CardBody>
          <CardFooter>
            <FooterText state={currentPlanStatus.state} />
          </CardFooter>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default ResultsStep;
