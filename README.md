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

### Environment variables and login

<!-- AI disclosure: this section was written by Kai (Claude Code, Claude Opus 5.5) on 2026-11-12 for issue #46. -->

Put these in `.env.local` (they're baked in at build time, so the deployed
build needs them too):

```sh
NEXT_PUBLIC_API_URL=<api gateway url for your stage>
NEXT_PUBLIC_USER_POOL_ID=<UserPoolId output of your stage's AuthenticationStack>
NEXT_PUBLIC_USER_POOL_CLIENT_ID=<UserPoolClientId output of the same stack>
```

Log in at `/login/`. Signed-out visitors to any other page get sent there.
Sign-up asks whether you're a journal editor or a rubric designer.

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
