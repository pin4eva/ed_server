FROM node:14-alpine

WORKDIR /app

COPY yarn.lock ./

COPY package*.json ./

# RUN rm -rf node_modules

RUN yarn install

# RUN npm install --platform=linuxmusl --arch=x64 sharp

COPY . .

# ARG NODE_ENV=production
# ENV NODE_ENV=${NODE_ENV}}
ENV PORT=8001


EXPOSE ${PORT}

CMD [ "yarn", "start" ]
