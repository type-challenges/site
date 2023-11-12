import { renderToString } from 'react-dom/server';
import App from './App';

// @ts-ignore
global.getSSRContent = function getSSRContent() {
  return renderToString(<App />);
};
