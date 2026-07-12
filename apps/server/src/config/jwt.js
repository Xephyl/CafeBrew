import { config } from './index.js'

export const jwtConfig = {
  accessSecret: config.JWT_ACCESS_SECRET,
  refreshSecret: config.JWT_REFRESH_SECRET,
  accessExpiresIn: '15m',
  refreshExpiresIn: '7d',
}
