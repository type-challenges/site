import fs from 'fs';
import path from 'path';
import prompts from 'prompts';
import chalk from 'chalk';
import problemJson from '../config/problems.json';

const PROBLEMS_PATH = path.resolve(__dirname, '../problems');
const NEW_TYPE_TAG = 'new problem type';
const HELLO_WORLD_PATH = path.resolve(
  PROBLEMS_PATH,
  'basic-tutorial/1-hello-world',
);
const PROBLEM_JSON_PATH = path.resolve(__dirname, '../config/problems.json');

function handleStringWithDivider(source: string, divider: string = '') {
  return source
    .split('-')
    .map(str => `${str[0].toUpperCase()}${str.slice(1)}`)
    .join(divider);
}

async function main() {
  const types: string[] = [];
  const typeFiles = fs.readdirSync(PROBLEMS_PATH);
  typeFiles.forEach(function (item) {
    const stat = fs.lstatSync(path.resolve(PROBLEMS_PATH, item));
    if (stat.isDirectory() === true) {
      types.push(item);
    }
  });
  const typesChoices: prompts.Choice[] = types.map(type => ({
    title: type,
    value: type,
  }));
  typesChoices.push({
    title: NEW_TYPE_TAG,
    value: NEW_TYPE_TAG,
    description: 'Add a new problem type',
  });
  let { problemType } = await prompts({
    type: 'select',
    name: 'problemType',
    message: 'What type of problem do you want to create?',
    choices: typesChoices,
  });
  if (problemType === NEW_TYPE_TAG) {
    const { newTypeName } = await prompts({
      type: 'text',
      name: 'newTypeName',
      initial: 'template-type',
      message: 'What is the name of the new type?',
      validate: value =>
        value === NEW_TYPE_TAG || types.includes(value)
          ? 'This type already exists!'
          : Boolean(value),
    });
    fs.mkdirSync(path.resolve(PROBLEMS_PATH, newTypeName));
    problemType = newTypeName;
  }
  const problemDirPath = path.resolve(PROBLEMS_PATH, problemType);
  const problemsFiles = fs.readdirSync(problemDirPath);
  const problemNumber =
    problemsFiles.filter(function (item) {
      const stat = fs.lstatSync(path.resolve(problemDirPath, item));
      return stat.isDirectory();
    }).length + 1;
  const { newProblemName } = await prompts({
    type: 'text',
    name: 'newProblemName',
    message: 'What is the name of the new problem?',
    initial: 'template-problem',
    validate: value =>
      value === NEW_TYPE_TAG ||
      problemsFiles.includes(`${problemNumber}-${value}`)
        ? 'This problem already exists!'
        : Boolean(value),
  });
  const { githubName } = await prompts({
    type: 'text',
    name: 'githubName',
    message: 'Your github name to thanks:',
  });
  const newProblemPath = path.resolve(
    problemDirPath,
    `${problemNumber}-${newProblemName}`,
  );
  fs.cpSync(HELLO_WORLD_PATH, newProblemPath, { recursive: true });
  problemJson.push({
    key: handleStringWithDivider(newProblemName),
    subject: handleStringWithDivider(problemType, ' '),
    subjectKey: handleStringWithDivider(problemType),
    title: handleStringWithDivider(newProblemName, ' '),
    author: githubName,
  });
  fs.writeFileSync(
    PROBLEM_JSON_PATH,
    JSON.stringify(problemJson, undefined, 2),
    {
      encoding: 'utf-8',
    },
  );
  console.log(
    `The new problem ${chalk.underline.green(
      `${problemType}:${newProblemName}`,
    )} has been created at ${chalk.underline.blue(
      `problems/${problemNumber}-${newProblemName}`,
    )}.`,
  );
  console.log(
    `Please go ${chalk.blue.underline(
      'config/problems.json',
    )} to edit the config of this new problem.`,
  );
}

main();
