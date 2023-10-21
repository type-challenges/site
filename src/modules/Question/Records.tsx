import {
  Message,
  Modal,
  Table,
  TableColumnProps,
} from '@arco-design/web-react';
import { useContext, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import styled from 'styled-components';
import { IconDelete, IconEmpty } from '@arco-design/web-react/icon';
import localCache, {
  PROBLEM_STATUS,
  ProblemRecord,
} from '@src/utils/local-cache';
import Context from '@src/utils/context';
import emitter from '@src/utils/emit';
import Markdown from '@src/components/Markdown';
import styles from './index.module.less';

const Accepted = styled.div`
  font-weight: 500;
  color: rgb(var(--green-6));
`;

const UnAccepted = styled.div`
  font-weight: 500;
  color: rgb(var(--red-6));
`;

const ViewCode = function (props: { code: string }) {
  const { code } = props;
  const [
    {
      setting: { theme },
    },
  ] = useContext(Context);
  const [visible, setVisible] = useState(false);
  return (
    <>
      <a onClick={() => setVisible(true)}>view</a>
      <Modal
        simple={true}
        footer={null}
        visible={visible}
        onCancel={() => setVisible(false)}
        style={{ width: 'fit-content' }}
      >
        <Markdown content={`\`\`\`typescript\n${code}\n\`\`\``} theme={theme} />
      </Modal>
    </>
  );
};

const columns: TableColumnProps[] = [
  {
    title: 'Status',
    dataIndex: 'status',
    render(status: PROBLEM_STATUS) {
      if (status === PROBLEM_STATUS.accepted) {
        return <Accepted>Accepted</Accepted>;
      } else {
        return <UnAccepted>Compilation Error</UnAccepted>;
      }
    },
  },
  {
    title: 'Time',
    dataIndex: 'time',
    render(time: number) {
      return dayjs(time).format('YYYY-MM-DD');
    },
  },
  {
    title: 'Code',
    dataIndex: 'code',
    render(_, item: ProblemRecord) {
      return <ViewCode code={item.code} />;
    },
  },
  {
    title: 'Option',
    dataIndex: 'options',
    render(
      _,
      item: {
        code: string;
      },
    ) {
      return (
        <CopyToClipboard
          text={item.code}
          onCopy={() => Message.success('Copied!')}
        >
          <a>copy</a>
        </CopyToClipboard>
      );
    },
  },
  {
    title: 'Operate',
    dataIndex: 'delete',
    render(_, item: ProblemRecord & { problem: string }) {
      return (
        <a
          style={{ display: 'flex', alignItems: 'center' }}
          onClick={function () {
            const success = localCache.deleteProblemRecord(
              item.problem,
              item.time,
            );
            if (success) {
              emitter.emit('delete-problem-record');
              Message.success('Successfully deleted!');
            } else Message.error('Failed to delete!');
          }}
        >
          <IconDelete
            style={{ width: 18, height: 18, color: 'rgb(var(--red-6))' }}
          />
        </a>
      );
    },
  },
];

const Records = function () {
  const [{ currentProblem }] = useContext(Context);
  const [state, setState] = useState(false);

  useEffect(function () {
    emitter.on('submit-code', () => setState(prev => !prev));
    emitter.on('delete-problem-record', () => setState(prev => !prev));
  }, []);

  const records = useMemo(
    function () {
      const cacheJson = localCache.getProblemCacheJson();
      const { records = [] } = cacheJson[currentProblem.key] || {};
      records.sort((recordX, recordY) => recordY.time - recordX.time);
      return records.map(function (record) {
        const { time } = record;
        return {
          key: time,
          ...record,
          problem: currentProblem.key,
        };
      });
    },
    [currentProblem, state],
  );

  return (
    <div className={styles['records-container']}>
      <Table
        className={styles['records-table']}
        columns={columns}
        data={records}
        stripe={true}
        pagination={false}
        noDataElement={
          <div className={'arco-table-no-data'}>
            <div className={'arco-empty'}>
              <div className={'arco-empty-wrapper'}>
                <div className={'arco-empty-image'}>
                  <IconEmpty />
                </div>
                <div className={'arco-empty-description'}>No data</div>
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default Records;
