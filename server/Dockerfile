
FROM node:14-alpine

# RUN mkdir -p /app

WORKDIR /app

COPY ./ ./


RUN yarn install


RUN yarn build

COPY ./ ./

# ARG NODE_ENV=production
# ENV NODE_ENV=${NODE_ENV}}
ENV PORT=8000


EXPOSE ${PORT}

# CMD [ "yarn", "start:prod" ]

