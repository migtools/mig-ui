const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const execSync = require('child_process').execSync;

// Init some consts
const configDir = path.join(__dirname, '..', 'config');
const oauthclientFile = path.join(configDir, 'remote.oauthclient.templ.yaml');
const remoteConfigFile = path.join(configDir, 'config.dev.json');
const oauthClientTemplateFile = path.join(configDir, 'remote.oauthclient.templ.yaml')

// Validations
if (!fs.existsSync(remoteConfigFile)) {
  console.error(`ERROR: Remote config file ${remoteConfigFile} is missing`)
  console.error(`You could should copy the example to that location and edit with desired config`)
  process.exit(1)
}

try {
  execSync('hash oc')
} catch (error) {
  console.error(error.stdout.toString())
  process.exit(1)
}

try {
  execSync('oc whoami')
} catch (error) {
  console.error('ERROR: A problem occurred while trying to log into openshift cluster:')
  console.error('This script uses the oc cli tool, are you logged in with oc login <cluster>?')
  process.exit(1)
}

// Helpers

function setupOAuthClient() {
  const remoteConfig = JSON.parse(fs.readFileSync(remoteConfigFile))
  const oauthRedirectUri = `http://localhost:${remoteConfig.devServerPort}/login/callback`

  const oauthClientName = 'mig-ui';
  const remoteDevSecret = 'bWlncmF0aW9ucy5vcGVuc2hpZnQuaW8K';

  try {
    console.log('Checking to see if mig-ui oauthclient exists in cluster...')
    execSync(`oc get oauthclient ${oauthClientName} -o json`)
    console.log('Found existing OAuthClient object in cluster')
    console.log('Deleting existing OAuthClient so it can be reset')
    execSync(`oc delete oauthclient ${oauthClientName}`)
  } catch (error) {
    // Some error other than the client not existing occurred
    if (!error.stderr.toString().includes('not found')) {
      console.error("ERROR: Something went wrong while trying to get the remote-dev oauthclient:")
      console.error(error.stdout.toString())
      process.exit(1)
    }
  }

  console.log('Attempting to create oauthclient for mig-ui...')
  // NOTE: Not providing a secret since we are a public client, defined
  // as one *without* a secret. Will implement PKCE.
  const oauthClient = {
    apiVersion: "oauth.openshift.io/v1",
    kind: "OAuthClient",
    metadata: {
      name: oauthClientName
    },
    grantMethod: 'auto', // consider 'prompt'?
    redirectURIs: [oauthRedirectUri],
    secret: remoteDevSecret,
  };

  // Configure OAuthClient in remote cluster
  try {
    execSync(`echo '${JSON.stringify(oauthClient)}' | oc create -f-`)
  } catch (error) {
    console.error("ERROR: Something went wrong trying to create a new OAuthClient:");
    console.error(error.stdout.toString());
    process.exit(1);
  }
}

function setupCors() {
  if (!process.env.ORIGIN3_HOST && process.env.DEPRECATED_CORS === 'true') {
    try {
      console.log('Patching in CORS support to the auth server')
      const patch = {
        spec: {
          unsupportedConfigOverrides: {
            corsAllowedOrigins: [
              '//127\.0\.0\.1(:|$)',
              '//localhost(:|$)',
            ]
          }
        }
      };

      execSync(`oc patch authentication.operator cluster -p '${JSON.stringify(patch)}' --type=merge`);
    } catch (error) {
      console.error("ERROR: Something went wrong while trying to patch in CORS support to the auth server");
      console.error(error.stdout.toString());
      process.exit(1);
    }
  } else {
    console.log('Skipping deprecated CORS config')
  }
}

// Main

function main() {
  setupOAuthClient();
  setupCors();
}

main();
