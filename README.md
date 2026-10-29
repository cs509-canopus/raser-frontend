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
