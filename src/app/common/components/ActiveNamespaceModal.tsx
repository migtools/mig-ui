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
import { connect } from 'react-redux';
import { PollingContext } from '../../home/duck/context';
import SimpleSelect from './SimpleSelect';
const styles = require('./ErrorModal.module');
import authSelectors from '../../auth/duck/selectors';
import { setActiveNamespace } from '../../../mig_meta';

interface IProps {
  onHandleClose: () => null;
  fetchTenantNamespaces: () => null;
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
  } = props;

  useEffect(() => {
    fetchTenantNamespaces();
    pollingContext.stopAllPolling();
  }, [user]);

  const tenantNamespaceOptions = tenantNamespaceList.map((ns) => ns.name);
  const currentTitle = 'Before you begin....';
  const header = (
    <React.Fragment>
      <Title headingLevel={TitleLevel.h1} size={BaseSizes['2xl']}>
        {`${currentTitle}`}
      </Title>
    </React.Fragment>
  );
  return (
    <Modal header={header} isSmall isOpen={namespaceSelectIsOpen} title={`${currentTitle}`}>
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
              onChange={(selection) => setSelectedActiveNamespace(selection)}
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
                  onClick={() => {
                    const LS_KEY_ACTIVE_NAMESPACE = 'activeNamespace';
                    localStorage.setItem(
                      LS_KEY_ACTIVE_NAMESPACE,
                      JSON.stringify(selectedActiveNamespace)
                    );
                    setNamespaceSelectIsOpen(false);
                    setActiveNamespace(selectedActiveNamespace);
                  }}
                >
                  Save
                </Button>
              </GridItem>
              <GridItem span={4}>
                <Button
                  key="cancel"
                  variant="secondary"
                  onClick={() => {
                    setNamespaceSelectIsOpen(false);
                  }}
                >
                  Cancel
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
    migMeta: state.migMeta,
    user: state.auth.user,
    tenantNamespaceList: authSelectors.tenantNamespacesSelector(state),
  }),
  (dispatch) => ({
    fetchTenantNamespaces: () => dispatch(AuthActions.fetchTenantNamespaces()),
    setNamespaceSelectIsOpen: (val) => dispatch(AuthActions.setNamespaceSelectIsOpen(val)),
    setActiveNamespace: (val) => dispatch(setActiveNamespace(val)),
  })
)(ActiveNamespaceModal);
