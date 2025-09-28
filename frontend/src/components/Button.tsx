import React from 'react';
import styled, { css } from 'styled-components';

type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const ButtonContainer = styled.button<{
  variant: ButtonVariant;
  size: ButtonSize;
  $fullWidth: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  
  ${({ $fullWidth }) => $fullWidth && css`
    width: 100%;
  `}

  /* Size variations */
  ${({ size }) => {
    switch (size) {
      case 'small':
        return css`
          padding: 8px 16px;
          font-size: 14px;
        `;
      case 'large':
        return css`
          padding: 16px 32px;
          font-size: 18px;
        `;
      default: // medium
        return css`
          padding: 12px 24px;
          font-size: 16px;
        `;
    }
  }}

  /* Variant styles */
  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return css`
          background-color: var(--color-primary);
          color: white;
          border: none;
          
          &:hover {
            background-color: var(--color-primary-dark);
            transform: translateY(-2px);
            box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);
          }
          
          &:active {
            transform: translateY(0);
            box-shadow: 0 2px 4px rgba(79, 70, 229, 0.1);
          }
        `;
      case 'secondary':
        return css`
          background-color: var(--color-secondary);
          color: white;
          border: none;
          
          &:hover {
            background-color: #0284C7;
            transform: translateY(-2px);
            box-shadow: 0 4px 6px rgba(14, 165, 233, 0.2);
          }
          
          &:active {
            transform: translateY(0);
            box-shadow: 0 2px 4px rgba(14, 165, 233, 0.1);
          }
        `;
      case 'outline':
        return css`
          background-color: transparent;
          color: var(--color-primary);
          border: 2px solid var(--color-primary);
          
          &:hover {
            background-color: rgba(79, 70, 229, 0.05);
            transform: translateY(-2px);
          }
          
          &:active {
            transform: translateY(0);
          }
        `;
      default:
        return '';
    }
  }}
`;

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  children,
  ...props
}) => {
  return (
    <ButtonContainer
      variant={variant}
      size={size}
      $fullWidth={fullWidth}
      {...props}
    >
      {children}
    </ButtonContainer>
  );
};

export default Button;