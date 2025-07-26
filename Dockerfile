# Assuming you are using an official Node.js base image
FROM node:22

# Display Node.js version
RUN node --version

# Your other Docker setup commands
COPY . /app
WORKDIR /app

CMD ["node", "bundle.cjs"]
