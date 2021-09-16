import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import en from 'dayjs/locale/en'
import de from 'dayjs/locale/de'

/**
 * 
 * 
 * @param {number} milliseconds
 * @returns {void}
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export function sleep(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

/**
 * 
 * 
 * @returns {string}
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export function make_readable_date(): string {
  const date = new Date()
  const month = date.getMonth() + 1
  const datetime = date.getFullYear()
    + '-' + month
    + '-' + date.getDate()
    + ' (' + date.getHours()
    + ':' + date.getMinutes()
    + ':' + date.getSeconds()
    + ')'

  return datetime
}

/**
 * 
 * 
 * @param {string[]} array
 * @param {string} value
 * @returns {string[]}
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export function remove_from_array_by_value(array: string[], value: string): string[] {
  const index = array.indexOf(value);
  if (index !== -1) {
    array.splice(index, 1);
  }
  return array
}

/**
 * 
 * @param {any[]} array
 * @returns {any[]}
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export function remove_duplicate(array: any[]): any[] {
  const unique = array.filter((a, b) => array.indexOf(a) === b)
  return unique
}

/**
 * 
 * 
 * @param {any[]} array
 * @param {string} key
 * @returns {any[]}
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export function remove_duplicate_by_key(array: any[], key: string): any[] {
  return Object.values(
    array.reduce(
      (acc, item) => (
        item && item[key] && (acc[item[key]] = item), acc
      ), // using object mutation (faster)
      {}
    )
  )
}

/**
 * 
 * 
 * @param {any[]} array
 * @returns {boolean}
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export function has_duplicates(array: any[]): boolean {
  return array.some(
    (val, i) => array.indexOf(val) !== i
  )
}

/**
 * 
 * 
 * @param {any[]} array
 * @param {string} key
 * @returns {boolean}
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export function has_duplicates_by_key(array: any[], key: string): boolean {
  const keys: any[] = []
  for (const item of array) {
    if (keys.includes(item[key]))
      return true
    keys.push(item[key])
  }
  return false
}

/**
 * 
 * 
 * @param {string} password
 * @returns {boolean}
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export function check_password_strength(password: string): boolean {
  const pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
  return pattern.test(password);
}

/**
 * 
 * 
 * @param {string} str
 * @returns {boolean}
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export function is_empty_or_spaces(str: string): boolean {
  return str === null || str.match(/^ *$/) !== null;
}

/**
 * 
 * @param {string} str
 * @returns {boolean}
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export function starts_with_space(str: string): boolean {
  return str.indexOf(str.trim()) != 0;
}

/**
 * 
 * 
 * @param {string} string
 * @returns {string}
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export function sanitize_umlauts(string: string): string {
  const umlauts = [{
    'base': 'Ae',
    'letters': 'Ä'
  },
  {
    'base': 'Oe',
    'letters': 'Ö'
  },
  {
    'base': 'Ue',
    'letters': 'Ü'
  },
  {
    'base': 'ss',
    'letters': 'ß'
  },
  {
    'base': 'ae',
    'letters': 'ä'
  },
  {
    'base': 'oe',
    'letters': 'ö'
  },
  {
    'base': 'ue',
    'letters': 'ü'
  },
  {
    'base': 'Aa',
    'letters': 'Å'
  },
  {
    'base': 'Ae',
    'letters': 'Æ'
  },
  {
    'base': 'O',
    'letters': 'Ø'
  },
  {
    'base': 'aa',
    'letters': 'å'
  },
  {
    'base': 'a',
    'letters': 'æ'
  },
  {
    'base': 'o',
    'letters': 'ø'
  },
  ]

  for (const _x of string) {
    for (const umlaut of umlauts) {
      string = string.replace(umlaut.letters, umlaut.base)
    }
  }
  return string
}


/**
 * An array of allowed encodings
 * 
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export const allowed_encodings: string[] = [
  "ascii",
  "utf8",
  "utf-8",
  "utf16le",
  "ucs2",
  "ucs-2",
  "base64",
  "latin1",
  "binary",
  "hex"
]

/**
 * An array of allowed delimiters
 * 
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export const allowed_delimiters: string[] = [
  ",",
  ";",
  "|",
  "$"
]
