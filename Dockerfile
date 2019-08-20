FROM registry.access.redhat.com/ubi8-minimal as builder
RUN curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo
RUN microdnf -y install yarn nodejs
COPY . /mig-ui
WORKDIR /mig-ui
RUN yarn
RUN yarn build

FROM registry.access.redhat.com/ubi8-minimal
RUN microdnf -y install nodejs && microdnf clean all
COPY --from=builder /mig-ui/dist /srv/staticroot
COPY --from=builder /mig-ui/public/favicon.ico /srv/staticroot
COPY --from=builder /mig-ui/public/index.ejs /srv/staticroot
COPY --from=builder /mig-ui/deploy/main.js /srv
COPY --from=builder /mig-ui/node_modules /srv/node_modules
COPY --from=builder /mig-ui/scripts/entrypoint.sh /usr/bin/entrypoint.sh
ENTRYPOINT entrypoint.sh
