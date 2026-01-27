FROM registry.redhat.io/ubi8/nodejs-18:latest AS builder
COPY --chown=1001:0 . $APP_ROOT/src
WORKDIR $APP_ROOT/src
COPY . .
USER root
RUN dnf install -y openssl-devel python3
RUN dnf module install -y nodejs:18/development

ENV BRAND_TYPE="RedHat"
ENV CHROMEDRIVER_SKIP_DOWNLOAD=true \
    SKIP_SASS_BINARY_DOWNLOAD_FOR_CI=true \
    CYPRESS_INSTALL_BINARY=0

# Use Yarn Berry - vendored binary, hermetic build
RUN container-entrypoint node .yarn/releases/yarn-*.cjs install --immutable
RUN container-entrypoint bash -c 'BRAND_TYPE=RedHat node .yarn/releases/yarn-*.cjs run build'
# Install production dependencies only (equivalent to yarn install --production in Classic)
RUN container-entrypoint bash -c 'NODE_ENV=production node .yarn/releases/yarn-*.cjs install --immutable'

FROM registry.redhat.io/ubi8/nodejs-18-minimal:latest
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

LABEL \
        "io.k8s.description"="Migration Toolkit for Containers UI" \
        "io.k8s.display-name"="Migration Toolkit for Containers" \
        "io.openshift.tags"="migration" \
        "summary"="Migration Toolkit for Containers UI" \
        "io.openshift.maintainer.project"="MIG"
