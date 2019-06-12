# Dockerfile
FROM node:10.8.0
WORKDIR /usr/src/app/thisMyPCServer/
#ENV NODE_ENV=production
# Install dependencies first to take advantage of Docker layer caching. 
COPY thisMyPCServer/package*.json  ./
#RUN cd thisMyPCServer
RUN npm i
# Copy the application files into the image. 
COPY . .
EXPOSE 3000
CMD [ "node", "index.js" ]