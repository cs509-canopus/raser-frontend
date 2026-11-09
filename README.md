# RASER: Rubrics for Assessing Scientific Experimental Research

## Development

First, install all dependencies:

```sh
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment variables

Put these in `.env.local`:

```sh
NEXT_PUBLIC_API_URL=<api gateway url for your stage>
NEXT_PUBLIC_USER_POOL_ID=<cognito user pool id>
NEXT_PUBLIC_USER_POOL_CLIENT_ID=<cognito app client id>
```

The user pool values come from your stage's `AuthenticationStack` in raser-backend. Log in at `/login`.

## Deploy to S3

#todo WORK IN PROGRESS

First, build the site:

```sh
npm run build
```

Static website files are written to `.next/static/`. Upload those files to S3 with:

```sh
aws s3 sync .next/static/ s3://<bucket-name>/_next/static/ --delete
```

Also upload public assets from `public/` folder:

```sh
aws s3 sync public/ s3://<bucket-name>/public/ --delete
```
