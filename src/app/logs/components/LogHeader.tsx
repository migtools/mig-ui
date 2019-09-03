/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, FunctionComponent } from 'react';
import { Box, Flex, Text } from '@rebass/emotion';
import { css } from '@emotion/core';
import Select from 'react-select';
import ReactJson from 'react-json-view';
import {
  Modal,
  Button,
  Popover,
  PopoverPosition,
  EmptyStateVariant,
  EmptyState,
  EmptyStateIcon,
  Title,
  EmptyStateBody,
  TextArea,
  CardHeader
} from '@patternfly/react-core';
import { IMigrationLogs, ClusterKind, LogKind, ILog, IMigrationClusterLog } from '../duck/sagas';
import { WarningTriangleIcon, BlueprintIcon } from '@patternfly/react-icons';
import { IMigMigration, IMigPlan } from '../../../client/resources/conversions';

interface ISelectItem {
  label: any;
  value: any;
}

interface IProps {
  isFetchingLogs: boolean;
  logs: IMigrationLogs;
  log: string;
  cluster: ISelectItem;
  podType: ISelectItem;
  podIndex: ISelectItem;
  setCluster: (itemISelectItem) => void;
  setPodType: (itemISelectItem) => void;
  setPodIndex: (itemISelectItem) => void;
  setLog: (string) => void;
}

const LogHeader: FunctionComponent<IProps> = ({
  isFetchingLogs,
  logs,
  log,
  cluster,
  podType,
  podIndex,
  setCluster,
  setPodType,
  setPodIndex,
  setLog
}) => {
  const plan: IMigPlan = logs.plan;
  const migrations: IMigMigration[] = logs.migrations;

  const clusters = Object.keys(logs)
    .filter(cl => Object.values(ClusterKind).includes(cl))
    .map(cl => {
      return {
        label: cl,
        value: cl,
      };
    });

  const logSources = logs[cluster.value] ? Object.keys(logs[cluster.value])
    .filter(ls => Object.values(LogKind).includes(ls))
    .map(ls => {
      return {
        label: ls,
        value: ls,
      };
    }) : [];

  const pods = logs[cluster.value] && logs[cluster.value][podType.value] ?
    Object.values(logs[cluster.value][podType.value])
      .map((pod: ILog, index) => {
        return {
          label: pod.podName,
          value: index,
        };
      }) : [];

  return (<span>
    {isFetchingLogs ? null : (
      <CardHeader style={{ height: '10%' }}>
        <Flex>
          <Box mx="3em" width={2 / 7} flex="auto">
            <Text>Select Cluster</Text>
            <Select
              name="selectCluster"
              value={cluster}
              onChange={clusterSelected => {
                setCluster(clusterSelected);
                setPodType({
                  label: null,
                  value: '?'
                });
                setPodIndex({
                  label: null,
                  value: -1
                });
                setLog('');
              }}
              options={clusters}
            />
          </Box>
          <Box mx="3em" width={2 / 7} flex="auto">
            <Text>Select Log Source</Text>
            <Select
              name="selectLogSource"
              value={podType}
              onChange={logSourceSelected => {
                setPodType(logSourceSelected);
                setPodIndex({
                  label: null,
                  value: -1
                });
                setLog('');
              }}
              options={logSources}
            />
          </Box>
          <Box mx="3em" width={2 / 7} flex="auto">
            <Text>Select Pod Source</Text>
            <Select
              name="selectPod"
              value={podIndex}
              onChange={pod => {
                setPodIndex(pod);
                setLog(logs[cluster.value][podType.value][0].log);
              }}
              options={pods}
            />
          </Box>
          <Box flex="auto" width={1 / 7}>
            <Flex css={css`
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                `}>
              <Box height={1 / 2}>
                <Popover
                  css={css`
                        overflow-y: scroll;
                        max-height: 40rem;
                        width: 80rem;
                      `}
                  position={PopoverPosition.bottom}
                  bodyContent={
                    <Fragment>
                      <ReactJson src={plan} enableClipboard={false} />
                    </Fragment>
                  }
                  aria-label="pv-details"
                  closeBtnAriaLabel="close-pv-details"
                  maxWidth="200rem"
                >
                  <Button isDisabled={isFetchingLogs} variant="link" icon={<BlueprintIcon />}>
                    View Plan
                    </Button>
                </Popover>
              </Box>
              <Box height={1 / 2}>
                <Popover
                  css={css`
                        overflow-y: scroll;
                        max-height: 40rem;
                        width: 80rem;
                      `}
                  position={PopoverPosition.bottom}
                  bodyContent={
                    <Fragment>
                      {(migrations && migrations.length) ?
                        <ReactJson src={migrations} enableClipboard={false} />
                        :
                        <EmptyState variant={EmptyStateVariant.small}>
                          <EmptyStateIcon icon={WarningTriangleIcon} />
                          <Title headingLevel="h5" size="sm">
                            No Migrations found
                            </Title>
                          <EmptyStateBody>
                            Nothing to display
                            </EmptyStateBody>
                        </EmptyState>
                      }
                    </Fragment>
                  }
                  aria-label="pv-details"
                  closeBtnAriaLabel="close-pv-details"
                  maxWidth="200rem"
                >
                  <Button isDisabled={isFetchingLogs} variant="link" icon={<BlueprintIcon />}>
                    View Migrations
                    </Button>
                </Popover>
              </Box>
            </Flex>
          </Box>
        </Flex>
      </CardHeader>)
    }
  </span>);
};

export default LogHeader;
