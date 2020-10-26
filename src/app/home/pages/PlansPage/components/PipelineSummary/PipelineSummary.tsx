import * as React from 'react';
import { Flex, FlexItem, Text } from '@patternfly/react-core';
import {
  ResourcesAlmostEmptyIcon,
  ResourcesAlmostFullIcon,
  ResourcesFullIcon,
} from '@patternfly/react-icons';
import {
  global_danger_color_100 as dangerColor,
  global_disabled_color_200 as disabledColor,
  global_info_color_100 as infoColor,
  global_success_color_100 as successColor,
} from '@patternfly/react-tokens';

import { findCurrentStep, getPipelineSummaryTitle } from '../../helpers';
import { IMigrationStatus } from '../../../../../plan/duck/types';
const classNames = require('classnames');
const styles = require('./PipelineSummary.module');

interface IDashProps {
  isReached: boolean;
}
const dashReachedStyles = classNames(styles.dash, styles.dashReached);
const dashNotReachedStyles = classNames(styles.dash, styles.dashNotReached);

const Dash: React.FunctionComponent<IDashProps> = ({ isReached }: IDashProps) => {
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
  color: {
    name: string;
    value: string;
    var: string;
  };
}

const Chain: React.FunctionComponent<IChainProps> = ({ Face, times, color }: IChainProps) => {
  return times < 1 ? null : (
    <>
      <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
        <Face color={color.value} />
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
  status: IMigrationStatus;
}

const PipelineSummary: React.FunctionComponent<IPipelineSummaryProps> = ({
  status,
}: IPipelineSummaryProps) => {
  if (!status || !status?.pipeline) {
    return null;
  }
  const title = getPipelineSummaryTitle(status);
  const { currentStep, currentStepIndex } = findCurrentStep(status?.pipeline || []);
  if (status?.phase === 'Completed') {
    return (
      <Summary title={title}>
        <Chain Face={ResourcesFullIcon} times={status.pipeline.length} color={successColor} />
      </Summary>
    );
  } else if (currentStep?.started && !currentStep?.completed) {
    return (
      <Summary title={title}>
        <Chain Face={ResourcesFullIcon} times={currentStepIndex} color={successColor} />
        {currentStepIndex > 0 ? <Dash isReached={true} /> : null}
        <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
          <ResourcesAlmostFullIcon
            color={status?.errors?.length ? dangerColor.value : infoColor.value}
          />
        </FlexItem>
        {currentStepIndex < status?.pipeline?.length - 1 ? (
          <>
            <Dash isReached={false} />
            <Chain
              Face={ResourcesAlmostEmptyIcon}
              times={status?.pipeline?.length - currentStepIndex - 1}
              color={disabledColor}
            />
          </>
        ) : null}
      </Summary>
    );
  } else {
    return (
      <Summary title={title}>
        <Chain
          Face={ResourcesAlmostEmptyIcon}
          times={status?.pipeline?.length}
          color={disabledColor}
        />
      </Summary>
    );
  }
};

export default PipelineSummary;
