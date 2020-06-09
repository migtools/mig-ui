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
} from '@patternfly/react-core';
import { WrenchIcon } from '@patternfly/react-icons';
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
  tokenList,
  clusterList,
}: ITokensPageBaseProps) => {
  const [isAddEditModalOpen, reallyToggleAddEditModal] = useOpenModal(false);
  const toggleAddEditModal = () => {
    alert('NATODO: modal still being implemented!');
    reallyToggleAddEditModal();
  };

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

// NATODO remove this when we have real data
const fakeTokens = [
  {
    MigToken: {
      apiVersion: '1.0',
      kind: 'MigToken',
      metadata: {
        name: 'My Token',
      },
      spec: {
        migClusterRef: { name: 'cluster-name', namespace: 'some-namespace' },
        secretRef: { name: 'secret-name', namespace: 'some-namespace' },
      },
      status: {
        observedDigest: 'foo',
        type: 'OAuth',
        expiresAt: '2020-06-08T20:55:53.825Z',
      },
    },
  },
];

const mapStateToProps = (state: IReduxState) => ({
  tokenList: fakeTokens, // NATODO pull real data from redux here
  clusterList: clusterSelectors.getAllClusters(state),
});

const mapDispatchToProps = (dispatch) => ({});

export const TokensPage = connect(mapStateToProps, mapDispatchToProps)(TokensPageBase);
