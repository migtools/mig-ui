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
import PlanStatus from '../../../home/components/DataList/Plans/PlanStatus';

interface IProps {
  values: any;
  errors: any;
  startPlanStatusPolling: (planName) => void;
  currentPlan: any;
  currentPlanStatus: string;
  isPollingStatus: boolean;
}

const StyledSpan = styled.span`
  font-weight: 600;
`;

const StyledIcon = styled(RedoIcon)`
  height: 3em;
  width: 3em;
`;

const ResultsStep: React.FunctionComponent<IProps> = props => {
  const { values, currentPlan, currentPlanStatus, isPollingStatus, startPlanStatusPolling } = props;
  const { MigPlan } = currentPlan;

  const handlePollRestart = () => {
    startPlanStatusPolling(values.planName);
  };

  function HeaderIcon({ status }) {
    switch (status) {
      // case 'info':
      //   return <Info text={text} />;
      // case 'warning':
      //   return <Warning text={text} />;
      // case 'error':
      //   return <Error text={text} />;
      default:
        return null;
    }
  }
  function HeaderText({ status }): any {
    switch (status) {
      case 'Pending':
        return `Validating migration plan ${MigPlan.metadata.name}`;
      case 'Ready':
        return `${MigPlan.metadata.name} has been validated.`;
      case 'Critical':
        return `Failed to validate migration plan ${MigPlan.metadata.name}`;
      default:
        return null;
    }
  }
  function BodyText({ status }): any {
    switch (status) {
      case 'Pending':
        return `This might take a few minutes.`;
      case 'Ready':
        return `Select an action from the Migration Plans section of the dashboard to start the migration.`;
      case 'Critical':
        return status.errorMessage;
      default:
        return null;
    }
  }

  return (
    <Card>
      <CardHeader>
        <HeaderIcon status={currentPlanStatus} />
        <HeaderText status={currentPlanStatus} />
      </CardHeader>
      <CardBody>
        <BodyText status={currentPlanStatus} />
      </CardBody>
    </Card>
    // <Flex
    //   css={css`
    //     margin: 5em 0;
    //     height: 100%;
    //     flex-direction: row;
    //     justify-content: center;
    //   `}
    // >
    //   <Box css={css`display: inline-block; margin: auto 1em;`}>
    //     {isPollingStatus ?
    //       <Loader type="RevolvingDot" color={theme.colors.medGray3} height="3em" width="3em" /> :
    //       <Button onClick={handlePollRestart} variant="link" icon={<StyledIcon />} />
    //     }
    //   </Box>
    //   <Box>
    //     <Flex
    //       flexDirection="column"
    //       css={css`
    //     height: 100%;
    //     text-align: center;
    //   `}
    //     >
    //       <Box css={css`
    //         `
    //       }
    //       >
    //         <Text fontSize={[2, 3, 4]}>
    //           <Box css={css`
    //         display: inline-block; 
    //         margin-right: 10px;`
    //           }
    //           >
    //             Validating migration plan <StyledSpan>{values.planName}</StyledSpan>.
    //           </Box>
    //         </Text>
    //       </Box>
    //       <Box css={css`
    //         margin-top: .5em;
    //         display: inline-block; 
    //         margin-right: 10px;
    //         width: 20em;
    //         `}>
    //         {isPollingStatus ? (
    //           <React.Fragment>
    //             <Box css={css`display: inline-block; `}>
    //               <Text fontSize={[1, 2, 3]} fontStyle="italic">
    //                 This might take a few minutes...
    //           </Text>
    //             </Box>
    //           </React.Fragment>
    //         ) : (
    //             <React.Fragment>
    //               <Box css={css`
    //                 display: inline-block; 
    //                 margin-right: 10px;`
    //               }
    //               >
    //                 <PlanStatus plan={currentPlan} />
    //               </Box>
    //               <ValidationStatus status={currentPlan.PlanStatus} />
    //               {/* <Box css={css`display: inline-block; `}>
    //                 {currentPlan.PlanStatus.hasReadyCondition ? (
    //                   <StatusIcon isReady={true} />
    //                 ) : (
    //                     <StatusIcon isReady={false} />
    //                   )}

    //               </Box> */}
    //             </React.Fragment>
    //           )}
    //       </Box>
    //     </Flex >
    //   </Box>
    // </Flex>
  );
};

export default ResultsStep;
