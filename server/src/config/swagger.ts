import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Industry Management System API",
      version: "1.0.0",
      description: "IMS Backend API Documentation",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: ["./src/modules/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
