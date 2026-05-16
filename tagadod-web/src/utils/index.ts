type ClassValue = string | number | boolean | undefined | null | ClassArray | ClassDictionary;
interface ClassDictionary { [id: string]: boolean | undefined | null }
interface ClassArray extends Array<ClassValue> {}

function toVal(mix: ClassValue): string {
  let str = '';
  if (typeof mix === 'string' || typeof mix === 'number') {
    str += mix;
  } else if (typeof mix === 'object') {
    if (Array.isArray(mix)) {
      for (let k = 0; k < mix.length; k++) {
        if (mix[k]) {
          const val = toVal(mix[k]);
          if (val) {
            str && (str += ' ');
            str += val;
          }
        }
      }
    } else if (mix) {
      for (const key in mix as ClassDictionary) {
        if ((mix as ClassDictionary)[key]) {
          str && (str += ' ');
          str += key;
        }
      }
    }
  }
  return str;
}

export function cn(...inputs: ClassValue[]): string {
  let str = '';
  for (let i = 0; i < inputs.length; i++) {
    const val = toVal(inputs[i]);
    if (val) {
      str && (str += ' ');
      str += val;
    }
  }
  return str;
}
