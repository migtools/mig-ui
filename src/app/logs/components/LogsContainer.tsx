/** @jsx jsx */
import { jsx } from '@emotion/core';
import {
  useEffect,
  useContext,
  useState,
  FunctionComponent
} from 'react';
import { connect } from 'react-redux';
import { } from '../duck/sagas';
import { IPlanLogSources } from '../../../client/resources/convension';
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
  report: IPlanLogSources;
  log: string[];
  requestLog: (logPath: string) => void;
  requestReport: (planName: string) => void;
  logFetchErrorMsg: string;
}

const LogsContainer: FunctionComponent<IProps> = ({
  log,
  isFetchingLogs,
  requestLog,
  requestReport,
  planName,
  report,
  logFetchErrorMsg
}) => {
  const [cluster, setCluster] = useState({
    label: 'controller',
    value: 'controller'
  });
  const [podIndex, setPodIndex] = useState({
    label: null,
    value: -1
  });
  const pollingContext = useContext(PollingContext);

  useEffect(() => {
    requestReport(planName);
    pollingContext.stopAllPolling();
  }, []);

  // const downloadLogHandle = (clusterType, podLogType, logIndex) => {
  //   const archive = new JSZip();
  //   includeLog(archive, clusterType, podLogType, logIndex);
  //   downloadArchive(`${clusterType}-${podLogType}`, archive);
  // };

  // const includeLog = (archive, clusterType, podLogType, logIndex) => {
  //   const podName = logs[clusterType][podLogType][logIndex].podName;
  //   const name = `${clusterType}/${podName}.log`;
  //   archive.file(name, logs[clusterType][podLogType][logIndex].log);
  // };

  // const downloadArchive = async (name, data) => {
  //   const element = document.createElement('a');
  //   const content = await data.generateAsync({ type: 'blob' });
  //   const file = new Blob([content], { type: 'application/zip' });
  //   element.href = URL.createObjectURL(file);
  //   element.download = `${name}.zip`;
  //   document.body.appendChild(element);
  //   element.click();
  // };

  // const downloadAllHandle = () => {
  //   const archive = new JSZip();
  //   archive.file(`plan/${plan.metadata.name}.json`, JSON.stringify(plan, null, 2));
  //   migrations.map(
  //     mig => archive.file(`migrations/${mig.metadata.name}.json`, JSON.stringify(mig, null, 2)));
  //   Object.keys(logs)
  //     .filter(clName => Object.values(ClusterKind).includes(clName))
  //     .map((clName) => Object.keys(logs[clName])
  //       .filter(pType => Object.values(LogKind).includes(pType))
  //       .map(logPodType => logs[clName][logPodType]
  //         .map((_, logPodIndex) =>
  //           includeLog(archive, clName, logPodType, logPodIndex))));
  //   downloadArchive(`${plan.metadata.name}`, archive);
  // };

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
        report={report}
        isFetchingLogs={isFetchingLogs}
        cluster={cluster}
        podIndex={podIndex}
        setCluster={setCluster}
        setPodIndex={setPodIndex}
        requestLog={requestLog}
      />
      <LogBody
        isFetchingLogs={isFetchingLogs}
        log={log}
        downloadAllHandle={() => null} />
      <LogFooter
        isFetchingLogs={isFetchingLogs}
        log={log}
        // downloadHandle={() => downloadLogHandle(cluster.label, podType.label, podIndex.value)}
        downloadHandle={() => null}
        requestReport={requestReport} />
    </Card>
  );
};

export default connect(
  state => ({
    report: state.logs.report,
    log: state.logs.log,
    isFetchingLogs: state.logs.isFetchingLogs,
    logFetchErrorMsg: state.logs.logFetchErrorMsg,
  }),
  dispatch => ({
    requestLog: (logPath) => dispatch(LogActions.logsFetchRequest(logPath)),
    requestReport: (planName) => dispatch(LogActions.reportFetchRequest(planName))
  })
)(LogsContainer);
