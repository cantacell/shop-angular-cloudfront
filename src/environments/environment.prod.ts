import { Config } from './config.interface';

export const environment: Config = {
  production: true,
  apiEndpoints: {
    product: 'https://.execute-api.eu-west-1.amazonaws.com/dev',
    order: 'https://.execute-api.eu-west-1.amazonaws.com/dev',
    import: 'https://7idvptrw76.execute-api.us-east-1.amazonaws.com/dev',
    bff: 'https://hkyr142tth.execute-api.us-east-1.amazonaws.com/dev',
    cart: 'https://6xnewpv88f.execute-api.us-east-1.amazonaws.com/dev/',
  },
  apiEndpointsEnabled: {
    product: false,
    order: false,
    import: true,
    bff: true,
    cart: true,
  },
};
