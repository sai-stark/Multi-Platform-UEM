import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  // Ensure deployment prefix path has trailing slash for Vite's base option
  let deploymentPrefix = env.VITE_DEPLOYMENT_PREFIX_PATH || "/wp/";
  if (!deploymentPrefix.endsWith('/')) {
    deploymentPrefix += '/';
  }

  return {
    base: deploymentPrefix,
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Make VITE_ prefixed env vars available to the app
    define: {
      'import.meta.env.VITE_DEPLOYMENT_PREFIX_PATH': JSON.stringify(env.VITE_DEPLOYMENT_PREFIX_PATH),
      'import.meta.env.VITE_AUTHENTICATED_PREFIX_PATH': JSON.stringify(env.VITE_AUTHENTICATED_PREFIX_PATH),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
    },
  };
});
