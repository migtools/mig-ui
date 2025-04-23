FROM registry.access.redhat.com/ubi8/nodejs-16 as builder
COPY . /mig-ui
WORKDIR /mig-ui
USER root


# Use Corepack if available, or use vendored Yarn binary
# You can skip installing Yarn globally — Berry is self-contained
RUN node .yarn/releases/yarn-*.cjs install --immutable

# Build the app using env-aware commands (no internet needed)
RUN node .yarn/releases/yarn-*.cjs run build

# Production install (optional depending on how you deploy)
RUN node .yarn/releases/yarn-*.cjs install --immutable --production

# Final runtime image
FROM registry.access.redhat.com/ubi8/nodejs-16

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
