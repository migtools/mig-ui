import React, { useEffect, useState } from 'react';
import { Text, Modal, Grid, GridItem, ClipboardCopy, Flex, FlexItem } from '@patternfly/react-core';
import { useDispatch, useSelector } from 'react-redux';
import { clusterPodFetchRequest, ILogReducerState } from '../../../../logs/duck/slice';
import { DefaultRootState } from '../../../../../configureStore';
import SimpleSelect from '../../../../common/components/SimpleSelect';
import { usePausedPollingEffect } from '../../../../common/context';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
const styles = require('./AccessLogsModal.module').default;

interface IProps {
  onHandleClose: () => void;
  id?: string;
  isOpen: boolean;
  planName: string;
}

const AccessLogsModal: React.FunctionComponent<IProps> = ({ planName, onHandleClose, isOpen }) => {
  usePausedPollingEffect();
  const dispatch = useDispatch();
  const [clusterList, setClusterList] = useState([]);
  const [cluster, setCluster] = useState(null);
  const logs: ILogReducerState = useSelector((state: DefaultRootState) => state.logs);
  useEffect(() => {
    dispatch(clusterPodFetchRequest(planName));
    if (logs.logPodObject) {
      setClusterList([
        {
          toString: () => 'Host cluster',
          value: {
            name: 'Host cluster',
            podName: logs.logPodObject.host.name,
          },
        },
        {
          toString: () => 'Source cluster',
          value: {
            name: 'Source cluster',
            podName: logs.logPodObject.src.name,
          },
        },
        {
          toString: () => 'Target cluster',
          value: {
            name: 'Target cluster',
            podName: logs.logPodObject.dest.name,
          },
        },
      ]);
    }
  }, []);
  return (
    <Modal variant="large" isOpen={isOpen} onClose={() => onHandleClose()} title={`View logs`}>
      <Flex>
        <FlexItem>
          Copy and paste the command to view aggregated logs from the following pods:
          <ul>
            <li>- mig-controller</li>
            <li>- velero</li>
            <li>- restic</li>
            <li>- rsync</li>
            <li>- stunnel</li>
            <li>- registry</li>
          </ul>
        </FlexItem>
        <FlexItem
          className={`${spacing.mlSm} ${styles.selectBoxStyle}`}
          alignSelf={{ default: 'alignSelfFlexEnd' }}
          // flex={{ default: 'flex_1' }}
        >
          <SimpleSelect
            id="selectCluster"
            onChange={(clusterSelected: any) => {
              setCluster(clusterSelected);
            }}
            value={cluster}
            placeholderText="Select cluster..."
            options={clusterList}
          />
        </FlexItem>
      </Flex>
      {cluster && (
        <>
          <GridItem>
            <Text>To view colorized logs (each pod has a different color):</Text>
            <ClipboardCopy isReadOnly>
              {`oc logs ${cluster.value.podName} --namespace openshift-migration -c color`}
            </ClipboardCopy>
          </GridItem>
          <GridItem>
            <Text>To view plain logs (for grepping or other processing):</Text>
            <ClipboardCopy isReadOnly>
              {`oc logs ${cluster.value.podName} --namespace openshift-migration -c plain`}
              {/* oc logs --follow --selector logreader=mig --namespace openshift-migration --container
            plain */}
            </ClipboardCopy>
          </GridItem>
        </>
      )}
    </Modal>
  );
};
export default AccessLogsModal;
