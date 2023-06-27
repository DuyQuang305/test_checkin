# Command
```text

yarn install
yarn start

yarn build

# Format Code
yarn format

# Create An Admin
yarn create-admin

```

# Environment
```env

PORT=
JWT_SECRET=
MONGODB_URL=

DOMAIN_OPTIONAL=

# Init administration
ADMIN_MAIL=
ADMIN_FULL_NAME=
ADMIN_PHONE=
ADMIN_ADDRESS=
ADMIN_PASSWORD=

```

# Dockerfile
```docker

FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./

COPY tsconfig.build.json tsconfig.build.json
COPY tsconfig.json tsconfig.json

COPY ./src ./src

ENV PORT=
ENV JWT_SECRET=
ENV MONGODB_URL=
ENV DOMAIN_OPTIONAL=
ENV ADMIN_MAIL=
ENV ADMIN_FULL_NAME=
ENV ADMIN_PHONE=
ENV ADMIN_ADDRESS=
ENV ADMIN_PASSWORD=

RUN yarn install \
    && yarn build

EXPOSE 5555

CMD ["node", "dist/app.js"]

```

# Build
```cmd

docker build -t checkin .

```
