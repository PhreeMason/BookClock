import { render } from '@testing-library/react-native';
import React from 'react';
import { UserAvatar } from '../shared/UserAvatar';
import { mockUseUser } from '@/__mocks__/externalLibraries';

// Centralized mocks are imported via setup.ts
// No need for manual jest.mock() calls

describe('UserAvatar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when user has no image', () => {
    it('renders user initials with default props', () => {
      mockUseUser.mockReturnValue({
        user: {
          firstName: 'John',
          lastName: 'Doe',
          hasImage: false,
          imageUrl: null,
        },
      });

      const { getByText } = render(<UserAvatar />);
      
      expect(getByText('JD')).toBeTruthy();
    });

    it('renders user initials with custom props', () => {
      mockUseUser.mockReturnValue({
        user: {
          firstName: 'Jane',
          lastName: 'Smith',
          hasImage: false,
          imageUrl: null,
        },
      });

      const { getByText } = render(
        <UserAvatar 
          size={60} 
          backgroundColor="#ff0000" 
          textColor="#ffffff" 
        />
      );
      
      const initialsElement = getByText('JS');
      expect(initialsElement).toBeTruthy();
      expect(initialsElement.props.style).toEqual(
        expect.objectContaining({
          color: '#ffffff',
          fontWeight: '600',
          fontSize: 24, // 60 * 0.4
        })
      );
    });

    it('handles user with only first name', () => {
      mockUseUser.mockReturnValue({
        user: {
          firstName: 'John',
          lastName: '',
          hasImage: false,
          imageUrl: null,
        },
      });

      const { getByText } = render(<UserAvatar />);
      
      expect(getByText('J')).toBeTruthy();
    });

    it('handles user with only last name', () => {
      mockUseUser.mockReturnValue({
        user: {
          firstName: '',
          lastName: 'Doe',
          hasImage: false,
          imageUrl: null,
        },
      });

      const { getByText } = render(<UserAvatar />);
      
      expect(getByText('D')).toBeTruthy();
    });

    it('handles user with no name', () => {
      mockUseUser.mockReturnValue({
        user: {
          firstName: '',
          lastName: '',
          hasImage: false,
          imageUrl: null,
        },
      });

      const { getByText } = render(<UserAvatar />);
      
      expect(getByText('')).toBeTruthy();
    });
  });

  describe('when user has an image', () => {
    it('renders user image instead of initials', () => {
      mockUseUser.mockReturnValue({
        user: {
          firstName: 'John',
          lastName: 'Doe',
          hasImage: true,
          imageUrl: 'https://example.com/avatar.jpg',
        },
      });

      const { queryByText, getByTestId } = render(<UserAvatar />);
      
      // Should not render initials
      expect(queryByText('JD')).toBeFalsy();
      
      // Should render image with correct source
      const imageElement = getByTestId('user-avatar-image');
      expect(imageElement).toBeTruthy();
      expect(imageElement.props.source).toEqual({ uri: 'https://example.com/avatar.jpg' });
    });

    it('renders image with custom size', () => {
      mockUseUser.mockReturnValue({
        user: {
          firstName: 'John',
          lastName: 'Doe',
          hasImage: true,
          imageUrl: 'https://example.com/avatar.jpg',
        },
      });

      const customSize = 80;
      const { getByTestId } = render(<UserAvatar size={customSize} />);
      
      const imageElement = getByTestId('user-avatar-image');
      expect(imageElement.props.style).toEqual(
        expect.objectContaining({
          width: customSize,
          height: customSize,
          borderRadius: customSize / 2,
        })
      );
    });
  });

  describe('when user is null', () => {
    it('renders default "U" initial', () => {
      mockUseUser.mockReturnValue({
        user: null,
      });

      const { getByText } = render(<UserAvatar />);
      
      expect(getByText('U')).toBeTruthy();
    });
  });

  describe('container styles', () => {
    it('applies default container styles', () => {
      mockUseUser.mockReturnValue({
        user: {
          firstName: 'John',
          lastName: 'Doe',
          hasImage: false,
          imageUrl: null,
        },
      });

      const { getByTestId } = render(<UserAvatar />);
      const container = getByTestId('user-avatar-container');
      
      expect(container.props.style).toEqual(
        expect.objectContaining({
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: '#0066cc',
          alignItems: 'center',
          justifyContent: 'center',
        })
      );
    });

    it('applies custom container styles', () => {
      mockUseUser.mockReturnValue({
        user: {
          firstName: 'John',
          lastName: 'Doe',
          hasImage: false,
          imageUrl: null,
        },
      });

      const { getByTestId } = render(
        <UserAvatar 
          size={60} 
          backgroundColor="#ff0000" 
        />
      );
      const container = getByTestId('user-avatar-container');
      
      expect(container.props.style).toEqual(
        expect.objectContaining({
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: '#ff0000',
          alignItems: 'center',
          justifyContent: 'center',
        })
      );
    });
  });

  describe('getUserInitials helper function', () => {
    it('returns uppercase initials for first and last name', () => {
      mockUseUser.mockReturnValue({
        user: {
          firstName: 'john',
          lastName: 'doe',
          hasImage: false,
          imageUrl: null,
        },
      });

      const { getByText } = render(<UserAvatar />);
      
      expect(getByText('JD')).toBeTruthy();
    });

    it('handles names with special characters', () => {
      mockUseUser.mockReturnValue({
        user: {
          firstName: 'José',
          lastName: 'García',
          hasImage: false,
          imageUrl: null,
        },
      });

      const { getByText } = render(<UserAvatar />);
      
      expect(getByText('JG')).toBeTruthy();
    });

    it('handles single character names', () => {
      mockUseUser.mockReturnValue({
        user: {
          firstName: 'A',
          lastName: 'B',
          hasImage: false,
          imageUrl: null,
        },
      });

      const { getByText } = render(<UserAvatar />);
      
      expect(getByText('AB')).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('handles user with hasImage true but no imageUrl', () => {
      mockUseUser.mockReturnValue({
        user: {
          firstName: 'John',
          lastName: 'Doe',
          hasImage: true,
          imageUrl: null,
        },
      });

      const { getByText } = render(<UserAvatar />);
      
      // Should fall back to initials
      expect(getByText('JD')).toBeTruthy();
    });

    it('handles user with hasImage true but empty imageUrl', () => {
      mockUseUser.mockReturnValue({
        user: {
          firstName: 'John',
          lastName: 'Doe',
          hasImage: true,
          imageUrl: '',
        },
      });

      const { getByText } = render(<UserAvatar />);
      
      // Should fall back to initials
      expect(getByText('JD')).toBeTruthy();
    });

    it('handles very small size', () => {
      mockUseUser.mockReturnValue({
        user: {
          firstName: 'John',
          lastName: 'Doe',
          hasImage: false,
          imageUrl: null,
        },
      });

      const { getByText } = render(<UserAvatar size={10} />);
      const initialsElement = getByText('JD');
      
      expect(initialsElement.props.style).toEqual(
        expect.objectContaining({
          fontSize: 4, // 10 * 0.4
        })
      );
    });

    it('handles very large size', () => {
      mockUseUser.mockReturnValue({
        user: {
          firstName: 'John',
          lastName: 'Doe',
          hasImage: false,
          imageUrl: null,
        },
      });

      const { getByText } = render(<UserAvatar size={200} />);
      const initialsElement = getByText('JD');
      
      expect(initialsElement.props.style).toEqual(
        expect.objectContaining({
          fontSize: 80, // 200 * 0.4
        })
      );
    });
  });
}); 