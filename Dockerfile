FROM node:latest AS build
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN rm -rf node_modules && yarn install --frozen-lockfile
COPY tsconfig*.json ./
COPY app app
RUN yarn build

FROM node:lts-alpine
ENV NODE_ENV production
RUN apk add --no-cache dumb-init curl
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/package.json /usr/src/app/package.json
COPY --chown=node:node --from=build /usr/src/app/yarn.lock /usr/src/app/yarn.lock
COPY prisma prisma
RUN yarn install --production && chown node:node .
COPY --chown=node:node --from=build /usr/src/app/dist /usr/src/app/dist
CMD ["dumb-init", "yarn", "prod"]
