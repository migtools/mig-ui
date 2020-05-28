import React from 'react';
import PlanStatusIcon from './PlanStatusIcon';
import { Flex, FlexItem } from '@patternfly/react-core';
import { getPlanStatusText } from '../helpers';

interface IProps {
  plan: any; // TODO add type
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
