import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

// check to make sure environment variables are loaded
if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
  throw new Error("Missing Plaid Environment Variables: PLAID_CLIENT_ID or PLAID_SECRET");
}

// the default environment is production so we use 'sandbox' if PLAID_ENV is not present
const plaidEnv = process.env.PLAID_ENV || 'sandbox';

// configuration contains the information the PlaidApi client needs to communicate with Plaid
const configuration = new Configuration({
  // gives the sandbox api endpoint
  basePath: PlaidEnvironments[plaidEnv] || PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
      'Plaid-Version': '2020-09-14',
    },
  },
});

export const plaidClient = new PlaidApi(configuration);