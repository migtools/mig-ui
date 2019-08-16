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

interface IProps {
  values: any;
  errors: any;
  onWizardLoadingToggle: () => void;
  currentPlan: any;
  planList: any[];
  isCheckingPlanStatus: boolean;
}

const StyledSpan = styled.span`
  font-weight: 600;
`;

<<<<<<< HEAD
const ResultsStep: React.FunctionComponent<IProps> = ({
  values,
  planList,
  isCheckingPlanStatus
}) => {
=======
const ResultsStep = props => {
  const { values, planList, isPollingStatus } = props;
>>>>>>> wip refactor plan poll
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
      <Box
        flex="1"
        m="auto"
      >
<<<<<<< HEAD
        <Flex mx={-2}>
          <Box width={1 / 5} px={2} my="auto">
            <Text fontSize={[2, 3, 4]}>Plan Status</Text>
          </Box>
          <Box width={4 / 5} px={2}>
            {isCheckingPlanStatus ? (
              <Loader type="ThreeDots" color={theme.colors.navy} height="75" width="75" />
            ) : (
                <Text fontSize={[2, 3, 4]}>
                  {matchingPlan.PlanStatus.hasReadyCondition ? (
                    <StatusIcon isReady={true} />
                  ) : (
                      <StatusIcon isReady={false} />
                    )}
                  <StyledSpan>{values.planName} </StyledSpan>
                  <Box
                    css={css`
                    margin: 0.3em;
                    display: inline-block;
                  `}
                  >
                    <PlanStatus plan={matchingPlan} />
                  </Box>
                </Text>
              )}
          </Box>
        </Flex>
=======
        {isPollingStatus ? (
          <Flex mx={-2}>
            <Box width={1 / 5} px={2}>
              <Loader type="ThreeDots" color={theme.colors.darkGray1} height="75" width="75" />
            </Box>
            <Box width={4 / 5} px={2} my="auto">
              <Text fontSize={[2, 3, 4]}>Validating migration plan</Text>
              <Text fontSize={[2, 3, 4]}>{values.planName}</Text>
            </Box>
          </Flex>
        ) : (
            <Flex mx={-2}>
              <Box width={1 / 5} px={2}>
                <Loader type="ThreeDots" color={theme.colors.darkGray1} height="75" width="75" />
              </Box>
              <Box width={4 / 5} px={2} my="auto">
                <Text fontSize={[2, 3, 4]}>Validating migration plan</Text>
                <Text fontSize={[2, 3, 4]}>{values.planName}</Text>
              </Box>
            </Flex>
          )}
>>>>>>> wip refactor plan poll
      </Box>
    </Flex >
  );
};

export default ResultsStep;
