import prompts from 'prompts';
import util from "util";
import { LdapClient } from '../../classes/ldap/LdapClient';
import { SearchScopes } from '../../definitions/LDAP/SearchScopes.type';

const scopes = []
for (const scope of SearchScopes) {
    scopes.push({
        title: scope,
        value: scope
    })
}

const questions: prompts.PromptObject<string>[] = [
    {
        type: 'text',
        name: 'query',
        message: 'Please type in your search query:',
    },
    {
        type: 'select',
        name: 'scope',
        message: 'Please choose your search scope:',
        choices: scopes
    },
];

(async () => {
    try {
        const ldap = new LdapClient()
        const context = ldap.base_dn

        const response = await prompts(questions, { onCancel: () => process.exit(0) });
        if (!response.query.includes('=') || response.query.includes('#')) {
            console.log('Invalid query.')
            process.exit(1)
        }
        const objects = await ldap.search_raw(response.query, response.scope, context)

        if (objects.length) {
            console.log(`Found ${objects.length} object${objects.length > 1 ? 's' : ''}:`)
            console.log(util.inspect(objects, false, null, true))
        } else {
            console.log(`No object matches your search.`)
        }
    } catch (e) {
        console.log(util.inspect(e, false, null, true))
        process.exit(1)
    }
})();

