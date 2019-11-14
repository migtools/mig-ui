/** @jsx jsx */
import { jsx } from '@emotion/core';
import StatusIcon from '../../../../common/components/StatusIcon';
import styled from '@emotion/styled';

const CardStatusComponent = ({ type, dataList, ...props }) => {
  let successList = [];
  let failureList = [];
  let successfulNames = [];

  if (type === 'repositories') {
    successList = dataList.filter(item =>
      item.MigStorage.status && item.MigStorage.status.conditions.filter(c => c.type === 'Ready').length !== 0
    );
    successfulNames = successList.map(item => item.MigStorage.metadata.name);
    failureList = dataList.filter(item => !successfulNames.includes(item.MigStorage.metadata.name));
  } else if (type === 'clusters') {
    successList = dataList.filter(item =>
      item.MigCluster.status && item.MigCluster.status.conditions.filter(c => c.type === 'Ready').length !== 0
    );
    successfulNames = successList.map(item => item.MigCluster.metadata.name);
    failureList = dataList.filter(item => !successfulNames.includes(item.MigCluster.metadata.name));
  }

  return (
    <dl className="pf-c-widget-description-list pf-m-inline">
      <dt>
        <span className="pf-c-widget-description-list__icon">
          {successList.length > 0 ?
            <StatusIcon isReady={true} /> :
            <StatusIcon
              isReady={true}
              isDisabled={true}
            />
          }
        </span>
        <span className={successList.length > 0 ?
          'pf-c-widget-description-list__num' :
          'pf-c-widget-description-list__num disabled'}>
          {successList.length}
        </span>
      </dt>
      <dd className={successList.length > 0 ? '' : 'disabled'}>
        Connected
      </dd>
      <dt>
        <span className="pf-c-widget-description-list__icon">
          {failureList.length > 0 ?
            <StatusIcon isReady={false} /> :
            <StatusIcon
              isReady={false}
              isDisabled={true}
            />
          }
        </span>
        <span className={failureList.length > 0 ?
          'pf-c-widget-description-list__num' :
          'pf-c-widget-description-list__num disabled'}>
          {failureList.length}
        </span>

      </dt>
      <dd className={failureList.length > 0 ? '' : 'disabled'}>
        Connection failed
      </dd>

    </dl>
  );
};

export default CardStatusComponent;