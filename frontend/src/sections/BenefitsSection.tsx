import React from 'react';
import styled from 'styled-components';
import BenefitCard from '../components/BenefitCard';
import { Zap, Blocks, Shield, BadgeDollarSign } from 'lucide-react';

const SectionContainer = styled.section`
  padding: 48px 24px;
  background-color: var(--color-gray-50);
  
  @media (min-width: 768px) {
    padding: 64px 48px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 48px;
  color: var(--color-gray-900);
  
  @media (min-width: 768px) {
    font-size: 32px;
  }
`;

const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: Zap,
      title: 'Быстрое создание',
      description: 'Создавайте ботов за считанные минуты благодаря интуитивному интерфейсу.',
    },
    {
      icon: Blocks,
      title: 'Гибкая настройка',
      description: 'Настраивайте логику бота с помощью визуальных блоков без необходимости программирования.',
    },
    {
      icon: BadgeDollarSign,
      title: 'Бесплатно',
      description: 'Пользуйтесь всеми возможностями конструктора без ограничений и дополнительных платежей.',
    },
    {
      icon: Shield,
      title: 'Безопасность',
      description: 'Ваши данные надежно защищены современными протоколами шифрования и стандартами безопасности.',
    },
  ];

  return (
    <SectionContainer>
      <SectionTitle>Почему наш конструктор</SectionTitle>
      <BenefitsGrid>
        {benefits.map((benefit, index) => (
          <BenefitCard
            key={index}
            icon={benefit.icon}
            title={benefit.title}
            description={benefit.description}
          />
        ))}
      </BenefitsGrid>
    </SectionContainer>
  );
};

export default BenefitsSection;