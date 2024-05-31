import { Setting } from '@src/utils/setting';

export function formatCodeByUpdateTabSize(
  code: string,
  prev: Setting['tabSize'],
  next: Setting['tabSize'],
) {
  return code
    .split('\n')
    .map(function (line) {
      let index = 0;
      while (line[index] === ' ') {
        ++index;
      }
      if (index === 0) return line;
      const suffix = line.slice(index);
      index -= 1;
      if (index % 2 === 1) {
        index += 1;
      }
      const prefix = ' '.repeat((index * next) / prev);
      return `${prefix}${suffix}`;
    })
    .join('\n');
}
