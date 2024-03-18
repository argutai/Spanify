FROM node:slim
ENV NODE_ENV development
WORKDIR /Spanify
COPY . .
RUN npm install
CMD [ "node", "app.js" ]