const jwt = require('jsonwebtoken');
const { verificarToken } = require('../../src/middlewares/auth.middleware');

// Mock de jwt
jest.mock('jsonwebtoken');

describe('Auth Middleware - verificarToken', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    // Reset mocks antes de cada test
    jest.clearAllMocks();

    // Mock de request
    mockReq = {
      headers: {}
    };

    // Mock de response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Mock de next
    mockNext = jest.fn();

    // Configurar JWT_SECRET para tests
    process.env.JWT_SECRET = 'test-secret-key';
  });

  describe('Casos de error', () => {
    test('debe retornar 401 si no hay header de autorización', () => {
      verificarToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Token de autenticación no proporcionado'
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('debe retornar 401 si el header no tiene el formato Bearer', () => {
      mockReq.headers['authorization'] = 'InvalidFormat';

      verificarToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Token de autenticación no proporcionado'
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('debe retornar 401 si el token es inválido', () => {
      mockReq.headers['authorization'] = 'Bearer invalid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      verificarToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token inválido o expirado'
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('debe retornar 401 si el token está expirado', () => {
      mockReq.headers['authorization'] = 'Bearer expired-token';
      jwt.verify.mockImplementation(() => {
        const error = new Error('jwt expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      verificarToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token inválido o expirado'
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Casos exitosos', () => {
    test('debe llamar a next() si el token es válido', () => {
      const decodedToken = {
        id: 1,
        email: 'admin@test.com',
        username: 'admin',
        organizacion_id: 1,
        es_super_admin: false
      };

      mockReq.headers['authorization'] = 'Bearer valid-token';
      jwt.verify.mockReturnValue(decodedToken);

      verificarToken(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret-key');
      expect(mockReq.admin).toEqual(decodedToken);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('debe extraer correctamente el token del header Bearer', () => {
      const decodedToken = { id: 1, username: 'test' };
      mockReq.headers['authorization'] = 'Bearer my.jwt.token';
      jwt.verify.mockReturnValue(decodedToken);

      verificarToken(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith('my.jwt.token', 'test-secret-key');
    });
  });
});
