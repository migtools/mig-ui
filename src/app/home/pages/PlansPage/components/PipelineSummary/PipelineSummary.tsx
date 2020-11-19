import * as React from 'react';

import { Flex, FlexItem, Text } from '@patternfly/react-core';
import ResourcesFullIcon from '@patternfly/react-icons/dist/js/icons/resources-full-icon';
import ResourcesAlmostFullIcon from '@patternfly/react-icons/dist/js/icons/resources-almost-full-icon';

import { getPipelineSummaryTitle } from '../../helpers';
import { IMigration } from '../../../../../plan/duck/types';
const classNames = require('classnames');
const styles = require('./PipelineSummary.module');

interface IDashProps {
  isReached: boolean;
  isWarning?: boolean;
}
const dangerColor = '#c9190b';
const disabledColor = '#d2d2d2';
const successColor = '#3e8635';

const dashReachedStyles = classNames(styles.dash, styles.dashReached);
const dashNotReachedStyles = classNames(styles.dash, styles.dashNotReached);

const Dash: React.FunctionComponent<IDashProps> = ({ isReached, isWarning }: IDashProps) => {
  return (
    <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
      {isReached ? <div className={dashReachedStyles} /> : <div className={dashNotReachedStyles} />}
    </FlexItem>
  );
};

interface IChainProps {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  Face: React.ComponentClass<any>;
  times: number;
  color: string;
}

const Chain: React.FunctionComponent<IChainProps> = ({ Face, times, color }: IChainProps) => {
  return times < 1 ? null : (
    <>
      <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
        <Face color={color} />
      </FlexItem>
      {times > 1 ? (
        <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
          {color === disabledColor ? <Dash isReached={false} /> : <Dash isReached={true} />}
        </FlexItem>
      ) : null}
      <Chain Face={Face} times={times - 1} color={color} />
    </>
  );
};

interface ISummaryProps {
  title: string;
  children: React.ReactNode;
}

const Summary: React.FunctionComponent<ISummaryProps> = ({ title, children }: ISummaryProps) => (
  <Flex direction={{ default: 'column' }}>
    <FlexItem>
      <Text component="small">{title}</Text>
      <Flex
        spaceItems={{ default: 'spaceItemsNone' }}
        alignContent={{ default: 'alignContentCenter' }}
        flexWrap={{ default: 'nowrap' }}
      >
        {children}
      </Flex>
    </FlexItem>
  </Flex>
);

interface IPipelineSummaryProps {
  migration: IMigration;
}

const PipelineSummary: React.FunctionComponent<IPipelineSummaryProps> = ({
  migration,
}: IPipelineSummaryProps) => {
  const { status, tableStatus } = migration;
  if (!status || !status?.pipeline) {
    return null;
  }
  const title = getPipelineSummaryTitle(migration);
  return (
    <>
      <Summary title={title}>
        {status?.pipeline.map((step, index) => {
          return (
            <>
              {index != 0 ? <Dash key={step.name} isReached={step?.started ? true : false} /> : ''}
              {!step?.started ? (
                <Chain key={index} Face={ResourcesFullIcon} times={1} color={disabledColor} />
              ) : step?.failed || step?.isError ? (
                <Chain key={index} Face={ResourcesFullIcon} times={1} color={dangerColor} />
              ) : step?.started && !step?.completed ? (
                <Chain key={index} Face={ResourcesAlmostFullIcon} times={1} color={successColor} />
              ) : (
                <Chain key={index} Face={ResourcesFullIcon} times={1} color={successColor} />
              )}
            </>
          );
        })}
      </Summary>
    </>
  );
};

export default PipelineSummary;
