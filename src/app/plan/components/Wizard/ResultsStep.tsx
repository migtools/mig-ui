/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { css } from '@emotion/core';
import Loader from 'react-loader-spinner';
import styled from '@emotion/styled';
import theme from '../../../../theme';
import { Flex, Box, Text } from '@rebass/emotion';
import { RedoIcon } from '@patternfly/react-icons';
import { Card, CardHeader, CardBody, Button } from '@patternfly/react-core';
import StatusIcon from '../../../common/components/StatusIcon';
import { ICurrentPlanStatus, CurrentPlanState } from '../../duck/reducers';
interface IProps {
  values: any;
  errors: any;
  startPlanStatusPolling: (planName) => void;
  currentPlan: any;
  currentPlanStatus: ICurrentPlanStatus;

  isPollingStatus: boolean;
}



const ResultsStep: React.FunctionComponent<IProps> = props => {
  const { values, currentPlan, currentPlanStatus, isPollingStatus, startPlanStatusPolling } = props;

  const handlePollRestart = () => {
    startPlanStatusPolling(values.planName);
  };

  function HeaderIcon({ state }) {
    const StyledIcon = styled(RedoIcon)`
      height: 1.3em;
      width: 1.3em;
    `;

    switch (state) {
      case CurrentPlanState.Pending:
        return <Loader css={css`display: inline;`} type="RevolvingDot" color={theme.colors.medGray3} height="1em" width="1em" />;
      case CurrentPlanState.Ready:
        return <StatusIcon isReady={true} />;
      case CurrentPlanState.Critical:
        return <StatusIcon isReady={false} />;
      case CurrentPlanState.TimedOut:
        return <Button onClick={handlePollRestart} variant="link" icon={<StyledIcon />} />
      default:
        return null;
    }
  }
  function HeaderText({ state }): any {
    const StyledPlanName = styled.span`
      display: inline-block;
      font-size: 1.3em;
      font-weight: 900;
    `;
    const StyledValidationText = styled.span`
      font-size: 1.3em;
      font-weight: 300;
      display: inline-block;
    `;

    switch (state) {
      case CurrentPlanState.Pending:
        return <StyledValidationText>
          Validating migration plan
          {` `}
          <StyledPlanName>
            {currentPlan.metadata.name}
          </StyledPlanName>
          {`.`}
        </StyledValidationText>
      case CurrentPlanState.Ready:
        return <StyledValidationText>
          <StyledPlanName>
            {currentPlan.metadata.name}
          </StyledPlanName>
          {` `}
          has been validated.
        </StyledValidationText>
      case CurrentPlanState.Critical:
        return <StyledValidationText>
          Failed to validate migration plan
          {` `}
          <StyledPlanName>
            {currentPlan.metadata.name}
          </StyledPlanName>
          {`.`}
        </StyledValidationText>
      case CurrentPlanState.TimedOut:
        return <StyledValidationText>
          Failed to validate migration plan
          {` `}
          <StyledPlanName>
            {currentPlan.metadata.name}
          </StyledPlanName>
          {`. Please Try again.`}
        </StyledValidationText>
      default:
        return null;
    }
  }
  function BodyText({ state, errorMessage }): any {
    const StyledBodyText = styled.span`
      font-size: 1.0em;
      font-weight: 300;
      display: inline-block;
      font-style: italic;
    `;

    switch (state) {
      case CurrentPlanState.Pending:
        return <StyledBodyText>
          This might take a few minutes.
        </StyledBodyText>
      case CurrentPlanState.Ready:
        return <StyledBodyText>
          Select an action from the Migration Plans section of the dashboard to start the migration
        </StyledBodyText>
      case CurrentPlanState.Critical:
        return <StyledBodyText>
          {errorMessage}
        </StyledBodyText>
      default:
        return null;
    }
  }

  return (
    <Card>
      <CardHeader>
        <HeaderIcon
          state={currentPlanStatus.state} />
        <HeaderText
          state={currentPlanStatus.state} />
      </CardHeader>
      <CardBody>
        <BodyText state={currentPlanStatus.state} errorMessage={currentPlanStatus.errorMessage} />
      </CardBody>
    </Card>
  );
};

export default ResultsStep;
