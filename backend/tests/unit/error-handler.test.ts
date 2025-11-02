import { handleControllerError } from '../../src/utils/error-handler';

describe('handleControllerError', () => {
  const jsonMock = jest.fn();
  const statusMock = jest.fn(() => ({ json: jsonMock }));
  const res: any = { status: statusMock };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 404 for not found errors', () => {
    handleControllerError(new Error('user not found'), res, 'default');
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Ressource nicht gefunden' });
  });

  test('returns 403 for unauthorized errors', () => {
    handleControllerError(new Error('unauthorized access'), res, 'default');
    expect(statusMock).toHaveBeenCalledWith(403);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Zugriff nicht autorisiert' });
  });

  test('returns 500 for unknown errors', () => {
    handleControllerError(new Error('something went wrong'), res, 'default message');
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'default message' });
  });
});
