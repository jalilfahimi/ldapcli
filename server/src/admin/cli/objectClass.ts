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
        name: 'objectclass',
        message: 'Please type in the objectclass:',
    }
];

(async () => {
    try {
        const ldap = new LdapClient()
        const response = await prompts(questions, { onCancel: () => process.exit(0) });
        if (response.objectclass.length < 1) {
            console.log('Invalid input.')
            process.exit(1)
        }

        const objectclass_exists = await ldap.objectclass_exists(response.objectclass)
        if (objectclass_exists) {
            const objectclass = await ldap.get_objectclass(response.objectclass)
            let parents;
            if (response.objectclass.toLowerCase() === 'top') {
                parents = { parents: [] }
            } else {
                parents = { parents: await ldap.get_objectclass_parents(response.objectclass) }
            }
            const attributes = { attributes: await ldap.get_objectclass_attributes(response.objectclass, parents.parents) }

            console.log('The specifications of the objectclass:')
            console.log(util.inspect(objectclass, false, null, true))
            console.log(util.inspect(attributes, false, null, true))
            console.log(util.inspect(parents, false, null, true))

        } else {
            console.log('The requested objectclass does not exist.')
        }

    } catch (e) {
        console.log(util.inspect(e, false, null, true))
        process.exit(1)
    }
})();

