/**
 * Unit Tests: ChatRoom Validators
 * Testet Validierungsfunktionen für ChatRooms
 */

import { 
  validateGroupChatInput,
  validatePrivateChatInput 
} from '../../src/validators/chatroom.validator';

describe('ChatRoom Validators - Unit Tests', () => {
  describe('validateGroupChatInput()', () => {
    it('should accept valid group chat input', () => {
      const result = validateGroupChatInput({
        name: 'Study Group',
        participantIds: ['user1', 'user2']
      });
      expect(result).toBeNull();
    });

    it('should reject empty name', () => {
      const result = validateGroupChatInput({
        name: '',
        participantIds: ['user1']
      });
      expect(result).toContain('Name');
    });

    it('should reject whitespace-only name', () => {
      const result = validateGroupChatInput({
        name: '   ',
        participantIds: ['user1']
      });
      expect(result).toContain('Name');
    });

    it('should reject missing name', () => {
      const result = validateGroupChatInput({
        participantIds: ['user1']
      } as any);
      expect(result).toContain('Name');
    });

    it('should reject empty participant array', () => {
      const result = validateGroupChatInput({
        name: 'Group',
        participantIds: []
      });
      expect(result).toContain('Teilnehmer');
    });

    it('should reject non-array participantIds', () => {
      const result = validateGroupChatInput({
        name: 'Group',
        participantIds: 'not-array' as any
      });
      expect(result).toContain('Array');
    });

    it('should reject missing participantIds', () => {
      const result = validateGroupChatInput({
        name: 'Group'
      } as any);
      expect(result).toContain('Array');
    });

    it('should accept single participant', () => {
      const result = validateGroupChatInput({
        name: 'Group',
        participantIds: ['user1']
      });
      expect(result).toBeNull();
    });

    it('should accept multiple participants', () => {
      const result = validateGroupChatInput({
        name: 'Group',
        participantIds: ['user1', 'user2', 'user3']
      });
      expect(result).toBeNull();
    });
  });

  describe('validatePrivateChatInput()', () => {
    it('should accept valid userId', () => {
      const result = validatePrivateChatInput({
        userId: 'user123'
      });
      expect(result).toBeNull();
    });

    it('should reject missing userId', () => {
      const result = validatePrivateChatInput({});
      expect(result).toContain('userId');
    });

    it('should reject empty userId', () => {
      const result = validatePrivateChatInput({
        userId: ''
      });
      expect(result).toContain('Gültige userId');
    });

    it('should reject whitespace-only userId', () => {
      const result = validatePrivateChatInput({
        userId: '   '
      });
      expect(result).toContain('Gültige userId');
    });

    it('should reject non-string userId', () => {
      const result = validatePrivateChatInput({
        userId: 123 as any
      });
      expect(result).toContain('Gültige userId');
    });
  });
});
