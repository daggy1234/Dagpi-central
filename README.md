# Dagpi Central

A central server for dagpi. Re-written using express, ts, postgres and prisma. PERN stack.

## Prisma

Extremely Powerful and greatly typed ORM for nodejs.

## Express

Lightweight and powerful server. Works like a charm

## Postgres

Arguably the best SQL database.

## Typescript

I love ts.

## Useage

Prebuilt docker images included. You can run them in docker. However some services are proprietary and thus need to be configured.

### Amazon SES

Configure the templates and Simple Email Services.

### Token

The central admin token. Just used to secure everything.

## Sample Env

```env
DEPLOYMENT=""
PORT=8000
TOKEN=""
AWS_ACCESS_KEY_ID=""
AWS_ACCESS_KEY=""
DATABASE_URL=""
```
