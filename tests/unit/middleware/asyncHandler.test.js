const asyncHandler = require('../../../src/utils/asyncHandler');

describe('asyncHandler', () => {
  it('should handle successful async operations', async () => {
    const mockReq = {};
    const mockRes = { json: jest.fn() };
    const mockNext = jest.fn();

    const handler = asyncHandler(async (req, res) => {
      res.json({ success: true });
    });

    await handler(mockReq, mockRes, mockNext);
    expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should pass errors to next middleware', async () => {
    const mockReq = {};
    const mockRes = {};
    const mockNext = jest.fn();
    const error = new Error('Test error');

    const handler = asyncHandler(async () => {
      throw error;
    });

    await handler(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
