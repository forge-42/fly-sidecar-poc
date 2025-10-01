ARG NODE_VERSION=22.19.0
FROM node:${NODE_VERSION}-alpine AS base
ARG PNPM_VERSION=10.15.1
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm && corepack install -g pnpm@$PNPM_VERSION


FROM base AS development-env
COPY . /app
WORKDIR /app
RUN pnpm install --frozen-lockfile


FROM base AS production-env
COPY ./package.json pnpm-lock.yaml pnpm-workspace.yaml /app/
WORKDIR /app
RUN pnpm install --frozen-lockfile --prod


FROM base AS build-env
COPY . /app/
COPY --from=development-env /app/node_modules /app/node_modules
WORKDIR /app
RUN pnpm run build


FROM base
COPY ./package.json pnpm-lock.yaml pnpm-workspace.yaml /app/
COPY --from=production-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app

ENV PORT=80
EXPOSE 80 

ENV MY_SHARED_FILE=/my-shared-dir/shared.txt

CMD ["pnpm", "run", "start"]
