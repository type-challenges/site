import { renderToString } from 'react-dom/server';
import App from './App';

export default function getSSRContent() {
  return renderToString(<App />);
}
