import React from 'react';
import PlanStatusIcon from './PlanStatusIcon';
import { Flex, FlexItem } from '@patternfly/react-core';
import { getPlanStatusText } from '../helpers';
import { IPlan } from '../../../../plan/duck/types';

interface IProps {
  plan: IPlan;
}

const PlanStatus: React.FunctionComponent<IProps> = ({ plan }) => (
  <Flex>
    <FlexItem>
      <PlanStatusIcon plan={plan} />
    </FlexItem>
    <FlexItem>{getPlanStatusText(plan)}</FlexItem>
  </Flex>
);

export default PlanStatus;
