# Use nginx alpine image
FROM nginx:alpine

# Copy the build output to replace the default nginx contents.
COPY dist/ /usr/share/nginx/html

# Copy the nginx config
COPY docker/default.conf.template /etc/nginx/templates/default.conf.template

# Pass in the hostname at build time
ARG HOSTNAME=cmdm.cdot.in
ENV HOSTNAME=${HOSTNAME}

# Replace text in all files under /app
RUN find /usr/share/nginx/html -type f -exec sed -i "s/mdm\.pnb\.bank\.in/${HOSTNAME//\//\\/}/g" {} +


# Expose port 80
EXPOSE 80