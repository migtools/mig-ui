import React from 'react';
import PlanStatusIcon from './PlanStatusIcon';
import { Flex, FlexItem } from '@patternfly/react-core';
import { getPlanStatusText } from '../helpers';
import { IPlan } from '../../../../plan/duck/types';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

interface IProps {
  plan: IPlan;
}

const PlanStatus: React.FunctionComponent<IProps> = ({ plan }) => (
  <Flex>
    <FlexItem>
      <PlanStatusIcon plan={plan} />
      <span className={spacing.mlSm}>{getPlanStatusText(plan)}</span>
    </FlexItem>
  </Flex>
);

export default PlanStatus;
