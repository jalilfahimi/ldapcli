import prompts from 'prompts';
import util from "util";
import { LdapClient } from '../../classes/ldap/LdapClient';
import { ObjectEvents } from '../../events/ObjectEvents';

(async () => {
    try {
        const ldap = new LdapClient()
        const e = new ObjectEvents()
        const context = ldap.base_dn

        const all = await ldap.get_everything(context)
        const choices = []
        for (const object of all) {
            choices.push({

                title: object.dn, value: object.dn

            })
        }

        const pre_questions: prompts.PromptObject<string>[] = [
            {
                type: 'select',
                name: 'context',
                message: 'Please choose a context:',
                choices
            }
        ];

        const pre_response = await prompts(pre_questions, { onCancel: () => process.exit(0) });
        const context_dn: string = pre_response.context

        const objectclass_question: prompts.PromptObject<string>[] = [
            {
                type: 'text',
                name: 'objectclasses',
                message: 'Please type in objectclasses in comma separated format:',
            }
        ];

        const objectclass_response = await prompts(objectclass_question, { onCancel: () => process.exit(0) });
        if (objectclass_response.objectclasses == '') {
            console.log('Invalid input.')
            process.exit(1)
        }
        const objectclasses: string[] = objectclass_response.objectclasses.split(',')

        let has_structural = false
        const objectClass: string[] = ['top']
        const required_and_optional: string[] = []
        const required: string[] = []
        const optional: string[] = []

        for (const objectclass of objectclasses) {
            if (objectclass === '') continue
            if (!await ldap.objectclass_exists(objectclass)) {
                console.log(`The objectclass '${objectclass}' does not exist.`)
                process.exit(1)
            }
            if (await ldap.objectclass_is_structural(objectclass)) {
                has_structural = true
            }

            let parents: string[];
            if (objectclass.toLowerCase() === 'top') {
                parents = []
            } else {
                parents = await ldap.get_objectclass_parents(objectclass)
            }

            const attributes = await ldap.get_objectclass_attributes(objectclass, parents)
            for (const _required of attributes.required) {
                if (required_and_optional.includes(_required)) continue
                required.push(_required)
                required_and_optional.push(_required)
            }

            for (const _optional of attributes.optional) {
                if (required_and_optional.includes(_optional)) continue
                optional.push(_optional)
                required_and_optional.push(_optional)
            }

            if (objectClass.includes(objectclass.toLocaleLowerCase())) continue
            objectClass.push(objectclass.toLocaleLowerCase())
        }

        if (!has_structural) {
            const question: prompts.PromptObject<string>[] = [
                {
                    type: 'text',
                    name: 'objectclass',
                    message: 'Please type in a structual objectclass:',
                }
            ];

            const response = await prompts(question, { onCancel: () => process.exit(0) });
            const objectclass = response.objectclass
            if (!await ldap.objectclass_exists(objectclass)) {
                console.log(`The objectclass '${objectclass}' does not exist.`)
                process.exit(1)
            }
            if (!await ldap.objectclass_is_structural(objectclass)) {
                console.log(`The objectclass '${objectclass}' is not structural.`)
                process.exit(1)
            }

            let parents: string[];
            if (objectclass.toLowerCase() === 'top') {
                parents = []
            } else {
                parents = await ldap.get_objectclass_parents(objectclass)
            }

            const attributes = await ldap.get_objectclass_attributes(objectclass, parents)
            for (const _required of attributes.required) {
                if (required_and_optional.includes(_required)) continue
                required.push(_required)
                required_and_optional.push(_required)
            }

            for (const _optional of attributes.optional) {
                if (required_and_optional.includes(_optional)) continue
                optional.push(_optional)
                required_and_optional.push(_optional)
            }

            objectClass.push(objectclass.toLocaleLowerCase())
        }

        const questions: prompts.PromptObject<string>[] = []
        for (const _required of required) {
            if (_required.toLocaleLowerCase() === 'objectclass') continue
            questions.push({
                type: 'text',
                name: _required,
                message: `Please type in a value for the required attribute ${_required}:`,
            })
        }

        for (const _optional of optional) {
            if (_optional.toLocaleLowerCase() === 'objectclass') continue
            questions.push({
                type: 'text',
                name: _optional,
                message: `Please type in a value for the optional attribute ${_optional}: (Leave empty to ignore)`,
            })
        }

        const response = await prompts(questions, { onCancel: () => process.exit(0) });

        const dn_question: prompts.PromptObject<string>[] = []

        const possible_dns = []
        for (const _required of required) {
            if (_required.toLocaleLowerCase() === 'objectclass') {
                for (const objectclass of objectClass) {
                    const value = _required + '=' + objectclass + ',' + context_dn
                    possible_dns.push({
                        title: value, value
                    })
                }
            } else {
                const value = _required + '=' + response[_required] + ',' + context_dn
                possible_dns.push({
                    title: value, value
                })
            }
        }

        dn_question.push({
            type: 'select',
            name: 'dn',
            message: 'Please choose a dn:',
            choices: possible_dns
        })

        const dn_response = await prompts(dn_question, { onCancel: () => process.exit(0) });
        const dn = dn_response.dn

        response.objectClass = objectClass
        console.log(response)
        await e.create(dn, response)

    } catch (e) {
        console.log(util.inspect(e, false, null, true))
        process.exit(1)
    }
})();