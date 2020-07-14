# OAuth and CORS

This document describes the OAuthClient based login flow and how that relates
to necessary CORS requests when the UI is deployed to a cluster.

## OAuth Login Flow:

### Prereqs

Since the UI is a full interactive OAuthClient in the OCP4 cluster, we require
an `OAuthClient` created and configured in the cluster as part of UI installation.

An example of our `OAuthClient`:

```
apiVersion: oauth.openshift.io/v1
kind: OAuthClient
metadata:
  name: mig-ui
grantMethod: auto
redirectURIs:
- https://mig-ui-mig.apps.examplecluster.com/login/callback
secret: <generated_token> # UI must also know about this value
```

Here, we've registered the mig-ui as an `OAuthClient` and informed the oauth
server our `client_id` (the name), the URL we expect to be redirected to after
successful login (where we can accept an authorization code),
and a secret token that both the UI and the OAuth server know about to confirm
the initial requester.

The way our front-end JS is informed of these shared values (in addition
to other required configuration like the API server's address), is by serializing
this data to JSON, base64 encoding it, and rendering the encoded data into
the UI's HTML template at an accessible location to the react app bundle.

### Auth Flow

The first thing that the UI does upon startup is check for the presence of
a user's OAuth token that has been persisted to a browser's local storage.
If the token is present, the login flow is skipped and the browser is routed
to the '/' path which is where the normal homepage is rendered. The oauth
token found in this persisted data is used to auth requests directly to the
host cluster. If the token is NOT present, or is deemed expired, the browser is
routed to a '/login' path where the OAuth login flow is initiated.

**To discover the various OAuth server locations, the UI AJAX requests the metadata
directly from the OCP4's API server**. This discovery endpoint is found at
a standard location:

`GET <api_server_address>/.well-known/oauth-authorization-server`

The contents of this request are described in the [OCP 4.1 docs](https://access.redhat.com/documentation/en-us/openshift_container_platform/4.1/html/authentication/configuring-internal-oauth#oauth-server-metadata_configuring-internal-oauth).

### TODO -- update this to reflect the OAuth client being in the express server now

Now given the coordinates of the cluster's OAuth server in addition to the
`client_id` and `secret`, we're able to construct an OAuth client in the front-end
and initiate an "Authorization Code Grant" flow. The gist of this is:

* The browser navigates to the `authorization_endpoint` reported in the meta
information along with our identifying client information and a requested token scope.
* Upon successful login with the OAuth server, it redirects the browser back
to the location that we registered above as the `redirectURI`, along with a
code value that can then be used to request the final OAuth token.
* When the UI loads at the requested callback location, we use the server provided
code to construct a new oauth client so we can make our final token request. **This
is an AJAX request against the OAuth server's token endpoint**
* Once this token is retrieved, it is persisted in localStorage, and the user
is redirected back to '/' with their login flow complete.

### CORS concerns

Under a real deployment scenario where the UI is served out of the cluster
behind its own route, there are 3 distinct origins at play:

* The UI - (Ex: https://mig-ui-mig.apps.examplecluster.com)
* The OAuth Server - (Ex: https://openshift-authentication-openshift-authentication.apps.examplecluster.com)
* The API Server - (Ex: https://api.examplecluster.com:6443)

When the UI is served to the browser through it's route, the browser recognizes
its origin, and **blocks AJAX requests to alternative origins**. This is called
[Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS),
and it's a deliberate browser security measure.

The full description of CORS is linked above, but without configuring the non-UI
origin servers, the requests will be blocked. To enable these requests,
the UI's origin should be whitelisted in a `corsAllowedOrigins` list for each
alternative origin. The servers should recognize this list and inspect the
origin of incoming requests. If the origin matches one of the CORS whitelisted
origins (the UI), there are a set of headers that are returned in the response
that inform the browser the CORS request is accepted and valid.

Additionally, for the same reasons described above, any requests that the UI
may make to source 3.x clusters will also have to be whitelisted by configuring
the same field in the 3.x cluster master-config.yaml. This causes the 3.x API
servers to accept the CORS requests incoming from the UI that was served out
of its OCP4 cluster's route.
