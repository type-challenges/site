import fs from 'fs';
import path from 'path';
import prompts from 'prompts';
import chalk from 'chalk';
import problemJson from '../config/problems.json';

const PROBLEMS_PATH = path.resolve(__dirname, '../problems');
const HELLO_WORLD_PATH = path.resolve(
  PROBLEMS_PATH,
  'basic-tutorial/1-hello-world',
);
const PROBLEM_JSON_PATH = path.resolve(__dirname, '../config/problems.json');

function handleStringWithDivider(
  source: string,
  divider = '',
  separator = '-',
  transformer: 'toUpperCase' | 'toLowerCase' = 'toUpperCase',
) {
  return source
    .split(separator)
    .map(str => `${str[0][transformer]()}${str.slice(1)}`)
    .join(divider);
}

class AddProblemProcess {
  private static NEW_TYPE_TAG = 'New problem type';
  private config: {
    key?: string;
    title?: string;
    subject?: string;
    subjectKey?: string;
    author?: string;
  } = {};
  private info: {
    subjectDirName?: string;
    problemDirName?: string;
  } = {};
  private async getSubject() {
    if (this.config.subject) {
      return this.config.subject;
    }
    const subjects: string[] = [];
    const subjectDirs = fs.readdirSync(PROBLEMS_PATH);
    subjectDirs.forEach(function (dir) {
      const stat = fs.lstatSync(path.resolve(PROBLEMS_PATH, dir));
      if (stat.isDirectory() === true) {
        subjects.push(dir);
      }
    });
    const typesChoices: prompts.Choice[] = subjects.map(subject => ({
      title: handleStringWithDivider(subject, ' '),
      value: subject,
    }));
    typesChoices.push({
      title: AddProblemProcess.NEW_TYPE_TAG,
      value: AddProblemProcess.NEW_TYPE_TAG,
      description: 'Add a new problem type',
    });
    const { subject } = await prompts({
      type: 'select',
      name: 'subject',
      message: 'What is the subject of problem do you want to create?',
      choices: typesChoices,
    });
    if (subject !== AddProblemProcess.NEW_TYPE_TAG) {
      this.config.subject = handleStringWithDivider(subject, ' ');
      this.info.subjectDirName = subject;
      return this.config.subject;
    }
    const { newSubject } = await prompts({
      type: 'text',
      name: 'newSubject',
      initial: 'Template Type',
      message: 'What is the name of the new subject?',
      validate: value => {
        const dirName = handleStringWithDivider(value, '-', ' ', 'toLowerCase');
        if (subjectDirs.includes(dirName)) {
          return 'This subject already exists.';
        }
        return Boolean(value);
      },
    });
    this.config.subject = newSubject;
    this.info.subjectDirName = handleStringWithDivider(
      newSubject,
      '-',
      ' ',
      'toLowerCase',
    );
    this.createNewSubject();
    return this.config.subject;
  }
  private async getSubjectKey() {
    if (this.config.subjectKey) {
      return this.config.subjectKey;
    }
    this.config.subjectKey = handleStringWithDivider(
      this.config.subject!,
      '',
      ' ',
    );
    return this.config.subjectKey!;
  }
  private async getTitle() {
    if (this.config.title) {
      return this.config.title;
    }
    const { subject } = this.config;
    const { subjectDirName } = this.info;
    const problemDirPath = path.resolve(PROBLEMS_PATH, subjectDirName!);
    const problemsFiles = fs.readdirSync(problemDirPath);
    const index =
      problemsFiles.filter(function (item) {
        const stat = fs.lstatSync(path.resolve(problemDirPath, item));
        return stat.isDirectory();
      }).length + 1;
    const { title } = await prompts({
      type: 'text',
      name: 'title',
      message: 'What is the title of the new problem?',
      initial: 'Template Problem',
      validate: value =>
        problemJson.some(
          problem => problem.subject === subject && problem.title === value,
        )
          ? 'This problem already exists!'
          : Boolean(value),
    });
    this.config.title = title;
    this.info.problemDirName = `${index}-${handleStringWithDivider(
      title,
      '-',
      ' ',
      'toLowerCase',
    )}`;
    return this.config.title!;
  }
  private async getKey() {
    if (this.config.key) {
      return this.config.key;
    }
    const { key } = await prompts({
      type: 'text',
      name: 'key',
      message: 'What is the special key of the new problem?',
      validate: value =>
        problemJson.some(problem => problem.key === value)
          ? 'This key already exists!'
          : Boolean(value),
    });
    this.config.key = key;
    return this.config.key!;
  }
  private async getAuthor() {
    if (this.config.author !== undefined) {
      return this.config.author;
    }
    const { author = '' } = await prompts({
      type: 'text',
      name: 'author',
      message: 'Your github name to thanks:',
      hint: 'Empty to hide this info in the page.',
    });
    this.config.author = author;
    return this.config.author!;
  }
  private createNewSubject() {
    const { subjectKey } = this.config;
    const { subjectDirName } = this.info;
    const subjectDirPath = path.resolve(PROBLEMS_PATH, subjectDirName!);
    fs.mkdirSync(subjectDirPath);
    fs.writeFileSync(path.resolve(subjectDirPath, 'index.ts'), '');
    const rootIndexTsPath = path.resolve(PROBLEMS_PATH, 'index.ts');
    const rootIndexTs = fs.readFileSync(rootIndexTsPath);
    fs.writeFileSync(
      rootIndexTsPath,
      `${rootIndexTs}export * as ${subjectKey} from './${subjectDirName}';\n`,
    );
  }
  private createNewProblem() {
    const { key } = this.config;
    const { subjectDirName, problemDirName } = this.info;
    const subjectDirPath = path.resolve(PROBLEMS_PATH, subjectDirName!);
    const newProblemPath = path.resolve(subjectDirPath!, problemDirName!);
    fs.cpSync(HELLO_WORLD_PATH, newProblemPath, { recursive: true });
    const indexTsPath = path.resolve(subjectDirPath!, 'index.ts');
    const indexTs = fs.readFileSync(indexTsPath);
    fs.writeFileSync(
      indexTsPath,
      `${indexTs}export * as ${key} from './${problemDirName}';\n`,
    );
  }
  private editConfigJson() {
    problemJson.push({ ...(this.config as any) });
    fs.writeFileSync(
      PROBLEM_JSON_PATH,
      JSON.stringify(problemJson, undefined, 2),
      {
        encoding: 'utf-8',
      },
    );
  }
  private checkConfigValue(key: keyof typeof this.config) {
    if (this.config[key] === undefined) {
      console.error(chalk.red(`${key} doesn't exist`));
      process.exit(1);
    }
    return true;
  }
  private log() {
    const { subject, title } = this.config;
    const { subjectDirName, problemDirName } = this.info;
    console.log(
      `The new problem ${chalk.underline.green(
        `${subject}/${title}`,
      )} has been created at ${chalk.underline.blue(
        `problems/${subjectDirName}/${problemDirName}`,
      )}.`,
    );
    console.log(
      `Please go ${chalk.blue.underline(
        'config/problems.json',
      )} to edit the config of this new problem.`,
    );
  }
  async run() {
    await this.getSubject();
    this.checkConfigValue('subject');

    await this.getSubjectKey();
    this.checkConfigValue('subjectKey');

    await this.getTitle();
    this.checkConfigValue('title');

    await this.getKey();
    this.checkConfigValue('key');

    await this.getAuthor();

    this.createNewProblem();
    this.editConfigJson();

    this.log();
  }
}

function main() {
  const progress = new AddProblemProcess();
  progress.run();
}

main();
