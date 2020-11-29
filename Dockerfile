FROM node:14.15.1

WORKDIR /opt/AlienThumb

COPY package*.json ./

RUN yarn install
