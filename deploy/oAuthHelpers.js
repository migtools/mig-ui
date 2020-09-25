const { ClientCredentials, ResourceOwnerPassword, AuthorizationCode } = require('simple-oauth2');
const ClientOAuth2 = require('client-oauth2');
const axios = require('axios');

let cachedOAuthMeta = null;

const sanitizeMigMeta = (migMeta) => {
  const oauthCopy = { ...migMeta.oauth };
  delete oauthCopy.clientSecret;
  return { ...migMeta, oauth: oauthCopy };
};

const getOAuthMeta = async (migMeta) => {
  if (cachedOAuthMeta) {
    return cachedOAuthMeta;
  }
  const oAuthMetaUrl = `${migMeta.clusterApi}/.well-known/oauth-authorization-server`;
  const res = await axios.get(oAuthMetaUrl);
  cachedOAuthMeta = res.data;
  return cachedOAuthMeta;
};

// const getClusterAuth = async (migMeta) => {
//   const oAuthMeta = await getOAuthMeta(migMeta);
//   return new ClientOAuth2({
//     clientId: migMeta.oauth.clientId,
//     clientSecret: migMeta.oauth.clientSecret,
//     accessTokenUri: oAuthMeta.token_endpoint,
//     authorizationUri: oAuthMeta.authorization_endpoint,
//     redirectUri: migMeta.oauth.redirectUri,
//     scopes: [migMeta.oauth.userScope],
//   });
// };

const getClusterAuth = async (migMeta) => {
  const oAuthMeta = await getOAuthMeta(migMeta);
  return new AuthorizationCode({
    client: {
      id: migMeta.oauth.clientId,
      secret: migMeta.oauth.clientSecret,
    },
    auth: {
      tokenHost: oAuthMeta.token_endpoint,
      // tokenPath: '/oauth20_token.srf',
      authorizePath: oAuthMeta.authorization_endpoint,
    },
    // options: {
    //   authorizationMethod: 'body',
    // },
  });
};

module.exports = {
  sanitizeMigMeta,
  getClusterAuth,
};
