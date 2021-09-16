import { SearchEntryObject } from "ldapjs"

/**
 * Returns the ldif string of the given objects.
 * 
 * @param {SearchEntryObject[]} entries
 * @returns {string}
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export function ldif(entries: SearchEntryObject[]): string {
    try {
        let content = ''
        let i = 0

        content += '# LDIF export'
        content += '\n'
        content += `# Search Scope: sub`
        content += '\n'
        content += `# Search Filter: (objectClass=*)`
        content += '\n'
        content += `# Entries: ${entries.length}`
        content += '\n'
        content += '\n'
        content += 'version: 1'
        content += '\n'

        for (const entry of entries) {
            i++

            content += '\n'
            content += `# Entry ${i}: ${entry.dn}`
            content += '\n'

            for (const [key, value] of Object.entries(entry)) {
                if (key === 'controls') continue
                if (typeof value === 'string') {
                    content += key + ': ' + value + '\n'
                }

                if (typeof value === 'object') {
                    for (const v of value) {
                        content += key + ': ' + v + '\n'
                    }
                }
            }
        }

        return content
    } catch (e) {
        console.log(e)
        throw e
    }
}

/**
 * 
 * @param {string | string[]} value 
 * @param {string[]} extra_chars 
 * @returns {{ valid: boolean, invalid_character: string }}
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export function validatate_forbidden_characters(value: string | string[], extra_chars?: string[]): { valid: boolean, invalid_character: string } {
    const forbidden_characters = [
        '&',
        '|',
        '!',
        '*',
        '?',
        '^',
        '~',
        ':',
        ';',
        '=',
        '[',
        ']',
        '{',
        '}',
        '<',
        '>',
        '(',
        ')'
    ]

    if (extra_chars) {
        for (const extra_char of extra_chars) {
            if (!forbidden_characters.includes(extra_char)) {
                forbidden_characters.push(extra_char)
            }
        }
    }

    if (typeof value === 'string') {
        for (const c of forbidden_characters) {
            if (value.includes(c)) {
                return { valid: false, invalid_character: c }
            }
        }
    }
    if (typeof value === 'object') {
        for (const v in value) {
            for (const fc of forbidden_characters) {
                if (v.includes(fc)) {
                    return { valid: false, invalid_character: fc }
                }
            }
        }
    }
    return { valid: true, invalid_character: '' }
}