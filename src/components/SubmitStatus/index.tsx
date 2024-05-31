import { IconCheckCircle, IconCloseCircle } from '@arco-design/web-react/icon';
import { QUESTION_STATUS } from '@src/utils/local-cache';

const SubmitStatus = function (props: { status?: QUESTION_STATUS }) {
  const { status } = props;
  if (status === QUESTION_STATUS.accepted) {
    return <IconCheckCircle style={{ color: 'rgb(var(--green-6))' }} />;
  } else if (status === QUESTION_STATUS.unAccepted) {
    return <IconCloseCircle style={{ color: 'rgb(var(--red-6))' }} />;
  }
  return null;
};

export default SubmitStatus;
