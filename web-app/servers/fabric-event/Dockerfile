FROM node:10.19
MAINTAINER Kim Woo Jae <woojae9488@naver.com>
WORKDIR /usr/src/app
COPY package*.json ./
RUN npx npm-force-resolutions && npm install
COPY . ./
EXPOSE 8091
CMD sleep 5 && npm start