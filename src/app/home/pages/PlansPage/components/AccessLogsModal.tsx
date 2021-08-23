import React from 'react';
import { Text, Modal, Grid, GridItem, ClipboardCopy } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

interface IProps {
  onHandleClose: () => void;
  id?: string;
  isOpen: boolean;
}

const AccessLogsModal: React.FunctionComponent<IProps> = ({ onHandleClose, isOpen }) => {
  return (
    <Modal variant="large" isOpen={isOpen} onClose={() => onHandleClose()} title={`View logs`}>
      <Grid hasGutter>
        <GridItem>
          Copy and paste the command to view aggregated logs from the following pods:
          <ul>
            <li>- mig-controller</li>
            <li>- velero</li>
            <li>- restic</li>
            <li>- rsync</li>
            <li>- stunnel</li>
            <li>- registry</li>
          </ul>
        </GridItem>
        <GridItem>
          <Text>To view colorized logs (each pod has a different color):</Text>
          <ClipboardCopy isReadOnly>
            oc logs --follow --selector logreader=mig --namespace openshift-migration --container
            color
          </ClipboardCopy>
        </GridItem>
        <GridItem>
          <Text>To view plain logs (for grepping or other processing):</Text>
          <ClipboardCopy isReadOnly>
            oc logs --follow --selector logreader=mig --namespace openshift-migration --container
            plain
          </ClipboardCopy>
        </GridItem>
      </Grid>
    </Modal>
  );
};
export default AccessLogsModal;
