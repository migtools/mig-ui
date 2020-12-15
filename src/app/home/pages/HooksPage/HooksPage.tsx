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
  Bullseye,
  Spinner,
  EmptyStateBody,
} from '@patternfly/react-core';
import AddCircleOIcon from '@patternfly/react-icons/dist/js/icons/add-circle-o-icon';
import SearchIcon from '@patternfly/react-icons/dist/js/icons/search-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { ClusterContext } from '../../duck/context';
import Hookselectors from '../../../cluster/duck/selectors';
import { ClusterActions } from '../../../cluster/duck/actions';
import { createAddEditStatus, AddEditState, AddEditMode } from '../../../common/add_edit_state';
import HooksTable from './components/HooksTable';
import AddEditClusterModal from './components/AddEditClusterModal';
import { useOpenModal } from '../../duck';
import { ICluster } from '../../../cluster/duck/types';
import { IMigMeta } from '../../../auth/duck/types';
import { IReduxState } from '../../../../reducers';
import { IPlanCountByResourceName } from '../../../common/duck/types';
import { TokenActions } from '../../../token/duck/actions';

interface IHooksPageBaseProps {
  clusterList: ICluster[];
  clusterAssociatedPlans: IPlanCountByResourceName;
  migMeta: IMigMeta;
  watchClusterAddEditStatus: (clusterName: string) => void;
  removeCluster: (clusterName: string) => void;
  isFetchingInitialHooks: boolean;
  isAdmin: boolean;
  isAddEditTokenModalOpen: boolean;
  toggleAddEditTokenModal: () => void;
  setAssociatedCluster: (clusterName: string) => void;
  setCurrentCluster: (currentCluster: ICluster) => void;
}

const HooksPageBase: React.FunctionComponent<IHooksPageBaseProps> = ({
  clusterList,
  clusterAssociatedPlans,
  migMeta,
  watchClusterAddEditStatus,
  removeCluster,
  isFetchingInitialHooks,
  isAdmin,
  toggleAddEditTokenModal,
  isAddEditTokenModalOpen,
  setAssociatedCluster,
  setCurrentCluster,
}: IHooksPageBaseProps) => {
  const [isAddEditModalOpen, toggleAddEditModal] = useOpenModal(false);

  const renderEmptyState = () =>
    isAdmin ? (
      <EmptyState variant="full" className={spacing.my_2xl}>
        <EmptyStateIcon icon={AddCircleOIcon} />
        <Title headingLevel="h3" size="lg">
          Add source and target Hooks for the migration
        </Title>
        <Button onClick={toggleAddEditModal} variant="primary">
          Add cluster
        </Button>
      </EmptyState>
    ) : (
      <EmptyState variant="full" className={spacing.my_2xl}>
        <EmptyStateIcon icon={SearchIcon} />
        <Title headingLevel="h3" size="lg">
          No Hooks
        </Title>
        <EmptyStateBody>
          <TextContent>
            <Text component="p">
              You must have administrator rights to the cluster where the migration controller is
              installed in order to add Hooks for migration. Contact the cluster administrator for
              assistance.
            </Text>
          </TextContent>
        </EmptyStateBody>
      </EmptyState>
    );

  return (
    <>
      <PageSection variant="light">
        <TextContent>
          <Text component="h1" className={spacing.mbAuto}>
            Hooks
          </Text>
        </TextContent>
      </PageSection>
      <PageSection>
        {isFetchingInitialHooks ? (
          <Bullseye>
            <EmptyState variant="large">
              <div className="pf-c-empty-state__icon">
                <Spinner size="xl" />
              </div>
              <Title headingLevel="h2" size="xl">
                Loading...
              </Title>
            </EmptyState>
          </Bullseye>
        ) : (
          <Card>
            <CardBody>
              <ClusterContext.Provider value={{ watchClusterAddEditStatus }}>
                {!clusterList ? null : clusterList.length === 0 ? (
                  renderEmptyState()
                ) : (
                  <HooksTable
                    clusterList={clusterList}
                    associatedPlans={clusterAssociatedPlans}
                    migMeta={migMeta}
                    removeCluster={removeCluster}
                    toggleAddEditModal={toggleAddEditModal}
                    isAdmin={isAdmin}
                    toggleAddEditTokenModal={toggleAddEditTokenModal}
                    isAddEditTokenModalOpen={isAddEditTokenModalOpen}
                    setAssociatedCluster={setAssociatedCluster}
                    setCurrentCluster={setCurrentCluster}
                  />
                )}
                <AddEditClusterModal
                  isOpen={isAddEditModalOpen}
                  onHandleClose={toggleAddEditModal}
                />
              </ClusterContext.Provider>
            </CardBody>
          </Card>
        )}
      </PageSection>
    </>
  );
};

const mapStateToProps = (state: IReduxState) => ({});

const mapDispatchToProps = (dispatch) => ({});

export const HooksPage = connect(mapStateToProps, mapDispatchToProps)(HooksPageBase);
