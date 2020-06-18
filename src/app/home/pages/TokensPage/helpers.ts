import moment from 'moment-timezone';
import { IToken } from '../../../token/duck/types';
import { StatusType } from '../../../common/components/StatusIcon';

const EXPIRATION_WARNING_THRESHOLD_HOURS = 1;

export const getTokenInfo = (token: IToken) => {
  const retTokenInfo = {
    tokenName: token.MigToken.metadata.name,
    associatedClusterName: token.MigToken.spec.migClusterRef.name,
    type: 'Loading...',
    expirationTimestamp: 'Loading...',
    formattedExpiration: 'Loading...',
    statusType: StatusType.OK,
    statusText: 'Loading...',
  };

  if (token.MigToken.status) {
    const expirationTimestamp = token.MigToken.status.expiresAt;
    const expirationMoment = expirationTimestamp && moment(expirationTimestamp);
    const formattedExpiration = expirationMoment
      ? expirationMoment.tz(moment.tz.guess()).format('DD MMM YYYY, hh:mm:ss A z')
      : 'Never';
    let statusType = StatusType.OK;
    let statusText = 'OK';
    if (expirationMoment) {
      const hoursUntilExpiration = expirationMoment.diff(moment(), 'hours', true);
      if (hoursUntilExpiration < 0) {
        statusType = StatusType.ERROR;
        statusText = 'Expired';
      } else if (hoursUntilExpiration < EXPIRATION_WARNING_THRESHOLD_HOURS) {
        statusType = StatusType.WARNING;
        statusText = 'Expiring soon';
      }
    }

    retTokenInfo.expirationTimestamp = expirationTimestamp;
    retTokenInfo.formattedExpiration = formattedExpiration;
    retTokenInfo.type = token.MigToken.status.type;
    retTokenInfo.statusType = statusType;
    retTokenInfo.statusText = statusText;
  }

  return retTokenInfo;
};

export type ITokenInfo = ReturnType<typeof getTokenInfo>;
