FROM node:18

WORKDIR /app

COPY ./mission-4-backend /app

RUN npm ci

EXPOSE 5000

ENTRYPOINT ["npm", "run", "start"]