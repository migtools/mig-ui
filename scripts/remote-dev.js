const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const execSync = require('child_process').execSync;

const configDir = path.join(__dirname, '..', 'config');
const oauthclientFile = path.join(configDir, 'remote.oauthclient.templ.yaml');
const remoteConfigFile = path.join(configDir, 'config.dev.json');
const oauthClientTemplateFile = path.join(configDir, 'remote.oauthclient.templ.yaml')

const oauthClientName = 'mig-ui-remote-dev'

if(!fs.existsSync(remoteConfigFile)) {
  console.error(`ERROR: Remote config file ${remoteConfigFile} is missing`)
  console.error(`You could should copy the example to that location and edit with desired config`)
  process.exit(1)
}

const remoteConfig = JSON.parse(fs.readFileSync(remoteConfigFile))
const oauthRedirectUri = `http://localhost:${remoteConfig.devServerPort}/auth/callback`

// Validate Prereqs
try{
  execSync('hash oc')
} catch (error) {
  console.error(error.stdout.toString())
  process.exit(1)
}

try{
  execSync('oc whoami')
} catch (error) {
  console.error('ERROR: A problem occurred while trying to log into openshift cluster:')
  console.error('This script uses the oc cli tool, are you logged in with oc login <cluster>?')
  process.exit(1)
}

// Configure OAuthClient in remote cluster
let oauthClient = {};
try{
  console.log('Checking to see if mig-ui oauthclient exists in cluster...')
  const output = execSync(`oc get oauthclient ${oauthClientName} -o json`)
  console.log('Found existing OAuthClient object in cluster')
  oauthClient = JSON.parse(output);
} catch (error) {
  // Some error other than the client not existing occurred
  if(!error.stderr.toString().includes('not found')) {
    console.error("ERROR: Something went wrong while trying to get the remote-dev oauthclient:")
    console.error(error.stdout.toString())
    process.exit(1)
  }

  console.log('Attempting to create oauthclient for mig-ui...')

  // Client just doesn't exist yet, need to create it with a new secret
  oauthClient = {
    apiVersion: "oauth.openshift.io/v1",
    kind: "OAuthClient",
    metadata: {
      name: oauthClientName
    },
    secret: crypto.randomBytes(32).toString('base64'),
    redirectURIs: [oauthRedirectUri],
  };

  try {
    execSync(`echo '${JSON.stringify(oauthClient)}' | oc create -f-`)
  } catch(_error) {
    console.error("ERROR: Something went wrong trying to create a new OAuthClient:")
    console.error(error.stdout.toString())
    process.exit(1)
  }
}

console.log('Successfully created oauthclient for mig-ui')
console.log('Writing details to config for injection into migMeta:')
console.log(`oauthClientId: ${oauthClientName}`)
console.log(`oauthClientSecret: ${oauthClient.secret}`)

// Write oauth details to config file so it can be injected into migMeta
remoteConfig.oauthClientId = oauthClientName;
remoteConfig.oauthClientSecret = oauthClient.secret;
fs.writeFileSync(remoteConfigFile, JSON.stringify(remoteConfig, null, 2));
