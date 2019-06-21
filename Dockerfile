FROM quay.io/ocpmigrate/node
ADD dist /srv/staticroot
ADD public/favicon.ico /srv/staticroot
ADD public/index.ejs /srv/staticroot
ADD deploy/main.js /srv
ADD node_modules /srv/node_modules
ADD scripts/entrypoint.sh /usr/bin/entrypoint.sh
ENTRYPOINT entrypoint.sh
