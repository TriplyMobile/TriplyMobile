// jest.setup.js
jest.mock('expo-linear-gradient', () => 'LinearGradient');
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));
