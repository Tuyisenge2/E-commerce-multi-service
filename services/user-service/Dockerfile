FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache --virtual .build-deps python3 make g++
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
COPY package.json ./
RUN pnpm install --no-frozen-lockfile
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache --virtual .build-deps python3 make g++
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
COPY package.json ./
RUN pnpm install --prod --no-frozen-lockfile && apk del .build-deps
COPY --from=build /app/dist ./dist
CMD ["pnpm", "start"]
