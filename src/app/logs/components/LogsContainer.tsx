/** @jsx jsx */
import { jsx } from '@emotion/core';
import {
  useEffect,
  useContext,
  useState,
  FunctionComponent
} from 'react';
import { connect } from 'react-redux';
import { IMigrationLogs, ClusterKind, LogKind, ILog, IMigrationClusterLog } from '../duck/sagas';
import { IMigPlan, IMigMigration } from '../../../client/resources/conversions';
import LogHeader from './LogHeader';
import LogBody from './LogBody';
import LogFooter from './LogFooter';
import { LogActions } from '../duck';
import {
  Card,
  EmptyStateVariant,
  EmptyState,
  EmptyStateIcon,
  Title,
  EmptyStateBody,
} from '@patternfly/react-core';
import { WarningTriangleIcon } from '@patternfly/react-icons';

interface IProps {
  planName: string;
  isFetchingLogs: boolean;
  plan: IMigPlan;
  migrations: IMigMigration[];
  logs: IMigrationLogs;
  refreshLogs: (planName: string) => void;
  logFetchErrorMsg: string;
}

const LogsContainer: FunctionComponent<IProps> = ({
  isFetchingLogs,
  refreshLogs,
  planName,
  plan,
  migrations,
  logs,
  logFetchErrorMsg
}) => {
  const [cluster, setCluster] = useState({
    label: 'host',
    value: 'host'
  });
  const [podType, setPodType] = useState({
    label: null,
    value: '?'
  });
  const [podIndex, setPodIndex] = useState({
    label: null,
    value: -1
  });
  const [log, setLog] = useState('');

  useEffect(() => {
    refreshLogs(planName);
  }, []);

  const downloadLogHandle = (clusterType, podLogType, logIndex) => {
    const element = document.createElement('a');
    const podName = logs[clusterType][podLogType][logIndex].podName;
    const file = new Blob([logs[clusterType][podLogType][logIndex].log], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${clusterType}-${podName}.log`;
    document.body.appendChild(element);
    element.click();
  };

  const downloadJsonHandle = (resource: IMigPlan | IMigMigration) => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(resource, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `${resource.metadata.name}.json`;
    document.body.appendChild(element);
    element.click();
  };

  const downloadAllHandle = () => {
    downloadJsonHandle(plan);
    migrations.map(migration => {
      downloadJsonHandle(migration);
    });
    Object.keys(logs)
      .filter(clName => Object.values(ClusterKind).includes(clName))
      .map((clName) => Object.keys(logs[clName])
        .filter(pType => Object.values(LogKind).includes(pType))
        .map(logPodType => logs[clName][logPodType]
          .map((_, logPodIndex) =>
            downloadLogHandle(clName, logPodType, logPodIndex))));
  };
  if (logFetchErrorMsg) {
    return (
      <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={WarningTriangleIcon} />
        <Title headingLevel="h5" size="sm">
          Failed to fetch logs.
        </Title>
        <EmptyStateBody>
          Please try your request again.
        </EmptyStateBody>
      </EmptyState>
    );
  }
  return (
    <Card>
      <LogHeader
        logs={logs}
        isFetchingLogs={isFetchingLogs}
        cluster={cluster}
        podType={podType}
        podIndex={podIndex}
        log={log}
        setCluster={setCluster}
        setPodType={setPodType}
        setPodIndex={setPodIndex}
        setLog={setLog}
      />
      <LogBody
        isFetchingLogs={isFetchingLogs}
        log={log}
        downloadAllHandle={downloadAllHandle} />
      <LogFooter
        isFetchingLogs={isFetchingLogs}
        log={log}
        downloadHandle={() => downloadLogHandle(cluster.label, podType.label, podIndex.value)}
        cluster={cluster}
        podType={podType}
        podIndex={podIndex}
        refreshLogs={() => refreshLogs(planName)} />
    </Card>
  );
};

export default connect(
  state => ({
    plan: state.logs.logs.plan,
    logs: state.logs.logs,
    migrations: state.logs.logs.migrations,
    isFetchingLogs: state.logs.isFetchingLogs,
    logFetchErrorMsg: state.logs.logFetchErrorMsg,
  }),
  dispatch => ({
    refreshLogs: (planName) => dispatch(LogActions.logsFetchRequest(planName))
  })
)(LogsContainer);
