/**
 * Unit Tests: Message Validators
 * Testet Validierungsfunktionen für Nachrichten
 */

import { 
  validateMessageContent, 
  validateChatRoomId,
  validateFile 
} from '../../src/validators/message.validator';

describe('Message Validators - Unit Tests', () => {
  describe('validateMessageContent()', () => {
    it('should accept valid message', () => {
      const result = validateMessageContent('Hello World');
      expect(result).toBeNull();
    });

    it('should reject empty message', () => {
      const result = validateMessageContent('');
      expect(result).toContain('darf nicht leer');
    });

    it('should reject whitespace-only message', () => {
      const result = validateMessageContent('   ');
      expect(result).toContain('darf nicht leer');
    });

    it('should reject message that is too long', () => {
      const longMessage = 'a'.repeat(5001);
      const result = validateMessageContent(longMessage);
      expect(result).toContain('5000 Zeichen');
    });

    it('should accept message at max length', () => {
      const maxMessage = 'a'.repeat(5000);
      const result = validateMessageContent(maxMessage);
      expect(result).toBeNull();
    });

    it('should accept message with special characters', () => {
      const result = validateMessageContent('Hello! 😀 #test @user');
      expect(result).toBeNull();
    });

    it('should accept message with newlines', () => {
      const result = validateMessageContent('Line 1\nLine 2\nLine 3');
      expect(result).toBeNull();
    });
  });

  describe('validateChatRoomId()', () => {
    it('should accept valid UUID', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const result = validateChatRoomId(validUuid);
      expect(result).toBeNull();
    });

    it('should reject empty chatRoomId', () => {
      const result = validateChatRoomId('');
      expect(result).toContain('ChatRoom-ID');
    });

    it('should reject undefined chatRoomId', () => {
      const result = validateChatRoomId(undefined as any);
      expect(result).toContain('ChatRoom-ID');
    });

    it('should reject invalid format', () => {
      const result = validateChatRoomId('not-a-uuid');
      expect(result).toContain('ungültiges Format');
    });
  });

  describe('validateFile()', () => {
    it('should accept valid image file', () => {
      const file = {
        mimetype: 'image/png',
        size: 1000000 // 1MB
      } as any;

      const result = validateFile(file);
      expect(result).toBeNull();
    });

    it('should accept valid PDF file', () => {
      const file = {
        mimetype: 'application/pdf',
        size: 2000000 // 2MB
      } as any;

      const result = validateFile(file);
      expect(result).toBeNull();
    });

    it('should reject file that is too large', () => {
      const file = {
        mimetype: 'image/png',
        size: 11000000 // 11MB (> 10MB)
      } as any;

      const result = validateFile(file);
      expect(result).toContain('10 MB');
    });

    it('should reject invalid file type', () => {
      const file = {
        mimetype: 'application/exe',
        size: 1000000
      } as any;

      const result = validateFile(file);
      expect(result).toContain('Dateityp');
    });

    it('should reject missing file', () => {
      const result = validateFile(undefined as any);
      expect(result).toContain('Keine Datei');
    });

    it('should accept file at max size', () => {
      const file = {
        mimetype: 'image/png',
        size: 10 * 1024 * 1024 // Exactly 10MB
      } as any;

      const result = validateFile(file);
      expect(result).toBeNull();
    });

    it('should accept various image formats', () => {
      const formats = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

      formats.forEach(format => {
        const file = { mimetype: format, size: 1000000 } as any;
        const result = validateFile(file);
        expect(result).toBeNull();
      });
    });

    it('should accept various document formats', () => {
      const formats = ['application/pdf', 'application/msword', 'text/plain'];

      formats.forEach(format => {
        const file = { mimetype: format, size: 1000000 } as any;
        const result = validateFile(file);
        expect(result).toBeNull();
      });
    });
  });
});
