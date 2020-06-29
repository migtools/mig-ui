import React from 'react';
import { connect } from 'react-redux';
import {
  PageSection,
  Flex,
  FlexItem,
  Text,
  TextContent,
  Button,
  Checkbox,
  Bullseye,
  Title,
  List,
  ListItem,
} from '@patternfly/react-core';
import logoMA from '../../../common/components/logoMA.svg';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import alignment from '@patternfly/react-styles/css/utilities/Alignment/alignment';
import flex from '@patternfly/react-styles/css/utilities/Flex/flex';
import { IReduxState } from '../../../../reducers';
import { AuthActions } from '../../../auth/duck/actions';
import { history } from '../../../../helpers';
import { getActiveNamespaceFromStorage } from '../../../common/helpers';

interface IWelcomePageBaseProps {
  isHideWelcomeScreen: boolean;
  setWelcomeScreenBool: (value: boolean) => void;
  openNamespaceSelect: () => void;
}

const WelcomePageBase: React.FunctionComponent<IWelcomePageBaseProps> = ({
  isHideWelcomeScreen,
  setWelcomeScreenBool,
  openNamespaceSelect,
}: IWelcomePageBaseProps) => {
  const onHandleGetStarted = (e) => {
    const activeNamespace = getActiveNamespaceFromStorage();
    if (activeNamespace) {
      history.push('/clusters');
    } else {
      openNamespaceSelect();
    }
  };

  return (
    <PageSection>
      <Bullseye>
        <Flex
          className={`
            ${flex.alignItemsCenter} 
            ${flex.flexDirectionColumn} 
          `}
        >
          <FlexItem>
            <img src={logoMA} style={{ height: 90 }} />
          </FlexItem>
          <FlexItem>
            <Title
              headingLevel="h1"
              size="4xl"
              className={`${alignment.textAlignCenter} ${spacing.myXl}`}
            >
              Welcome to Cluster Application Migration
            </Title>
          </FlexItem>
          <FlexItem>
            <TextContent>
              <Text component="p" className={`${spacing.mAuto}`}>
                Migrating clusters is a multi-step process.
              </Text>
              <List component="ol">
                <ListItem>Add or verify source and target clusters for the migration.</ListItem>
                <ListItem>
                  Add service account or Oauth tokens to authenticate to the source and target
                  clusters.
                </ListItem>
                <ListItem>
                  Add a replication repository as a temporary storage space for clusters being
                  migrated.
                </ListItem>
                <ListItem>Create a migration plan with (optional) hooks.</ListItem>
                <ListItem>Run the migration plan.</ListItem>
              </List>
            </TextContent>
          </FlexItem>
          <FlexItem className={`${spacing.myLg}`}>
            <Button key="confirm" variant="primary" onClick={(e) => onHandleGetStarted(e)}>
              Get started
            </Button>
          </FlexItem>
          <FlexItem className={`${spacing.myLg}`}>
            <Checkbox
              label="Don't show this page again."
              aria-label="show-page"
              id="show-page-checkbox"
              isChecked={isHideWelcomeScreen}
              onChange={() => {
                setWelcomeScreenBool(!isHideWelcomeScreen);
                const LS_KEY_HAS_LOGGED_IN = 'hasLoggedIn';
                const loginInfoObject = { isHideWelcomeScreen: !isHideWelcomeScreen };
                localStorage.setItem(LS_KEY_HAS_LOGGED_IN, JSON.stringify(loginInfoObject));
              }}
            />
          </FlexItem>
        </Flex>
      </Bullseye>
    </PageSection>
  );
};

const mapStateToProps = (state: IReduxState) => ({
  isHideWelcomeScreen: state.auth.isHideWelcomeScreen,
});

const mapDispatchToProps = (dispatch) => ({
  setWelcomeScreenBool: (isHideWelcomeScreen: boolean) => {
    dispatch(AuthActions.setWelcomeScreenBool(isHideWelcomeScreen));
  },
});

export const WelcomePage = connect(mapStateToProps, mapDispatchToProps)(WelcomePageBase);
