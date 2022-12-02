export const EnvConfiguration = () => ({
  environment: process.env.NODE_ENV || 'development',
  port: process.env.APP_PORT || 3000,
  mongodb: process.env.MONGODB,
  findLimit: process.env.FIND_LIMIT || 5
});