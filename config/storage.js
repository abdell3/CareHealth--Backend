const Minio = require('minio');

const storageConfig = {
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true' || false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  bucketName: process.env.MINIO_BUCKET_NAME || 'medical-documents'
};

let minioClient = null;

if (process.env.STORAGE_TYPE === 'minio' || !process.env.STORAGE_TYPE) {
  try {
    minioClient = new Minio.Client({
      endPoint: storageConfig.endPoint,
      port: storageConfig.port,
      useSSL: storageConfig.useSSL,
      accessKey: storageConfig.accessKey,
      secretKey: storageConfig.secretKey
    });
  } catch (error) {
    console.error('MinIO client initialization error:', error);
  }
}

module.exports = {
  minioClient,
  storageConfig,
  bucketName: storageConfig.bucketName,
  PRESIGNED_URL_EXPIRY: 10 * 60
};
