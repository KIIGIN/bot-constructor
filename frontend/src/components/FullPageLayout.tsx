import React from 'react';
import styled from 'styled-components';

const FullPageContainer = styled.div`
  min-height: 100vh;
  width: 100%;
`;

interface FullPageLayoutProps {
  children: React.ReactNode;
}

const FullPageLayout: React.FC<FullPageLayoutProps> = ({ children }) => {
  return <FullPageContainer>{children}</FullPageContainer>;
};

export default FullPageLayout; 