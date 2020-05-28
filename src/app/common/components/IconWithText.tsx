import React from 'react';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
const styles = require('./IconWithText.module');

interface IIconWithTextProps {
  icon: React.ReactNode;
  text: React.ReactNode;
}

const IconWithText: React.FunctionComponent<IIconWithTextProps> = ({
  icon,
  text,
}: IIconWithTextProps) => (
  <span className={styles.iconWithText}>
    {icon}
    <span className={spacing.mlSm}>{text}</span>
  </span>
);

export default IconWithText;
