import { BrowserRouter, Routes, Route } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import Layout from './components/layout/Layout';
import Home from './routes/Home';
import Resume from './routes/Resume';
import Explorer from './routes/Explorer';
import SocialGraph from './routes/SocialGraph';
import Leaderboard from './routes/Leaderboard'; // ⬅️ NEW IMPORT

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    background: linear-gradient(135deg, #0f0f0f, #1f1f2e);
    color: #fff;
    font-family: 'Orbitron', sans-serif;
    min-height: 100vh;
    overflow-y: auto;
  }
`;

const AppContainer = styled.div`
  height: 100vh;
  width: 100vw;
`;

function App() {
    return (
        <>
            <GlobalStyle />
            <AppContainer>
                <BrowserRouter>
                    <Routes>
                        <Route element={<Layout />}>
                            <Route index element={<Home />} />
                            <Route path="resume" element={<Resume />} />
                            <Route path="explorer" element={<Explorer />} />
                            <Route path="socialgraph" element={<SocialGraph />} />
                            <Route path="leaderboard" element={<Leaderboard />} /> {/* ⬅️ NEW ROUTE */}
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AppContainer>
        </>
    );
}

export default App;
