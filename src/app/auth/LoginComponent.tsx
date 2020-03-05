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
    const migMeta = this.props.migMeta;
    const routerLoc = this.props.router.location;
    const oauthMeta = this.props.auth.oauthMeta;
    if(!oauthMeta) {
      this.props.fetchOauthMeta(migMeta.clusterApi);
      return;
    }

    const freshOauthMeta = !prevProps.auth.oauthMeta && !!oauthMeta;
    const urlParams = new URLSearchParams(window.location.search);
    const shouldRefresh = urlParams.get('action') === 'refresh';
    const handleLogin = freshOauthMeta || shouldRefresh;

    if (handleLogin) {
      const clusterAuth = new ClientOAuth2({
        clientId: migMeta.oauth.clientId,
        clientSecret: migMeta.oauth.clientSecret,
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
