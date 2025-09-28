import React from 'react';
import styled from 'styled-components';
import Button from '../components/Button';

const HeroContainer = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 64px 24px;
  
  @media (min-width: 768px) {
    padding: 96px 48px;
  }
`;

const MainHeading = styled.h1`
  font-size: 36px;
  font-weight: 800;
  color: var(--color-gray-900);
  margin-bottom: 16px;
  
  @media (min-width: 768px) {
    font-size: 48px;
  }
  
  @media (min-width: 1024px) {
    font-size: 56px;
  }
`;

const SubHeading = styled.h2`
  font-size: 18px;
  font-weight: 400;
  color: var(--color-gray-600);
  max-width: 700px;
  margin-bottom: 32px;

  @media (min-width: 768px) {
    font-size: 20px;
  }
`;

const CtaButton = styled(Button)`
  margin-top: 16px;
`;

interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  onClickCta: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle, ctaText, onClickCta }) => {
  return (
    <HeroContainer>
      <MainHeading>{title}</MainHeading>
      <SubHeading>{subtitle}</SubHeading>
      <CtaButton size="large" variant="primary" onClick={onClickCta}>
        {ctaText}
      </CtaButton>
    </HeroContainer>
  );
};

export default HeroSection;