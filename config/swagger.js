const swaggerJsdoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.1.0',
  info: {
    title: 'CareHealth EHR API',
    version: '1.0.0',
    description: 'API documentation for CareHealth EHR Backend - Comprehensive Electronic Health Records Management System',
    contact: {
      name: 'CareHealth EHR Team',
      email: 'support@carehealth.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Local Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from /auth/login endpoint'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Error message'
          },
          errors: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'Operation successful'
          },
          data: {
            type: 'object'
          },
          meta: {
            type: 'object'
          }
        }
      },
      Patient: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          firstName: {
            type: 'string',
            example: 'John'
          },
          lastName: {
            type: 'string',
            example: 'Doe'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com'
          },
          phone: {
            type: 'string',
            example: '+1234567890'
          },
          dateOfBirth: {
            type: 'string',
            format: 'date',
            example: '1990-01-01'
          },
          gender: {
            type: 'string',
            enum: ['male', 'female', 'other'],
            example: 'male'
          },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              zipCode: { type: 'string' },
              country: { type: 'string' }
            }
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Prescription: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          patientId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          doctorId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          appointmentId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          pharmacyId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          medications: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Paracetamol' },
                dosage: { type: 'string', example: '500mg' },
                frequency: { type: 'string', example: 'Every 6 hours' },
                duration: { type: 'string', example: '7 days' },
                notes: { type: 'string' }
              }
            }
          },
          dispensation: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['pending', 'ready', 'unavailable', 'dispensed'],
                example: 'pending'
              },
              dispensedAt: {
                type: 'string',
                format: 'date-time'
              },
              pharmacistId: {
                type: 'string'
              },
              notes: {
                type: 'string'
              }
            }
          },
          issuedAt: {
            type: 'string',
            format: 'date-time'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      LabOrder: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          patientId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          doctorId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          consultationId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          tests: {
            type: 'array',
            items: {
              type: 'string'
            },
            example: ['Blood Test', 'Urine Test']
          },
          status: {
            type: 'string',
            enum: ['ordered', 'received', 'validated'],
            example: 'ordered'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      LabResult: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          labOrderId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          fileUrl: {
            type: 'string',
            example: 'test-result.pdf'
          },
          uploaderId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          uploadedAt: {
            type: 'string',
            format: 'date-time'
          },
          validatedAt: {
            type: 'string',
            format: 'date-time'
          },
          notes: {
            type: 'string'
          }
        }
      },
      MedicalDocument: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          patientId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          consultationId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          labOrderId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          uploaderId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          fileName: {
            type: 'string',
            example: 'medical-report.pdf'
          },
          fileType: {
            type: 'string',
            enum: ['application/pdf', 'image/jpeg', 'image/png'],
            example: 'application/pdf'
          },
          fileSize: {
            type: 'number',
            example: 1024000
          },
          category: {
            type: 'string',
            enum: ['imaging', 'report'],
            example: 'report'
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            },
            example: ['x-ray', 'chest']
          },
          fileUrl: {
            type: 'string',
            example: 'medical-report.pdf'
          },
          downloadUrl: {
            type: 'string',
            example: 'https://presigned-url.com/file.pdf'
          },
          uploadedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Pharmacy: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          name: {
            type: 'string',
            example: 'Central Pharmacy'
          },
          address: {
            type: 'string',
            example: '123 Main Street'
          },
          phone: {
            type: 'string',
            example: '+1234567890'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'info@centralpharmacy.com'
          },
          status: {
            type: 'string',
            enum: ['active', 'inactive'],
            example: 'active'
          },
          openingHours: {
            type: 'object'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'doctor@example.com'
          },
          firstName: {
            type: 'string',
            example: 'John'
          },
          lastName: {
            type: 'string',
            example: 'Doe'
          },
          phone: {
            type: 'string',
            example: '+1234567890'
          },
          role: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' }
            }
          },
          isActive: {
            type: 'boolean',
            example: true
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Auth',
      description: 'Authentication and authorization endpoints'
    },
    {
      name: 'Users',
      description: 'User management endpoints'
    },
    {
      name: 'Patients',
      description: 'Patient management endpoints'
    },
    {
      name: 'Appointments',
      description: 'Appointment management endpoints'
    },
    {
      name: 'Prescriptions',
      description: 'Prescription management endpoints'
    },
    {
      name: 'Pharmacy',
      description: 'Pharmacy management endpoints'
    },
    {
      name: 'Laboratory',
      description: 'Laboratory orders and results endpoints'
    },
    {
      name: 'Documents',
      description: 'Medical document management endpoints'
    },
    {
      name: 'Health',
      description: 'Health check endpoints'
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './routes/*.js',
    './app/Http/Controllers/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

