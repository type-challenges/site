import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import ts from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import ReactMarkdown from 'react-markdown';
import { Setting } from '@src/utils/setting';
import styles from './index.module.less';

SyntaxHighlighter.registerLanguage('ts', ts);
SyntaxHighlighter.registerLanguage('typescript', ts);

const Markdown = function (props: {
  content: string;
  theme: Setting['theme'];
}) {
  const { content, theme } = props;
  return (
    <ReactMarkdown
      components={{
        code(props) {
          const { children, className, ...rest } = props;
          const match = /language-(\w+)/.exec(className || '');
          return match ? (
            <SyntaxHighlighter
              {...rest}
              className={styles['markdown-code']}
              style={theme === 'light' ? oneLight : oneDark}
              language={match[1]}
              showLineNumbers={true}
              wrapLines={true}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code {...rest} className={className}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default Markdown;
