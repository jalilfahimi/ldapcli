import prompts from 'prompts';
import util from "util";
import { LdapClient } from '../../classes/ldap/LdapClient';
import { ObjectEvents } from '../../events/ObjectEvents';

const questions: prompts.PromptObject<string>[] = [
    {
        type: 'text',
        name: 'dnValue',
        message: 'Please type in the dn of the object:'
    }
];

(async () => {
    try {
        const ldap = new LdapClient()
        const e = new ObjectEvents()
        const context = ldap.base_dn

        const response = await prompts(questions, { onCancel: () => process.exit(0) });
        if (response.dnValue === '' || !response.dnValue.includes('=')) {
            console.log('Invalid value.')
            process.exit(1)
        }
        const rdn = ldap.get_rdn_from_dn(response.dnValue)
        const objects = await ldap.get_objects_by_fields([{ field: rdn.rdn, value: rdn.value }], context)
        if (objects.length) {
            const object = objects.filter(e => e.dn === response.dnValue)[0]
            if (await ldap.has_direct_children(object.dn, 'objectclass=*')) {
                const children = await ldap.get_everything(object.dn)

                const questions: prompts.PromptObject<string>[] = [
                    {
                        type: 'select',
                        name: 'recursive',
                        message: `Should the action be performed recursively and delete all ${children.length} sub entries?`,
                        choices: [
                            { title: 'Yes', value: 'yes' },
                            { title: 'No', value: 'no' },
                        ],
                    }
                ];

                const response = await prompts(questions, { onCancel: () => process.exit(0) });
                if (response.recursive == 'no') {
                    console.log('Canceled.')
                    process.exit(1)
                }

                const reversed = children.reverse()
                for (const child of reversed) {
                    console.log(`Deleting object with dn: ${child.dn}`)
                    await e.delete(child)
                }
            } else {
                console.log(`Deleting object with dn: ${object.dn}`)
                await e.delete(object)
            }
        } else {
            console.log(`No object matches the dn.`)
        }
    } catch (e) {
        console.log(util.inspect(e, false, null, true))
        process.exit(1)
    }
})();