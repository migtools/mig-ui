/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { css } from '@emotion/core';
import Loader from 'react-loader-spinner';
import styled from '@emotion/styled';
import theme from '../../../../theme';
import { Flex, Box, Text } from '@rebass/emotion';
import { RedoIcon } from '@patternfly/react-icons';
import { Button, Card, CardHeader, CardBody, CardFooter, Title } from '@patternfly/react-core';
import PlanStatus from '../../../home/components/DataList/Plans/PlanStatus';
import StatusIcon from '../../../common/components/StatusIcon';

interface IProps {
  values: any;
  errors: any;
  onWizardLoadingToggle: () => void;
  currentPlan: any;
  planList: any[];
  isPollingStatus: boolean;
}

const StyledSpan = styled.span`
  font-weight: 600;
`;

const ResultsStep = props => {
  const { values, planList, isPollingStatus, startPlanStatusPolling } = props;

  const matchingPlan = planList.find(p => {
    return values.planName === p.MigPlan.metadata.name;
  });
  const handlePollRestart = () => {
    startPlanStatusPolling(values.planName);
  };

  return (
    <Flex
      flexDirection="column"
      css={css`
        height: 100%;
        text-align: center;
      `}
    >
      <Box css={css`
            display: inline-block; 
            margin-right: 10px;
            border-bottom: solid 1px ${theme.colors.medGray2};
            text-align: left;
            width: 20em;

            `}>
        {isPollingStatus ? (
          <React.Fragment>
            <Box css={css`display: inline-block; margin-right: 10px;`}>
              <Loader type="RevolvingDot" color={theme.colors.medGray3} height="1.5em" width="1.5em" />
            </Box>
            <Box css={css`display: inline-block; `}>
              <Text fontSize={[1, 2, 3]}>
                This might take a few minutes...
              </Text>
            </Box>
          </React.Fragment>
        ) : (
            <React.Fragment>
              <Box css={css`
                display: inline-block; 
                margin-right: 10px;`
              }
              >
                <Button onClick={handlePollRestart} variant="link" icon={<RedoIcon />} />
              </Box>
              <Box css={css`display: inline-block; `}>
                <Text fontSize={[1, 2, 3]}>
                  Check current plan status
              </Text>
              </Box>
            </React.Fragment>
          )}
      </Box>
      <Box css={css`
            margin-top: .5em;
            text-align: left;
            `
      }
      >
        <Text fontSize={[2, 3, 4]}>
          <Box css={css`
            display: inline-block; 
            margin-right: 10px;`
          }
          >
            Plan <StyledSpan>{values.planName}</StyledSpan> status:
          </Box>
          <Box css={css`
            display: inline-block; 
            margin-right: 10px;`
          }
          >
            <PlanStatus plan={matchingPlan} />
          </Box>
          <Box css={css`display: inline-block; `}>
            {matchingPlan.PlanStatus.hasReadyCondition ? (
              <StatusIcon isReady={true} />
            ) : (
                <StatusIcon isReady={false} />
              )}

          </Box>
        </Text>
      </Box>
    </Flex >
  );
};

export default ResultsStep;
