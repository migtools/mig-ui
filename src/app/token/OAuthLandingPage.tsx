import React from 'react';
import {
  Page,
  PageSection,
  Card,
  CardBody,
  EmptyState,
  EmptyStateIcon,
  Title,
  TextContent,
  Text,
} from '@patternfly/react-core';
import { LockIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import PageHeaderComponent from '../common/components/PageHeaderComponent';

const OAuthLandingPage: React.FunctionComponent = () => (
  <Page header={<PageHeaderComponent />}>
    <PageSection>
      <Card>
        <CardBody>
          <EmptyState variant="full" className={`${spacing.mtXl} ${spacing.mbXl}`}>
            <EmptyStateIcon icon={LockIcon} />
            <Title size="lg">Authentication successful</Title>
            <TextContent className={spacing.mtMd}>
              <Text component="p">
                You can now resume your existing session in its original tab. <br />
                If this tab does not automatically close, close it now to continue.
              </Text>
            </TextContent>
          </EmptyState>
        </CardBody>
      </Card>
    </PageSection>
  </Page>
);

export default OAuthLandingPage;
