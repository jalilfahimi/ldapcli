import prompts from 'prompts';
import util from "util";
import { LdapClient } from '../../classes/ldap/LdapClient';

const questions: prompts.PromptObject<string>[] = [
    {
        type: 'select',
        name: 'type',
        message: 'How do you want to perform your search?',
        choices: [
            { title: 'DN', value: 'dn' },
            { title: 'Attribute', value: 'att' },
        ],
    },
    {
        type: prev => prev == 'dn' ? 'text' : null,
        name: 'dnValue',
        message: 'Please type in the dn of the object:'
    },
    {
        type: prev => prev == 'att' ? 'text' : null,
        name: 'attName',
        message: 'Please type in the attribute name:'
    },
    {
        type: (prev, values) => values.type == 'att' ? 'text' : null,
        name: 'attValue',
        message: 'Please type in the attribute value:'
    }
];

(async () => {
    try {
        const ldap = new LdapClient()
        const context = ldap.base_dn

        let objects
        const response = await prompts(questions, { onCancel: () => process.exit(0) });
        if (response.type === 'dn') {
            if (response.dnValue === '' || !response.dnValue.includes('=')) {
                console.log('Invalid value.')
                process.exit(1)
            }
            const rdn = ldap.get_rdn_from_dn(response.dnValue)
            objects = (await ldap.get_objects_by_fields([{ field: rdn.rdn, value: rdn.value }], context)).filter(e => e.dn === response.dnValue)
        } else {
            objects = await ldap.get_objects_by_fields([{ field: response.attName, value: response.attValue }], context)
        }

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

