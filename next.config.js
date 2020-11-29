require('dotenv').config();

module.exports = {
  env: {
    API_URL: process.env.API_URL,
    STRAPI_API_URL: process.env.STRAPI_API_URL,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};
