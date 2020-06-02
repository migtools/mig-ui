import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
  PageSection,
  Flex,
  FlexItem,
  Text,
  TextContent,
  TextVariants,
  Button,
  Checkbox,
} from '@patternfly/react-core';
import logoMA from '../../../common/components/logoMA.svg';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import flex from '@patternfly/react-styles/css/utilities/Flex/flex';
import { IReduxState } from '../../../../reducers';
import { AuthActions } from '../../../auth/duck/actions';
import { history } from '../../../../helpers';
const styles = require('./WelcomePage.module');

interface IWelcomePageBaseProps {
  isShowAgain: boolean;
  setWelcomeScreenBool: (value) => void;
  handleGetStartedClick: () => void;
}

// TODO each of these pages flashes the empty state while loading, we should show a loading spinner instead somehow.

const WelcomePageBase: React.FunctionComponent<IWelcomePageBaseProps> = ({
  isShowAgain,
  setWelcomeScreenBool,
  handleGetStartedClick,
}: IWelcomePageBaseProps) => {
  const onHandleClose = (e) => {
    history.push('/clusters');
    handleGetStartedClick();
  };

  return (
    <>
      <PageSection>
        <Flex
          className={`
            ${spacing.mtXl} 
            ${spacing.mbXl} 
            ${flex.alignContentCenter} 
            ${flex.justifyContentCenter} 
            ${flex.alignItemsCenter} 
            ${flex.flexDirectionColumn} 
          `}
        >
          <FlexItem>
            <img src={logoMA} style={{ height: 90 }} />
          </FlexItem>
          <FlexItem>
            <TextContent>
              <Text component="h1" className={`${spacing.myXl} ${styles.titleStyle}`}>
                Welcome to Cluster Application Migration
              </Text>
            </TextContent>
          </FlexItem>
          <FlexItem>
            <TextContent>
              <Text component="p" className={`${spacing.mAuto} $`}>
                Migrating clusters is a multi-step process.
              </Text>
              <ol>
                <li>Add or verify source and target clusters for the migration.</li>
                <li>
                  Add service account or Oauth tokens to authenticate to the source and target
                  clusters.
                </li>
                <li>
                  Add a replication repository as a temporary storage space for clusters being
                  migrated.
                </li>
                <li>Create a migration plan with (optional) hooks.</li>
                <li>Run the migration plan.</li>
              </ol>
            </TextContent>
          </FlexItem>
          <FlexItem className={`${spacing.myLg}`}>
            <Button key="confirm" variant="primary" onClick={(e) => onHandleClose(e)}>
              Get started
            </Button>
          </FlexItem>
          <FlexItem className={`${spacing.myLg}`}>
            <Checkbox
              label="Don't show this page again."
              aria-label="show-page"
              id="show-page-checkbox"
              isChecked={isShowAgain}
              onChange={() => setWelcomeScreenBool(isShowAgain)}
            />
          </FlexItem>
        </Flex>
      </PageSection>
    </>
  );
};

const mapStateToProps = (state: IReduxState) => ({
  isShowAgain: state.auth.isShowAgain,
});

const mapDispatchToProps = (dispatch) => ({
  setWelcomeScreenBool: (isShowAgain: boolean) => {
    // Push the add edit status into watching state, and start watching
    dispatch(AuthActions.setWelcomeScreenBool(isShowAgain));
  },
});

export const WelcomePage = connect(mapStateToProps, mapDispatchToProps)(WelcomePageBase);
