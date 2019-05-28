import React from 'react';
import { connect } from 'react-redux';
import { authOperations } from './duck';
import ClientOAuth2 from 'client-oauth2';

interface IProps {
  migMeta: any;
  auth: any;
  router: any;
  fetchOauthMeta: (string) => void;
  fetchToken: (any, string) => void;
}

class LoginComponent extends React.Component<IProps> {
  componentDidMount = () => {
    const oauthMeta = this.props.auth.oauthMeta;
    const migMeta = this.props.migMeta;

    if (!oauthMeta) {
      this.props.fetchOauthMeta(migMeta.clusterApi);
      return;
    }
  };

  componentDidUpdate = prevProps => {
    const oauthMeta = this.props.auth.oauthMeta;
    const migMeta = this.props.migMeta;
    const routerLoc = this.props.router.location;

    const freshOauthMeta = !prevProps.auth.oauthMeta && !!oauthMeta;
    if (freshOauthMeta) {
      ////////////////////////////////////////////////////////////
      // TODO: Currently using an empty secret value here since we
      // are strictly a public client
      // The correct thing to do here is to implement PKCE, which is
      // what oc uses and what is specfically implemented for public
      // clients: https://tools.ietf.org/html/rfc7636
      // For now, using a temporarily hardcoded secret until PKCE can be
      // implemented. (migrations.openshift.io | base64)
      //
      const loginSecret = 'bWlncmF0aW9ucy5vcGVuc2hpZnQuaW8K';
      ////////////////////////////////////////////////////////////

      const clusterAuth = new ClientOAuth2({
        clientId: migMeta.oauth.clientId,
        clientSecret: loginSecret, // See note above
        accessTokenUri: oauthMeta.token_endpoint,
        authorizationUri: oauthMeta.authorization_endpoint,
        redirectUri: migMeta.oauth.redirectUri,
        scopes: [migMeta.oauth.userScope],
      });

      switch (routerLoc.pathname) {
        case '/login': {
          const uri = clusterAuth.code.getUri();
          window.location.replace(uri);
          break;
        }
        case '/login/callback': {
          this.props.fetchToken(clusterAuth, window.location.href);
          break;
        }
        default: {
          return;
        }
      }
    }
  };

  render() {
    return <div />;
  }
}

export default connect(
  state => ({
    migMeta: state.migMeta,
    auth: state.auth,
    router: state.router,
  }),
  dispatch => ({
    fetchOauthMeta: clusterApi => dispatch(authOperations.fetchOauthMeta(clusterApi)),
    fetchToken: (oauthClient, codeRedirect) =>
      dispatch(authOperations.fetchToken(oauthClient, codeRedirect)),
  })
)(LoginComponent);
