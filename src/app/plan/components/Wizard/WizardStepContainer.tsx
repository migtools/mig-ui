import React from 'react';
import { TextContent, Text, TextVariants } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

interface IWizardStepContainerProps {
  title: string;
  children: React.ReactNode;
}

const WizardStepContainer: React.FunctionComponent<IWizardStepContainerProps> = ({
  title,
  children,
}: IWizardStepContainerProps) => (
  <React.Fragment>
    <TextContent className={spacing.mbMd}>
      <Text component={TextVariants.h2}>{title}</Text>
    </TextContent>
    {children}
  </React.Fragment>
);

export default WizardStepContainer;
