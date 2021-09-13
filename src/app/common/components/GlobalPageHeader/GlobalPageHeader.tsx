import React from 'react';
import { PageSection, TextContent, Text } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { ICommonReducerState } from '../../duck/slice';
import { useSelector } from 'react-redux';
import { DefaultRootState } from '../../../../configureStore';
import GlobalAlert from './GlobalAlert';

export interface IPageSectionWithErrorsProps {
  title: string;
  children?: any;
}

const GlobalPageHeader: React.FunctionComponent<IPageSectionWithErrorsProps> = ({
  title,
  children,
}: IPageSectionWithErrorsProps) => {
  const common: ICommonReducerState = useSelector((state: DefaultRootState) => state.common);

  return (
    <PageSection variant="light">
      {children}
      <TextContent>
        <Text component="h1" className={spacing.mbAuto}>
          {title}
        </Text>
      </TextContent>
      {common.errorText && (
        <GlobalAlert alertMessage={common.errorText}>{common.errorText}</GlobalAlert>
      )}
    </PageSection>
  );
};

export default GlobalPageHeader;
