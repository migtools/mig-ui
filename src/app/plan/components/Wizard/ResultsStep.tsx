/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { css } from '@emotion/core';
import Loader from 'react-loader-spinner';
import styled from '@emotion/styled';
import theme from '../../../../theme';
import { Flex, Box, Text } from '@rebass/emotion';
import { Card, CardHeader, CardBody, CardFooter, Title } from '@patternfly/react-core';
import PlanStatus from '../../../home/components/DataList/Plans/PlanStatus';
import StatusIcon from '../../../common/components/StatusIcon';
const StyledSpan = styled.span`
  font-weight: 600;
`;

const ResultsStep = props => {
  const { values, errors, planList, isCheckingPlanStatus } = props;
  const matchingPlan = planList.find(p => {
    return values.planName === p.MigPlan.metadata.name;
  });

  return (
    <Flex
      css={css`
        height: 100%;
        text-align: center;
      `}
    >
      <Box flex="1" m="auto">
        <Card style={{ minHeight: '100%', height: '16em' }}>
          <CardHeader>Plan Status</CardHeader>
          {isCheckingPlanStatus ? (
            <Flex
              css={css`
                height: 100%;
                text-align: center;
                margin: auto;
              `}
            >
              <Box flex="1" m="auto">
                <Loader type="ThreeDots" color={theme.colors.navy} height="100" width="100" />
                <Text fontSize={[2, 3, 4]}> Checking status </Text>
              </Box>
            </Flex>
          ) : (
            <Text fontSize={[2, 3, 4]}>
              {matchingPlan.PlanStatus.hasReadyCondition ? (
                <StatusIcon isReady={true} />
              ) : (
                <StatusIcon isReady={false} />
              )}
              <StyledSpan>{values.planName} </StyledSpan>
              <PlanStatus plan={matchingPlan} />
            </Text>
          )}
        </Card>
      </Box>
    </Flex>
  );
};

export default ResultsStep;
