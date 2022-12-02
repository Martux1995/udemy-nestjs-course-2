import * as Joi from 'joi'

export const EnvValidationSchema = Joi.object({
  MONGODB: Joi.required(),
  APP_PORT: Joi.number().default(3004),
  FIND_LIMIT: Joi.number().default(8)
})