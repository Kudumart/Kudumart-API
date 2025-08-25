import swaggerAutogen from "swagger-autogen";

const outputFile = "./swagger.json";

const endpointsFiles = ["./src/index.ts", "./src/routes/*.ts"];

swaggerAutogen()(outputFile, endpointsFiles);
