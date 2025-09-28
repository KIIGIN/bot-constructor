import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Bot, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button';
import { useAuth } from '../contexts/AuthContext';
import { useClickOutside } from '../hooks/useClickOutside';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;

  @media (min-width: 768px) {
    padding: 16px 48px;
  }
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
  text-decoration: none;
`;

const LogoIcon = styled(Bot)`
  color: var(--color-primary);
`;

const NavActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ProfileButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: none;
  border: 1px solid var(--color-gray-200);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--color-gray-50);
  }
`;

const ProfileInfo = styled.div`
  text-align: right;
`;

const UserEmail = styled.div`
  font-size: 14px;
  color: var(--color-gray-900);
`;

const UserId = styled.div`
  font-size: 12px;
  color: var(--color-gray-500);
`;

const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 48px;
  background: white;
  border: 1px solid var(--color-gray-200);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: ${props => props.$isOpen ? 'block' : 'none'};
  margin-top: 4px;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  color: var(--color-gray-700);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--color-gray-50);
    color: var(--color-gray-900);
  }
`;

interface HeaderProps {
  logoText: string;
}

const Header: React.FC<HeaderProps> = ({ logoText }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setIsMenuOpen(false));

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <HeaderContainer>
      <LogoLink to="/">
        <LogoIcon size={24} />
        <span>{logoText}</span>
      </LogoLink>
      <NavActions>
        {isAuthenticated && user ? (
          <>
            <ProfileButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <ProfileInfo>
                <UserEmail>{user.email}</UserEmail>
                <UserId>ID: {user.id}</UserId>
              </ProfileInfo>
            </ProfileButton>
            <DropdownMenu $isOpen={isMenuOpen} ref={menuRef}>
              <MenuItem onClick={handleLogout}>
                <LogOut size={16} />
                Выйти
              </MenuItem>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Button variant="outline" size="small" onClick={() => navigate('/register')}>
              Регистрация
            </Button>
            <Button variant="primary" size="small" onClick={() => navigate('/login')}>
              Войти
            </Button>
          </>
        )}
      </NavActions>
    </HeaderContainer>
  );
};

export default Header