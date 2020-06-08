import moment from 'moment-timezone';
import { IToken } from '../../../token/duck/types';
import { StatusType } from '../../../common/components/StatusIcon';

export const getTokenInfo = (token: IToken) => {
  const expirationTimestamp = token.MigToken.status.expiresAt;
  const expirationMoment = moment(expirationTimestamp);
  const formattedExpiration = expirationMoment
    .tz(moment.tz.guess())
    .format('DD MMM YYYY, hh:mm:ss A z');
  const hoursUntilExpiration = expirationMoment.diff(moment(), 'hours', true);
  let statusType: StatusType;
  let statusText: string;
  if (hoursUntilExpiration < 0) {
    statusType = StatusType.ERROR;
    statusText = 'Expired';
  } else if (hoursUntilExpiration < 1) {
    // NATODO is 1 hour the correct threshold here?
    statusType = StatusType.WARNING;
    statusText = 'Expiring soon';
  } else {
    statusType = StatusType.OK;
    statusText = 'OK';
  }
  // NATODO not sure if these are the real paths for all of these, see comments in token/duck/types.ts
  return {
    tokenName: token.MigToken.metadata.name,
    type: token.MigToken.status.type,
    expirationTimestamp,
    formattedExpiration,
    associatedClusterName: token.MigToken.spec.migClusterRef.name,
    statusType,
    statusText,
  };
};

export type ITokenInfo = ReturnType<typeof getTokenInfo>;
