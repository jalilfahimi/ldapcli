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
        name: 'attributeType',
        message: 'Please type in the attributeType:',
    }
];

(async () => {
    try {
        const ldap = new LdapClient()
        const response = await prompts(questions, { onCancel: () => process.exit(0) });
        if (response.attributeType.length < 1) {
            console.log('Invalid input.')
            process.exit(1)
        }

        const attributeType_exists = await ldap.attributeType_exists(response.attributeType)
        if (attributeType_exists) {
            const attributeType = await ldap.get_attributeType(response.attributeType)
            console.log('The specifications of the attributeType:')
            console.log(util.inspect(attributeType, false, null, true))
        }  else {
            console.log('The requested attributeType does not exist.')
        }

    } catch (e) {
        console.log(util.inspect(e, false, null, true))
        process.exit(1)
    }
})();

