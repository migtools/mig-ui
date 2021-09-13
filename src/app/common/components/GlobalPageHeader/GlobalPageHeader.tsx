import React from 'react';
import { PageSection, TextContent, Text } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

export interface IPageSectionWithErrorsProps {
  title: string;
  children?: any;
}

const GlobalPageHeader: React.FunctionComponent<IPageSectionWithErrorsProps> = ({
  title,
  children,
}: IPageSectionWithErrorsProps) => {
  return (
    <PageSection variant="light">
      {children}
      <TextContent>
        <Text component="h1" className={spacing.mbAuto}>
          {title}
        </Text>
      </TextContent>
    </PageSection>
  );
};

export default GlobalPageHeader;
