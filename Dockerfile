FROM node:11.15.0

WORKDIR /opt/AlienThumb

COPY package*.json ./

RUN yarn install
