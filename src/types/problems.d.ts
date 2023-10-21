declare module '@src/problems' {
  import type { ProblemDocs } from '@src/utils/problems';
  declare type FilePrefixes = ['check', 'template'];
  const problemsUrl: {
    [subjectKey: string]: {
      [key: string]: {
        [file in FilePrefixes[number]]: string;
      } & {
        [key in ProblemDocs]: {
          en: string;
        };
      };
    };
  };
  export = problemsUrl;
}
