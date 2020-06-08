import moment from 'moment-timezone';
import { IToken } from '../../../token/duck/types';

export const getTokenInfo = (token: IToken) => {
  // NATODO not sure if these are the real paths for all of these, see comments in token/duck/types.ts
  const expirationTimestamp = token.MigToken.metadata.expirationTimestamp;
  const formattedExpiration = moment(expirationTimestamp)
    .tz(moment.tz.guess())
    .format('DD MMM YYYY, hh:mm:ss A z');
  return {
    tokenName: token.MigToken.metadata.name,
    type: token.MigToken.metadata.type,
    expirationTimestamp,
    formattedExpiration,
    associatedClusterName: token.MigToken.spec.migClusterRef.name,
    tokenStatus: !token.MigToken.status
      ? null
      : token.MigToken.status.conditions.filter((c) => c.type === 'Ready').length > 0,
  };
};
