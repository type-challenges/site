import { IconCheckCircle, IconCloseCircle } from '@arco-design/web-react/icon';
import { PROBLEM_STATUS } from '@src/utils/local-cache';

const SubmitStatus = function (props: { status?: PROBLEM_STATUS }) {
  const { status } = props;
  if (status === PROBLEM_STATUS.accepted) {
    return <IconCheckCircle style={{ color: 'rgb(var(--green-6))' }} />;
  } else if (status === PROBLEM_STATUS.unAccepted) {
    return <IconCloseCircle style={{ color: 'rgb(var(--red-6))' }} />;
  }
  return null;
};

export default SubmitStatus;
