import ee from 'event-emitter';
import { Setting } from '@src/utils/setting';

const emitter = ee<{
  submitCode: () => void;
  tabSizeChange: (prev: Setting['tabSize'], next: Setting['tabSize']) => void;
  monacoEditorLoaded: () => void;
  deleteProblemRecord: () => void;
  validate: () => void;
}>();

export default emitter;
