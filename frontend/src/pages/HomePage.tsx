import React from 'react';
import HeroSection from '../sections/HeroSection';
import BenefitsSection from '../sections/BenefitsSection';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <main>
      <HeroSection
        title="TeleBot"
        subtitle="Создавайте Telegram-ботов без кода — быстро и удобно. Наш визуальный конструктор позволяет легко проектировать логику, настраивать поведение и запускать ботов под любые задачи."
        ctaText="Создать своего бота"
        onClickCta={() => navigate('/dashboard')}
      />
      <BenefitsSection />
    </main>
  );
};

export default HomePage;