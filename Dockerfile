FROM node:lts-alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock* ./
COPY sst-env.d.ts* ./
RUN yarn install --frozen-lockfile

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# If static pages do not need linked resources
RUN yarn build

# If static pages need linked resources
# RUN --mount=type=secret,id=SST_RESOURCE_MyResource,env=SST_RESOURCE_MyResource \
#   yarn build

# Stage 3: Production server
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]