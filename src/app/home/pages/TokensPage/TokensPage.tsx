import React from 'react';
import { connect } from 'react-redux';
import {
  Card,
  PageSection,
  TextContent,
  Text,
  CardBody,
  EmptyState,
  EmptyStateIcon,
  Title,
  Button,
} from '@patternfly/react-core';
import { AddCircleOIcon, WrenchIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import clusterSelectors from '../../../cluster/duck/selectors';
import TokensTable from './components/TokensTable';
import { useOpenModal } from '../../duck/hooks';
import { IReduxState } from '../../../../reducers';
import { IToken } from '../../../token/duck/types';
import { ICluster } from '../../../cluster/duck/types';

interface ITokensPageBaseProps {
  tokenList: IToken[];
  clusterList: ICluster[];
}

const TokensPageBase: React.FunctionComponent<ITokensPageBaseProps> = ({
  // tokenList, // NATODO
  clusterList,
}: ITokensPageBaseProps) => {
  const [isAddEditModalOpen, toggleAddEditModal] = useOpenModal(false);

  // Stub data, modal toggle button will switch between empty state and table view
  // NATODO remove this and use real data
  const tokenList = isAddEditModalOpen ? [{ MigToken: { fake: 'token' } }] : [];

  return (
    <>
      <PageSection variant="light">
        <TextContent>
          <Text component="h1" className={spacing.mbAuto}>
            Tokens
          </Text>
        </TextContent>
      </PageSection>
      <PageSection>
        <Card>
          <CardBody>
            {/* NATODO add a TokenContext provider here when that becomes necessary? */}
            {!clusterList || !tokenList ? null : clusterList.length === 0 ? (
              <EmptyState variant="full">
                <EmptyStateIcon icon={WrenchIcon} />
                <Title size="lg">No clusters have been added</Title>
                <TextContent className={spacing.mtMd}>
                  <Text component="p">
                    An administrator must add clusters for migration before you can add tokens.
                    Contact the cluster administrator for assistance.
                  </Text>
                </TextContent>
              </EmptyState>
            ) : tokenList.length === 0 ? (
              <EmptyState variant="full">
                <EmptyStateIcon icon={AddCircleOIcon} />
                <Title size="lg">No tokens</Title>
                <TextContent className={spacing.mtMd}>
                  <Text component="p">
                    Add tokens to authenticate to source and target clusters.
                  </Text>
                </TextContent>
                <Button onClick={toggleAddEditModal} variant="primary">
                  Add token
                </Button>
              </EmptyState>
            ) : (
              <TokensTable tokenList={tokenList} toggleAddEditModal={toggleAddEditModal} />
            )}
            {/* NATODO render an add/edit modal here */}
          </CardBody>
        </Card>
      </PageSection>
    </>
  );
};

const mapStateToProps = (state: IReduxState) => ({
  tokenList: null, // NATODO pull real data from redux here
  clusterList: clusterSelectors.getAllClusters(state),
});

const mapDispatchToProps = (dispatch) => ({});

export const TokensPage = connect(mapStateToProps, mapDispatchToProps)(TokensPageBase);
