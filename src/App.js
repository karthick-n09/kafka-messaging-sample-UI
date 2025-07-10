import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, Tabs, Tab } from '@mui/material';
import PacketContractUI from './components/PacketContractUI';
import BitcoinSendUI from './components/BitcoinSendUI';

// Create a theme instance
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Container>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Cross-Chain Bridge" />
            <Tab label="Bitcoin Send" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <PacketContractUI isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <BitcoinSendUI />
        </TabPanel>
      </Container>
    </ThemeProvider>
  );
}

export default App; 