FROM nodesource/jessie:4.4.4

# Add compiled source files
ADD ./shippable/buildoutput ./

#Install node dependencies
RUN npm install --production

#Expose node app to world
EXPOSE 8000

#Start application
CMD ["npm","start"]
