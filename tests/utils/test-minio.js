const sinon = require('sinon');

class MockMinIO {
  constructor() {
    this.putObjectStub = sinon.stub().resolves(true);
    this.getObjectStub = sinon.stub().resolves(Buffer.from('test file content'));
    this.presignedGetObjectStub = sinon.stub().resolves('https://mock-presigned-url.com/file.pdf');
    this.removeObjectStub = sinon.stub().resolves(true);
    this.statObjectStub = sinon.stub().resolves({ size: 1024 });
  }

  putObject(bucket, objectName, buffer, size, meta) {
    return this.putObjectStub(bucket, objectName, buffer, size, meta);
  }

  getObject(bucket, objectName) {
    return this.getObjectStub(bucket, objectName);
  }

  presignedGetObject(bucket, objectName, expiry) {
    return this.presignedGetObjectStub(bucket, objectName, expiry);
  }

  removeObject(bucket, objectName) {
    return this.removeObjectStub(bucket, objectName);
  }

  statObject(bucket, objectName) {
    return this.statObjectStub(bucket, objectName);
  }

  reset() {
    this.putObjectStub.reset();
    this.getObjectStub.reset();
    this.presignedGetObjectStub.reset();
    this.removeObjectStub.reset();
    this.statObjectStub.reset();
  }
}

module.exports = MockMinIO;

