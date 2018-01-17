FROM node:8-alpine
RUN mkdir /work
COPY . /work/
WORKDIR /work
RUN npm i
CMD npm start