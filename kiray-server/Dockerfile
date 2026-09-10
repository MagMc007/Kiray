FROM node:22-alpine AS dependencies

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm config set fetch-retry-maxtimeout 120000 && \
  npm config set fetch-retries 5 && \
  npm config set fetch-timeout 120000 && \
  npm install --omit=dev && \
  npm cache clean --force

FROM node:22-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=5000

COPY package.json ./
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

COPY src ./src

# change ownership
RUN chown -R node:node /usr/src/app


USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "src/server.js"]
