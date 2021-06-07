import React, { useState, useContext } from 'react';
import { Text, Modal, Grid, GridItem, ClipboardCopy } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useDispatch } from 'react-redux';
const styles = require('./MigrateModal.module').default;

interface IProps {
  onHandleClose: () => void;
  id?: string;
  isOpen: boolean;
}

const AccessLogsModal: React.FunctionComponent<IProps> = ({ onHandleClose, isOpen }) => {
  return (
    <Modal variant="large" isOpen={isOpen} onClose={() => onHandleClose()} title={`Access logs`}>
      <Grid hasGutter>
        <GridItem>
          Run the command below on the source or target cluster CLI to view aggregated logs from the
          following pods:
          <ul>
            <li>- mig-controller logs</li>
            <li>- velero logs</li>
            <li>- restic logs</li>
            <li>- rsync logs</li>
            <li>- stunnel logs</li>
            <li>- registry logs</li>
          </ul>
        </GridItem>
        <GridItem className={styles.gridMargin}>
          <Text>To view colorized logs (each pod has a different color):</Text>
          <ClipboardCopy isReadOnly>
            oc logs -f -l logreader=mig -n openshift-migration -c color
          </ClipboardCopy>
        </GridItem>
        <GridItem>
          <Text>
            To view plain logs (for grepping or other processing where shell color codes would be a
            nuisance):
          </Text>
          <ClipboardCopy isReadOnly>
            oc logs -f -l logreader=mig -n openshift-migration -c plain
          </ClipboardCopy>
        </GridItem>
      </Grid>
    </Modal>
  );
};
export default AccessLogsModal;
