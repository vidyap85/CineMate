import React from 'react';
import { RoleLoginPage } from './RoleLoginPage';

export const DirectorLoginPage: React.FC<{ onLoginSuccess?: () => void }> = ({ onLoginSuccess }) => {
  return <RoleLoginPage initialRole="DIRECTOR" onLoginSuccess={onLoginSuccess} />;
};

export const ProducerLoginPage: React.FC<{ onLoginSuccess?: () => void }> = ({ onLoginSuccess }) => {
  return <RoleLoginPage initialRole="PRODUCER" onLoginSuccess={onLoginSuccess} />;
};

export const CinematographerLoginPage: React.FC<{ onLoginSuccess?: () => void }> = ({ onLoginSuccess }) => {
  return <RoleLoginPage initialRole="CINEMATOGRAPHER" onLoginSuccess={onLoginSuccess} />;
};
