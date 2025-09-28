import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background-color: var(--color-gray-50);
  border-top: 1px solid var(--color-gray-200);
  margin-top: auto;
`;

const Copyright = styled.p`
  color: var(--color-gray-600);
  font-size: 14px;
`;

interface FooterProps {
  projectName: string;
}

const Footer: React.FC<FooterProps> = ({ projectName }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <Copyright>
        © {currentYear} {projectName}. Все права защищены.
      </Copyright>
    </FooterContainer>
  );
};

export default Footer;