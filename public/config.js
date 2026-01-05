// Runtime configuration - placeholders are replaced at container startup
// This allows changing configuration without rebuilding the application
window.__RUNTIME_CONFIG__ = {
  API_BASE_URL: "__API_BASE_URL__",
  DEPLOYMENT_PREFIX_PATH: "__DEPLOYMENT_PREFIX_PATH__",
  AUTHENTICATED_PREFIX_PATH: "__AUTHENTICATED_PREFIX_PATH__"
};
