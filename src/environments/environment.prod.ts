export const environment = {
  production: true,
  apiUrl: '/api',
  keycloak: {
    url: '${KEYCLOAK_URL}',
    realm: 'sistemas',
    clientId: '${KEYCLOAK_CLIENT_ID}'
  }
};
