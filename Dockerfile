FROM registry.access.redhat.com/ubi8/nodejs-12:latest as builder
COPY . /mig-ui
WORKDIR /mig-ui
USER root
RUN dnf config-manager --add-repo https://dl.yarnpkg.com/rpm/yarn.repo && \
    dnf -y install yarn && yarn && yarn build

FROM registry.access.redhat.com/ubi8/nodejs-12:latest
COPY --from=builder /mig-ui/dist /opt/app-root/src/staticroot
COPY --from=builder /mig-ui/public/favicon.ico /opt/app-root/src/staticroot
COPY --from=builder /mig-ui/public/crane_favicon.ico /opt/app-root/src/staticroot
COPY --from=builder /mig-ui/public/index.ejs /opt/app-root/src/staticroot
COPY --from=builder /mig-ui/deploy/main.js /opt/app-root/src
COPY --from=builder /mig-ui/node_modules /opt/app-root/src/node_modules

ENV MIGMETA_FILE="/etc/mig-ui/migmeta.json"
ENV VIEWS_DIR=/opt/app-root/src/staticroot
ENV STATIC_DIR=/opt/app-root/src/staticroot
ENV NODE_TLS_REJECT_UNAUTHORIZED="0"

USER 65534:65534
ENTRYPOINT ["node", "/opt/app-root/src/main.js"]
