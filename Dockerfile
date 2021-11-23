FROM node:lts-slim
ENV NODE_ENV=production
WORKDIR /app
COPY "package.json" "./"
COPY "package-lock.json*" "./"
RUN npm install --production
COPY . .
CMD npm start