FROM node:6-alpine as node

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

WORKDIR /app

COPY package.json /app/

RUN npm install

COPY ./ /app/

RUN npm run build -- --prod

FROM nginx:1.13.11-alpine

COPY --from=node /app/dist/ /usr/share/nginx/html

COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf
