
import React, { FunctionComponent } from 'react';
import Select from 'react-select';
import { CardHeader, Grid, GridItem, TextContent, Text, TextVariants } from '@patternfly/react-core';
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
      (pod: IPodLogSource, podIndex) =>
        pod.containers.map((container: IPodContainer, containerIndex) => ({
          label: `${pod.name}-${container.name}`,
          value: {
            podIndex,
            containerIndex,
          },
        }))))
    : [];

  return (<span>
    {isFetchingLogs ? null : (
      <CardHeader>
        <Grid gutter='sm'>
          <GridItem span={2}>
            <TextContent >
              <Text component={TextVariants.p}>
                Select cluster:
              </Text>
            </TextContent>
          </GridItem>
          <GridItem span={4} >
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

          </GridItem>
          <GridItem span={6}>

          </GridItem>

          <GridItem span={2}>
            <TextContent >
              <Text component={TextVariants.p}>
                Select Pod Source:
              </Text>

            </TextContent>

          </GridItem>
          <GridItem span={4}>
            <Select
              name="selectPod"
              value={logSource}
              onChange={(logSelection) => {
                setLogSource(logSelection);
                const logStore: ILogSource = logSelection.value;
                logFetchRequest(
                  report[cluster.value][logStore.podIndex].containers[logStore.containerIndex].log);
              }}
              options={logSources}
            />

          </GridItem>
        </Grid>
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
