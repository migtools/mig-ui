import React from 'react';
import { Tooltip, TooltipProps } from '@patternfly/react-core';

export interface IConditionalTooltipProps extends TooltipProps {
  isTooltipEnabled: boolean;
  children: React.ReactElement;
}

// TODO: lib-ui candidate
const ConditionalTooltip: React.FunctionComponent<IConditionalTooltipProps> = ({
  isTooltipEnabled,
  children,
  ...props
}: IConditionalTooltipProps) =>
  isTooltipEnabled ? <Tooltip {...props}>{children}</Tooltip> : children;

export default ConditionalTooltip;
