import React from 'react';
import { connect } from 'react-redux';
import { authOperations } from './duck';
import './LoginComponent.css';
import ClientOAuth2 from 'client-oauth2';

import openShiftLogo from '../../assets/OpenShiftLogo.svg';

interface IProps {
  migMeta: any;
  auth: any;
  router: any;
  fetchOauthMeta: (string) => void;
}

class LoginComponent extends React.Component<IProps> {
  componentDidMount = () => {
    const oauthMeta = this.props.auth.oauthMeta;
    const migMeta = this.props.migMeta;

    if (!oauthMeta) {
      this.props.fetchOauthMeta(migMeta.clusterApi);
      return;
    }
  }

  componentDidUpdate = (prevProps) => {
    const oauthMeta = this.props.auth.oauthMeta;
    const migMeta = this.props.migMeta;
    const routerLoc = this.props.router.location;

    const freshOauthMeta = !prevProps.oauthMeta && !!oauthMeta;
    if (freshOauthMeta) {
      ////////////////////////////////////////////////////////////
      // TODO: Currently using an empty secret value here since we
      // are strictly a public client
      // The correct thing to do here is to implement PKCE, which is
      // what oc uses and what is specfically implemented for public
      // clients: https://tools.ietf.org/html/rfc7636
      ////////////////////////////////////////////////////////////
      const clusterAuth = new ClientOAuth2({
        clientId: migMeta.oauth.clientId,
        clientSecret: '', // See note above
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
          const params = new URLSearchParams(routerLoc.search);
          const code = params.get('code');
          clusterAuth.code.getToken(window.location.href)
            .then(result => {
              console.debug('hit the good branch: ', result);
            }).catch(err => {
              console.debug('bad things happened trying to do this: ', err);
            });
          break;
        }
        default: {
          return;
        }
      }
    }
  }

  render() {
    return (
      <div className="login-container">
        <div className="social">
          <h4 className="connect-label">Connect with</h4>
          <div className="social-links">
            <div className="social-link">
              <img
                className="openshift-logo"
                src={openShiftLogo}
                alt="Logo"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    migMeta: state.migMeta,
    auth: state.auth,
    router: state.router,
  }),
  dispatch => ({
    fetchOauthMeta: (clusterApi) => dispatch(authOperations.fetchOauthMeta(clusterApi)),
  }),
)(LoginComponent);
