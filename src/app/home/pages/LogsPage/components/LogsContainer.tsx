import React, { useEffect, useContext, useState, FunctionComponent } from 'react';
import { connect } from 'react-redux';
import LogHeader from './LogHeader';
import LogBody from './LogBody';
import LogFooter from './LogFooter';
import { LogActions } from '../../../../logs/duck';
import {
  Card,
  EmptyStateVariant,
  EmptyState,
  EmptyStateIcon,
  Title,
  EmptyStateBody,
} from '@patternfly/react-core';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { usePausedPollingEffect } from '../../../../common/context/PollingContext';

interface IProps {
  planName: string;
  archive: string;
  requestReport: (planName: string) => void;
  logErrorMsg: string;
}
export interface ILogSource {
  podIndex: number;
  containerIndex: number;
}

export const LogUnselected = -1;

const LogsContainer: FunctionComponent<IProps> = ({
  requestReport,
  planName,
  archive,
  logErrorMsg,
}) => {
  const [cluster, setCluster] = useState({
    label: 'controller',
    value: 'controller',
  });
  const [logSource, setLogSource] = useState({
    label: null,
    value: {
      podIndex: LogUnselected,
      containerIndex: LogUnselected,
    },
  });

  const [downloadLink, setDownloadLink] = useState(null);

  useEffect(() => {
    requestReport(planName);
  }, []);

  const downloadArchive = async (element) => {
    document.body.appendChild(element);
    element.click();
    setDownloadLink(null);
  };

  // TODO: utilize dedicated solution for archive download
  useEffect(() => {
    if (archive) {
      const element = document.createElement('a');
      element.href = archive;
      element.download = 'logs.zip';
      setDownloadLink(element);
    }
  }, [archive]);

  useEffect(() => {
    if (downloadLink) {
      downloadArchive(downloadLink);
    }
  }, [downloadLink]);

  usePausedPollingEffect();

  if (logErrorMsg) {
    return (
      <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={ExclamationTriangleIcon} />
        <Title headingLevel="h5" size="lg">
          Failed to fetch logs.
        </Title>
        <EmptyStateBody>Please try your request again.</EmptyStateBody>
      </EmptyState>
    );
  }
  return (
    <Card>
      <LogHeader
        cluster={cluster}
        logSource={logSource}
        setCluster={setCluster}
        setLogSource={setLogSource}
      />
      <LogBody />
      <LogFooter cluster={cluster.value} logSource={logSource.value} planName={planName} />
    </Card>
  );
};

export default connect(
  (state) => ({
    logErrorMsg: state.logs.logErrorMsg,
    archive: state.logs.archive,
  }),
  (dispatch) => ({
    requestReport: (planName) => dispatch(LogActions.reportFetchRequest(planName)),
  })
)(LogsContainer);
