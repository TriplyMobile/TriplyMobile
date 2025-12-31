import { fireEvent, render } from '@testing-library/react-native';
import { router } from "expo-router";
import React from 'react';
import Index from '../app/index';

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  };
});

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

describe('Index', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Index />);
    
    expect(getByText('Triply')).toBeTruthy();
    expect(getByText('Plan. Explore. Together.')).toBeTruthy();
  });

  it('renders Login and Sign Up buttons', () => {
    const { getByText } = render(<Index />);
    
    expect(getByText('Login')).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
  });

  it('calls handleLogin when Login button is pressed', () => {
    const consoleSpy = jest.spyOn(router, 'push').mockImplementation();
    const { getByText } = render(<Index />);
    
    const loginButton = getByText('Login');
    fireEvent.press(loginButton);
    
    expect(consoleSpy).toHaveBeenCalledWith("/login");
    
    consoleSpy.mockRestore();
  });

  it('calls handleSignUp when Sign Up button is pressed', () => {
    const consoleSpy = jest.spyOn(router, 'push').mockImplementation();
    const { getByText } = render(<Index />);
    
    const signUpButton = getByText('Sign Up');
    fireEvent.press(signUpButton);
    
    expect(consoleSpy).toHaveBeenCalledWith("/register");
    
    consoleSpy.mockRestore();
  });
});
