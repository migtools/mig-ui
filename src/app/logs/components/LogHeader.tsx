/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FunctionComponent } from 'react';
import { Box, Flex, Text } from '@rebass/emotion';
import Select from 'react-select';
import { CardHeader } from '@patternfly/react-core';
import { connect } from 'react-redux';
import { LogActions } from '../duck';
import { flatten } from 'lodash';
import { IPlanLogSources, IPodLogSource, IPodContainer } from '../../../client/resources/discovery';
import { ILogSource, LogUnselected } from './LogsContainer';

interface ISelectItem {
  label: any;
  value: any;
}

interface IProps {
  isFetchingLogs: boolean;
  report: IPlanLogSources;
  cluster: ISelectItem;
  logSource: ISelectItem;
  setCluster: (itemISelectItem) => void;
  setLogSource: (itemISelectItem) => void;
  logFetchRequest: (string) => void;
}

const LogHeader: FunctionComponent<IProps> = ({
  isFetchingLogs,
  report,
  cluster,
  logSource,
  setCluster,
  setLogSource,
  logFetchRequest
}) => {
  const clusters = Object.keys(report)
    .map(cl => {
      return {
        label: cl,
        value: cl,
      };
    });

  const logSources = report && report[cluster.value]
    ? flatten(report[cluster.value].map(
      (pod: IPodLogSource, index) =>
        pod.containers.map((container: IPodContainer, containerIndex) => ({
          label: `${pod.name}-${container.name}`,
          value: {
            podIndex: index,
            logIndex: containerIndex,
          },
        }))))
    : [];

  return (<span>
    {isFetchingLogs ? null : (
      <CardHeader style={{ height: '10%' }}>
        <Flex>
          <Box mx="3em" width={1 / 2} flex="auto">
            <Text>Select Cluster</Text>
            <Select
              name="selectCluster"
              value={cluster}
              onChange={clusterSelected => {
                setCluster(clusterSelected);
                setLogSource({
                  label: null,
                  value: {
                    podIndex: LogUnselected,
                    logIndex: LogUnselected,
                  }
                });
              }}
              options={clusters}
            />
          </Box>
          <Box mx="3em" width={1 / 2} flex="auto">
            <Text>Select Pod Source</Text>
            <Select
              name="selectPod"
              value={logSource}
              onChange={(pod: ILogSource) => {
                setLogSource(pod);
                logFetchRequest(report[cluster.value][pod.podIndex].containers[pod.containerIndex].log);
              }}
              options={logSources}
            />
          </Box>
        </Flex>
      </CardHeader>)
    }
  </span>);
};

export default connect(
  state => ({
    report: state.logs.report,
    isFetchingLogs: state.logs.isFetchingLogs,
  }),
  dispatch => ({
    logFetchRequest: (logPath) => dispatch(LogActions.logFetchRequest(logPath)),
  })
)(LogHeader);
