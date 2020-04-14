import React from 'react';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
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
  Flex,
  FlexItem,
  FlexModifiers,
} from '@patternfly/react-core';
import ConditionItem from './ConditionItem';
import { ICurrentPlanStatus, CurrentPlanState } from '../../duck/reducers';
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';
import {
  OutlinedQuestionCircleIcon,
  IconSize,
  CheckCircleIcon,
  ExclamationCircleIcon,
  WarningTriangleIcon,
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

const ResultsStep: React.FunctionComponent<IProps> = props => {
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
            <CheckCircleIcon size={IconSize.sm} />
          </span>
        );
      case CurrentPlanState.Critical:
        return (
          <span className="pf-c-icon pf-m-danger">
            <ExclamationCircleIcon size={IconSize.sm} />
          </span>
        );
      case CurrentPlanState.Warn:
        return (
          <span className="pf-c-icon pf-m-warning">
            <WarningTriangleIcon size={IconSize.xl} />
          </span>
        );
      default:
        return null;
    }
  }

  function HeaderText({ state }): any {
    const StyledPlanName = props => <span className={styles.styledPlanName}>{props.children}</span>;

    const StyledValidationText = props => (
      <span className={styles.styledValidationText}>{props.children}</span>
    );

    switch (state) {
      case CurrentPlanState.Pending:
        return (
          <StyledValidationText>
            Validating migration plan
            {` `}
            <StyledPlanName>{currentPlan.metadata.name}</StyledPlanName>
            {`.`}
          </StyledValidationText>
        );
      case CurrentPlanState.Ready:
        return (
          <StyledValidationText>
            <StyledPlanName>{currentPlan.metadata.name}</StyledPlanName>
            {` `}
            has been validated.
          </StyledValidationText>
        );
      case CurrentPlanState.Warn:
        return (
          <StyledValidationText>
            <StyledPlanName>{currentPlan.metadata.name}</StyledPlanName>
            {` `}
            has been validated with warning condition(s). See warning message.
          </StyledValidationText>
        );
      case CurrentPlanState.Critical:
        return (
          <StyledValidationText>
            Failed to validate migration plan
            {` `}
            <StyledPlanName>{currentPlan.metadata.name}</StyledPlanName>
            {`.`}
          </StyledValidationText>
        );
      case CurrentPlanState.TimedOut:
        return (
          <StyledValidationText>
            Failed to validate migration plan
            {` `}
            <StyledPlanName>{currentPlan.metadata.name}</StyledPlanName>
            {`. Please Try again.`}
          </StyledValidationText>
        );
      default:
        return null;
    }
  }

  function BodyText({ state, errorMessage, warnMessage }): any {
    const StyledBodyText = props => <span className={styles.styledBodyText}>{props.children}</span>;

    switch (state) {
      case CurrentPlanState.Pending:
        return <StyledBodyText>This might take a few minutes.</StyledBodyText>;
      case CurrentPlanState.Ready:
        return (
          <StyledBodyText>
            Select an action from the Migration Plans section of the dashboard to start the
            migration
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
                <OutlinedQuestionCircleIcon />
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
            <Flex breakpointMods={[{ modifier: FlexModifiers['justify-content-center'] }]}>
              <FlexItem>
                <HeaderIcon state={currentPlanStatus.state} />
              </FlexItem>
              <FlexItem className={spacing.myLg}>
                <HeaderText state={currentPlanStatus.state} />
              </FlexItem>
            </Flex>
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
