// TODO lib-ui candidate copied from forklift-ui

import { Tooltip, TooltipProps } from '@patternfly/react-core';
import * as React from 'react';
const styles = require('./TruncatedText.module').default;

interface ITruncatedTextProps {
  children: React.ReactNode;
  className?: string;
  tooltipProps?: Partial<TooltipProps>;
}

export const TruncatedText: React.FunctionComponent<ITruncatedTextProps> = ({
  children,
  className = '',
  tooltipProps = {},
}: ITruncatedTextProps) => {
  const [isTooltipVisible, setIsTooltipVisible] = React.useState(false);

  const onMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    if (target.offsetWidth < target.scrollWidth) {
      !isTooltipVisible && setIsTooltipVisible(true);
    } else {
      isTooltipVisible && setIsTooltipVisible(false);
    }
  };

  const truncatedChildren = (
    <div className={`${styles.truncatedText} ${className}`} onMouseEnter={onMouseEnter}>
      {children}
    </div>
  );

  return isTooltipVisible ? (
    <Tooltip content={children} isVisible {...tooltipProps}>
      {truncatedChildren}
    </Tooltip>
  ) : (
    truncatedChildren
  );
};
