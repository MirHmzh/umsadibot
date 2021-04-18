FROM node:14-alpine
ENV TZ=Asia/Jakarta
RUN apk update && apk add --no-cache tzdata

COPY . /app
WORKDIR /app

RUN npm install
CMD ["node", "botservice.js"]