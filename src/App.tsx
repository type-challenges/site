import { ConfigProvider, Layout } from '@arco-design/web-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import debounce from 'lodash.debounce';
import Editor from '@src/modules/Editor';
import Footer from '@src/modules/Footer';
import Header from '@src/modules/Header';
import Context, {
  getContext,
  type Context as ContextType,
  SetContext,
} from '@src/utils/context';
import settingList from '@src/utils/setting';
import Question from '@src/modules/Question';
import localCache from '@src/utils/local-cache';
import Results from '@src/modules/Results';
import { setCurrentQuestionForUrl } from '@src/utils/url';
import { getQuestionList } from '@src/utils/type-challenges';
import styles from './index.module.less';
import './global.less';

function getPopupContainer() {
  return document.getElementById('root') || document.body;
}

function App() {
  const [context, setContext] = useState(getContext());

  useEffect(function () {
    getQuestionList().then(questions =>
      setContext(prev => ({ ...prev, questions })),
    );
  }, []);

  useEffect(function () {
    settingList['theme'].onChange?.(context.setting.theme);
    settingList['language'].onChange?.(context.setting.language);
  }, []);

  const updateCache = useCallback(
    debounce(function (key: string) {
      localCache.setQuestionCache('currentQuestion', key);
    }, 200),
    [],
  );

  const contextValue: [ContextType, SetContext] = useMemo(
    function () {
      return [
        context!,
        update => {
          if (
            update.currentQuestion &&
            context?.currentQuestion !== update.currentQuestion
          ) {
            updateCache(update.currentQuestion);
            setCurrentQuestionForUrl(update.currentQuestion);
          }
          setContext({
            ...context!,
            ...update,
          });
        },
      ];
    },
    [context, setContext],
  );

  return (
    <ConfigProvider
      componentConfig={{
        Modal: { getPopupContainer },
        Drawer: { getPopupContainer },
      }}
      getPopupContainer={getPopupContainer}
    >
      <Context.Provider value={contextValue}>
        <Layout className={styles.container}>
          <Layout.Header className={styles.header}>
            <Header />
          </Layout.Header>
          <Layout hasSider={true} className={styles.content}>
            <Layout.Sider
              width={'40%'}
              className={styles.left}
              resizeDirections={['right']}
            >
              <Question />
            </Layout.Sider>
            <Layout.Content className={styles.right}>
              <Layout hasSider={true} className={styles['right-layout']}>
                <Layout.Content className={styles['right-layout-top']}>
                  <Editor />
                </Layout.Content>
                <Layout.Sider
                  resizeDirections={['top']}
                  className={styles['right-layout-bottom']}
                >
                  <Results />
                </Layout.Sider>
              </Layout>
            </Layout.Content>
          </Layout>
          <Layout.Footer className={styles.footer}>
            <Footer />
          </Layout.Footer>
        </Layout>
      </Context.Provider>
    </ConfigProvider>
  );
}

export default App;
