FROM registry.redhat.io/ubi8/nodejs-16:latest AS builder
COPY --chown=1001:0 . $APP_ROOT/src
WORKDIR $APP_ROOT/src
COPY . .
USER root
RUN dnf install -y openssl-devel python3
RUN dnf module install -y nodejs:16/development
RUN container-entrypoint npm config set offline true
RUN container-entrypoint npm install --no-audit --verbose -g ./hack/build/third-party/yarn-v1.22.22.tar.gz
RUN yarn config set nodedir /usr
RUN yarn config set yarn-offline-mirror /cachi2/output/deps/yarn-classic
RUN yarn config set yarn-offline-mirror-pruning false

ENV BRAND_TYPE="RedHat"
ENV CHROMEDRIVER_SKIP_DOWNLOAD=true \
    SKIP_SASS_BINARY_DOWNLOAD_FOR_CI=true \
    CYPRESS_INSTALL_BINARY=0

RUN container-entrypoint yarn install --offline
RUN container-entrypoint bash -c 'BRAND_TYPE=RedHat yarn build'
RUN container-entrypoint yarn install --offline --production

FROM registry.redhat.io/ubi8/nodejs-16-minimal:latest
USER 1001
COPY --from=builder $APP_ROOT/src/dist /opt/app-root/src/staticroot
COPY --from=builder $APP_ROOT/src/public/favicon.ico /opt/app-root/src/staticroot
COPY --from=builder $APP_ROOT/src/public/index.ejs /opt/app-root/src/staticroot
COPY --from=builder $APP_ROOT/src/deploy/main.js /opt/app-root/src
COPY --from=builder $APP_ROOT/src/node_modules /opt/app-root/src/node_modules
COPY LICENSE /licenses/

ENV MIGMETA_FILE="/etc/mig-ui/migmeta.json"
ENV VIEWS_DIR=/opt/app-root/src/staticroot
ENV STATIC_DIR=/opt/app-root/src/staticroot
ENV NODE_TLS_REJECT_UNAUTHORIZED="0"
ENV BRAND_TYPE="RedHat"
USER 65534:65534
ENTRYPOINT ["node", "/opt/app-root/src/main.js"]
