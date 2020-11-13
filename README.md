# Framework

### Dependencies

1. Postgres
2. Node / Yarn

### Development mode

1. Install `yarn` and run command `yarn install`
2. Copy `.env.example` to `.env` and fill ALL vars even with "null" values (all vars are mandatory for safety).
3. Run command `yarn build:sdk`
4. Create database you set in `DATABASE_DEV_URL` environment var in `.env`
5. Migrate the database with command `yarn db:migrate:up`;
6. Run `Mailcatcher` if needed
7. Run command `yarn dev`
8. Open `http://localhost:3000` or the port you specified in `.env`

### Mailcatcher: Development email server

This project uses `Mailcatcher` to read emails in SMTP port 1025. You can read the email in the browser.

1. Install Docker
2. Run `docker-compose up`
3. Open http://localhost:1080

### Tests

1. Create database you set in `DATABASE_TEST_URL` environment var in `.env`
2. Run command `yarn test`

### SDK

##### Auth

You can load the SDK in the browser with a `<script>` tag and `AuthSDK` var will be set as a global var in `window`.

Example:

```
const authSdk = AuthSDK({
  host: 'http://localhost:3000', // Default is ''
  mode: 'cors', // default
  version: 1, // default
  apiPrefix: `/api/v1` // default. 'v1' is the version set in the `version` prop. If apiPrefix is set, `version` is ignored.
})

authSdk
  .login({ email: 'john@email.com', password: '12345678' })
  .then({ user } => console.log('User is': user))
  .catch((err) => console.error('Login failure', err));
```

Open `./lib/sdk/auth.sdk.ts` for available commands.
