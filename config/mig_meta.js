module.exports = (clusterUrl) => {
  return {
    clusterUrl,
    oauth: {
      "issuer": clusterUrl,
      "authorization_endpoint": `${clusterUrl}/oauth/authorize`,
      "token_endpoint": `${clusterUrl}/oauth/token`,
      "scopes_supported": [
        "user:full",
        "user:info",
        "user:check-access",
        "user:list-scoped-projects",
        "user:list-projects"
      ],
      "response_types_supported": [
        "code",
        "token"
      ],
      "grant_types_supported": [
        "authorization_code",
        "implicit"
      ],
      "code_challenge_methods_supported": [
        "plain",
        "S256"
      ]
    }
  }
}
