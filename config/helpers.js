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
  const migMeta = require('./mig_meta')(localConfig.clusterApi); // TODO What does this do? just create a new object? can we just use a literal?
  migMeta.oauth = {
    clientId: localConfig.oauthClientId,
    redirectUri: localConfig.redirectUri,
    userScope: localConfig.userScope,
    clientSecret: startRemoteClientSecret,
  };
  migMeta.namespace = localConfig.namespace;
  migMeta.configNamespace = localConfig.configNamespace;
  migMeta.discoveryApi = localConfig.discoveryApi;
  migMeta.hookRunnerImage = localConfig.hookRunnerImage;
  return { localConfig, migMeta };
};

module.exports = { getLocalConfig };
