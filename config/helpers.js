const path = require('path');
const fs = require('fs');

const localConfigFileName = 'config.dev.json';
const startRemoteClientSecret = 'bWlncmF0aW9ucy5vcGVuc2hpZnQuaW8K';

const getLocalConfig = () => {
  const configPath = path.join(__dirname, localConfigFileName);
  if (!fs.existsSync(configPath)) {
    console.error('ERROR: config/config.dev.json is missing');
    console.error(
      'Copy config/config.dev.json.example to config/config.dev.json' +
        ' and optionally configure your dev settings. A valid clusterUrl is ' +
        ' required for start:remote.'
    );
    process.exit(1);
  }
  const localConfig = require(configPath);
  const migMeta = {
    clusterApi: localConfig.clusterApi,
    oauth: {
      clientId: localConfig.oauthClientId,
      redirectUri: localConfig.redirectUri,
      userScope: localConfig.userScope,
      clientSecret: startRemoteClientSecret,
    },
    namespace: localConfig.namespace,
    configNamespace: localConfig.configNamespace,
    discoveryApi: localConfig.discoveryApi,
    hookRunnerImage: localConfig.hookRunnerImage,
  };
  return { localConfig, migMeta };
};

module.exports = { getLocalConfig };
