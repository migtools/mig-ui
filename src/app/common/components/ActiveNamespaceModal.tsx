import React, { useEffect, useContext, useState } from 'react';
import {
  Modal,
  Button,
  Grid,
  GridItem,
  Title,
  TitleLevel,
  BaseSizes,
} from '@patternfly/react-core';
import { AuthActions } from '../../auth/duck/actions';
import { ClusterActions } from '../../cluster/duck/actions';
import { connect } from 'react-redux';
import { PollingContext } from '../../home/duck/context';
import SimpleSelect from './SimpleSelect';
const styles = require('./ErrorModal.module');
import authSelectors from '../../auth/duck/selectors';
import { history } from '../../../helpers';

interface IProps {
  onHandleClose: () => null;
  fetchTenantNamespaces: () => null;
  fetchClusters: () => null;
  tenantNamespaceList: any;
  namespaceSelectIsOpen: boolean;
  setNamespaceSelectIsOpen: (val) => null;
  setActiveNamespace: (val) => null;
  user: any;
}

const ActiveNamespaceModal: React.FunctionComponent<IProps> = (props) => {
  const pollingContext = useContext(PollingContext);
  const [selectedActiveNamespace, setSelectedActiveNamespace] = useState(null);

  const {
    tenantNamespaceList,
    fetchTenantNamespaces,
    namespaceSelectIsOpen,
    setNamespaceSelectIsOpen,
    user,
    setActiveNamespace,
    fetchClusters,
  } = props;

  const LS_KEY_ACTIVE_NAMESPACE = 'activeNamespace';
  const activeNamespace = localStorage.getItem(LS_KEY_ACTIVE_NAMESPACE);

  useEffect(() => {
    fetchTenantNamespaces();
    pollingContext.stopAllPolling();
    if (activeNamespace) {
      setSelectedActiveNamespace(activeNamespace);
    }
  }, [user]);

  const tenantNamespaceOptions = tenantNamespaceList.map((ns) => ns.name);
  const currentTitle = selectedActiveNamespace
    ? 'Update your active namespace'
    : 'Before you begin....';
  const header = (
    <React.Fragment>
      <Title headingLevel={TitleLevel.h1} size={BaseSizes['2xl']}>
        {`${currentTitle}`}
      </Title>
    </React.Fragment>
  );
  return (
    <Modal
      header={header}
      isSmall
      isOpen={namespaceSelectIsOpen}
      title={`${currentTitle}`}
      onClose={() => setNamespaceSelectIsOpen(false)}
    >
      <Grid gutter="md">
        <form>
          <GridItem className={styles.modalHeader}>
            As part of the migration process, the Migration Toolkit for Containers will create a
            number of Kubernetes objects that need to be stored in one of your namespaces.
          </GridItem>
          <GridItem className={styles.gridMargin}>
            Tell us in which namespace you'd like to store these objects.
            <SimpleSelect
              id="id"
              onChange={(selection) => {
                setSelectedActiveNamespace(selection);
              }}
              options={tenantNamespaceOptions}
              value={selectedActiveNamespace}
              placeholderText="Select active namespace..."
            />
          </GridItem>

          <GridItem className={styles.actionButtons}>
            <Grid gutter="md">
              <GridItem span={5}>
                <Button
                  variant="primary"
                  isDisabled={selectedActiveNamespace ? false : true}
                  onClick={() => {
                    const LS_KEY_ACTIVE_NAMESPACE = 'activeNamespace';
                    localStorage.setItem(LS_KEY_ACTIVE_NAMESPACE, selectedActiveNamespace);
                    setNamespaceSelectIsOpen(false);
                    setActiveNamespace(selectedActiveNamespace);
                    fetchClusters();
                    history.push('/clusters');
                  }}
                >
                  Save
                </Button>
              </GridItem>
            </Grid>
          </GridItem>
        </form>
      </Grid>
    </Modal>
  );
};

export default connect(
  (state) => ({
    user: state.auth.user,
    tenantNamespaceList: authSelectors.tenantNamespacesSelector(state),
  }),
  (dispatch) => ({
    fetchTenantNamespaces: () => dispatch(AuthActions.fetchTenantNamespaces()),
    setNamespaceSelectIsOpen: (val) => dispatch(AuthActions.setNamespaceSelectIsOpen(val)),
    setActiveNamespace: (val) => dispatch(AuthActions.setActiveNamespace(val)),
    fetchClusters: () => dispatch(ClusterActions.clusterFetchRequest()),
  })
)(ActiveNamespaceModal);
