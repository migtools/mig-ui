import React, { useEffect, useState } from 'react';
import { useLocation, Redirect } from 'react-router-dom';
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
  Spinner,
} from '@patternfly/react-core';
import LockIcon from '@patternfly/react-icons/dist/js/icons/lock-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import PageHeaderComponent from '../common/components/PageHeaderComponent';

const OAuthLandingPage: React.FunctionComponent = () => {
  const searchParams = new URLSearchParams(useLocation().search);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state) return <Redirect to="/" />;

  const [isCodeStored, setIsCodeStored] = useState(false);

  useEffect(() => {
    try {
      // Use the state param as a unique id for this particular login attempt
      window.localStorage.setItem(`oauth-code-${state}`, code);
      setIsCodeStored(true);
    } catch (e) {
      // An exception can be thrown if the storage is full.
      alert('An error occurred completing your login. Restart your browser and try again.');
    }
  }, []);

  return (
    <Page header={<PageHeaderComponent />}>
      <PageSection>
        <Card>
          <CardBody>
            <EmptyState variant="full" className={`${spacing.mtXl} ${spacing.mbXl}`}>
              {isCodeStored ? (
                <EmptyStateIcon icon={LockIcon} />
              ) : (
                <div className={spacing.mbMd}>
                  <Spinner size="xl" />
                </div>
              )}
              <Title headingLevel="h2" size="lg">
                {isCodeStored ? 'Authentication successful' : 'Completing authentication...'}
              </Title>
              {isCodeStored && (
                <TextContent className={spacing.mtMd}>
                  <Text component="p">
                    You can now resume your existing session in its original tab. <br />
                    If this tab does not automatically close, close it now to continue.
                  </Text>
                </TextContent>
              )}
            </EmptyState>
          </CardBody>
        </Card>
      </PageSection>
    </Page>
  );
};

export default OAuthLandingPage;
