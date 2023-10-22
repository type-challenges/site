declare module '@src/problems' {
  import type { ProblemDocs } from '@src/utils/problems';
  import type { Setting } from '@src/utils/setting';
  declare type FilePrefixes = ['check', 'template', 'test'];
  const problemsUrl: {
    [subjectKey: string]: {
      [key: string]: {
        [file in FilePrefixes[number]]: string;
      } & {
        [key in ProblemDocs]: {
          [key in Setting['language']]: string;
        };
      };
    };
  };
  export = problemsUrl;
}
