import React from 'react';
import styled from 'styled-components';
import { Outlet, Link } from 'react-router-dom';

const Shell = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100vh;
  color: #fff;
  font-family: 'Orbitron', sans-serif;
`;

const Navbar = styled.nav`
  background: rgba(0, 255, 255, 0.1);
  padding: 1rem 2rem;
  display: flex;
  gap: 2rem;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 255, 255, 0.2);
`;

const NavItem = styled(Link)`
  color: cyan;
  text-decoration: none;
  font-weight: bold;

  &:hover {
    color: #00ffff;
    text-shadow: 0 0 5px cyan;
  }
`;

const Content = styled.main`
  padding: 2rem;
`;

const Layout: React.FC = () => {
  return (
    <Shell>
      <Navbar>
        <NavItem to="/">Home</NavItem>
        <NavItem to="/resume">Resume</NavItem>
        <NavItem to="/explorer">Explorer</NavItem>
        <NavItem to="/socialgraph">Social Graph</NavItem>
        <NavItem to="/leaderboard">Leaderboard</NavItem> {/* ⬅️ NEW NAV LINK */}
      </Navbar>
      <Content>
        <Outlet />
      </Content>
    </Shell>
  );
};

export default Layout;
