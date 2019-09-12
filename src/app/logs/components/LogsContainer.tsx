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
import JSZip from 'jszip';
import { WarningTriangleIcon } from '@patternfly/react-icons';
import { PollingContext } from '../../home/duck/context';

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
  const pollingContext = useContext(PollingContext);

  useEffect(() => {
    refreshLogs(planName);
    pollingContext.stopAllPolling();
  }, []);

  const downloadLogHandle = (clusterType, podLogType, logIndex) => {
    const archive = new JSZip();
    includeLog(archive, clusterType, podLogType, logIndex);
    downloadArchive(`${clusterType}-${podLogType}`, archive);
  };

  const includeLog = (archive, clusterType, podLogType, logIndex) => {
    const podName = logs[clusterType][podLogType][logIndex].podName;
    const name = `${clusterType}/${podName}.log`;
    archive.file(name, logs[clusterType][podLogType][logIndex].log);
  };

  const downloadArchive = async (name, data) => {
    const element = document.createElement('a');
    const content = await data.generateAsync({ type: 'blob' });
    const file = new Blob([content], { type: 'application/zip' });
    element.href = URL.createObjectURL(file);
    element.download = `${name}.zip`;
    document.body.appendChild(element);
    element.click();
  };

  const downloadAllHandle = () => {
    const archive = new JSZip();
    archive.file(`plan/${plan.metadata.name}.json`, JSON.stringify(plan, null, 2));
    migrations.map(
      mig => archive.file(`migrations/${mig.metadata.name}.json`, JSON.stringify(mig, null, 2)));
    Object.keys(logs)
      .filter(clName => Object.values(ClusterKind).includes(clName))
      .map((clName) => Object.keys(logs[clName])
        .filter(pType => Object.values(LogKind).includes(pType))
        .map(logPodType => logs[clName][logPodType]
          .map((_, logPodIndex) =>
            includeLog(archive, clName, logPodType, logPodIndex))));
    downloadArchive(`${plan.metadata.name}`, archive);
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
