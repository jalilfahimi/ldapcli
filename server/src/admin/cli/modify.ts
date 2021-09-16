import { Change, SearchEntryObject } from 'ldapjs';
import prompts from 'prompts';
import util from "util";
import { LdapClient } from '../../classes/ldap/LdapClient';
import { AttributeEvents } from '../../events/AttributeEvents';

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
        const e = new AttributeEvents()
        const context = ldap.base_dn

        const response = await prompts(questions, { onCancel: () => process.exit(0) });
        if (response.dnValue === '') {
            console.log('Invalid value.')
            process.exit(1)
        }
        const rdn = ldap.get_rdn_from_dn(response.dnValue)
        const objects = await ldap.get_objects_by_fields([{ field: rdn.rdn, value: rdn.value }], context)
        if (objects.length) {
            const object = objects.filter(e => e.dn === response.dnValue)[0]
            if (object) {
                const required: string[] = []
                const optional: string[] = []

                let dn = response.dnValue

                if (typeof object.objectClass === 'string') {
                    const parents = await ldap.get_objectclass_parents(object.objectClass)
                    const atts = await ldap.get_objectclass_attributes(object.objectClass, parents)
                    for (const requiredOfParent of atts.required) {
                        if (required.includes(requiredOfParent)) continue
                        required.push(requiredOfParent)
                    }

                    for (const optionalOfParent of atts.optional) {
                        if (optional.includes(optionalOfParent)) continue
                        optional.push(optionalOfParent)
                    }
                }
                if (typeof object.objectClass === 'object') {
                    for (const objectclass of object.objectClass) {
                        const parents = await ldap.get_objectclass_parents(objectclass)
                        const atts = await ldap.get_objectclass_attributes(objectclass, parents)
                        for (const requiredOfParent of atts.required) {
                            if (required.includes(requiredOfParent)) continue
                            required.push(requiredOfParent)
                        }

                        for (const optionalOfParent of atts.optional) {
                            if (optional.includes(optionalOfParent)) continue
                            optional.push(optionalOfParent)
                        }
                    }
                }

                const oKeys = Object.keys(object)

                const choices_for_add = []
                for (const att of required) {
                    if (await ldap.attributeType_is_single_value(att) && oKeys.includes(att)) continue
                    choices_for_add.push({ title: att, value: att })
                }
                for (const att of optional) {
                    if (await ldap.attributeType_is_single_value(att) && oKeys.includes(att)) continue
                    choices_for_add.push({ title: att, value: att })
                }

                const choices = []
                const choices_for_delete = []
                base:
                for (const key of oKeys) {
                    if (key === 'dn' || key === 'controls') continue
                    choices.push({ title: key, value: key })
                    for (const k of required) {
                        if (k.toLowerCase() === key.toLowerCase()) continue base
                    }
                    choices_for_delete.push({ title: key, value: key })
                }

                const choices_for_action = [
                    {
                        title: 'replace', value: 'replace'
                    }
                ]
                if (choices_for_add.length > 0) {
                    choices_for_action.push({
                        title: 'add', value: 'add'
                    })
                }
                if (choices_for_delete.length > 0) {
                    choices_for_action.push({
                        title: 'delete', value: 'delete'
                    })
                }
                const questions: prompts.PromptObject<string>[] = [
                    {
                        type: 'select',
                        name: 'action',
                        message: 'Which action do you want to perform?',
                        choices: choices_for_action
                    },
                    {
                        type: prev => prev == 'replace' ? 'select' : null,
                        name: 'att',
                        message: 'Which attribute do you want to replace?',
                        choices
                    },
                    {
                        type: (prev, values) => values.action == 'replace' ? 'text' : null,
                        name: 'attValue',
                        message: 'Please type in the attribute value',
                    },
                    {
                        type: (prev, values) => values.action == 'delete' ? 'select' : null,
                        name: 'att',
                        message: 'Which attribute do you want to delete?',
                        choices: choices_for_delete
                    },
                    {
                        type: (prev, values) => values.action == 'add' ? 'select' : null,
                        name: 'att',
                        message: 'Please select the attribute:',
                        choices: choices_for_add
                    },
                    {
                        type: (prev, values) => values.action == 'add' ? 'text' : null,
                        name: 'attValue',
                        message: 'Please type in the attribute value:',
                    }
                ];
                (async () => {
                    try {
                        const response = await prompts(questions, { onCancel: () => process.exit(0) });
                        if (response.action == 'add') {
                            if (response.att.toLowerCase() === 'objectclass') {
                                await modified_objectclass(response.attValue, object, 'add')
                            } else {
                                await e.add(object, response.att, response.attValue)
                            }
                        }
                        if (response.action == 'replace') {
                            if (response.att.toLowerCase() === 'objectclass') {
                                await modified_objectclass(response.attValue, object, 'replace')
                            } else {
                                const rdn = ldap.get_rdn_from_dn(object.dn)
                                const oldDnLike = rdn.rdn + '=' + rdn.value
                                if (object.dn.includes(oldDnLike)) {
                                    const dnLike = response.att + '=' + response.attValue
                                    const newDn = dn.replace(oldDnLike, dnLike)
                                    dn = newDn
                                    await ldap.update_dn(object, newDn)
                                } else {
                                    await e.replace(object, response.att, response.attValue)
                                }
                            }
                        }
                        if (response.action == 'delete') {
                            const dnLike = response.att + '=' + response.attValue
                            if (object.dn.includes(dnLike)) {
                                console.log(`The attribute ${response.att} cannot be deleted because it is a part of the dn.`)
                                process.exit(1)
                            }
                            await e.delete(object, response.att)
                        }

                        const new_rdn = ldap.get_rdn_from_dn(dn)
                        const objects = await ldap.get_objects_by_fields([{ field: new_rdn.rdn, value: new_rdn.value }], context)
                        const refreshed = objects.filter(e => e.dn === dn)[0]
                        console.log('#'.repeat(75))
                        console.log('#'.repeat(75))
                        console.log('The result of your changes:')
                        console.log(util.inspect(refreshed, false, null, true))
                    } catch (e) {
                        console.log(util.inspect(e, false, null, true))
                        process.exit(1)
                    }
                })();

            }
            else {
                console.log(`No object matches the dn.`)
            }
        } else {
            console.log(`No object matches the dn.`)
        }
    } catch (e) {
        console.log(util.inspect(e, false, null, true))
        process.exit(1)
    }
})();


async function modified_objectclass(objectclass: string, object: SearchEntryObject, operation: 'add' | 'replace'): Promise<void> {
    try {
        if (object.objectClass && operation === 'add') {
            if (typeof object.objectClass === 'string') {
                if (object.objectClass.toLowerCase() === objectclass.toLowerCase()) {
                    console.log(`The objectclass ${objectclass} is already linked.`)
                    process.exit(1)
                }
            }
            if (typeof object.objectClass === 'object') {
                for (const objectClass of object.objectClass) {
                    if (objectClass.toLowerCase() === objectclass.toLowerCase()) {
                        console.log(`The objectclass ${objectclass} is already linked.`)
                        process.exit(1)
                    }
                }
            }
        }
        const ldap = new LdapClient()
        const e = new AttributeEvents()

        const objectclass_exists = await ldap.objectclass_exists(objectclass)
        if (objectclass_exists) {
            const objectClassV = [objectclass]
            if (!objectClassV.includes('top')) objectClassV.push('top')

            const parents = await ldap.get_objectclass_parents(objectclass)
            const atts = await ldap.get_objectclass_attributes(objectclass, parents)
            const questions: prompts.PromptObject<string>[] = []

            if (operation === 'replace' && !await ldap.objectclass_is_structural(objectclass)) {
                questions.push({
                    type: 'text',
                    name: 'structural',
                    message: 'Please type in your new structural class:',
                })

                const response = await prompts(questions, { onCancel: () => process.exit(0) });

                if (!await ldap.objectclass_exists(response.structural)) {
                    console.log(`The objectclass ${response.structural} does not exist.`)
                    process.exit(1)
                }
                if (!await ldap.objectclass_is_structural(response.structural)) {
                    console.log(`The objectclass ${response.structural} ist not structural.`)
                    process.exit(1)
                }
                objectClassV.push(response.structural)
                questions.pop()
            }

            const required_and_optional: string[] = []

            for (const required of atts.required) {
                if (required.toLocaleLowerCase() === 'objectclass') continue
                if (required_and_optional.includes(required)) continue
                required_and_optional.push(required)
                questions.push({
                    type: 'text',
                    name: required,
                    message: `Please type in a value for the required attribute ${required}:`,
                })
            }

            for (const optional of atts.optional) {
                if (optional.toLocaleLowerCase() === 'objectclass') continue
                if (required_and_optional.includes(optional)) continue
                required_and_optional.push(optional)
                questions.push({
                    type: 'text',
                    name: optional,
                    message: `Please type in a value for the optional attribute ${optional}: (Leave empty to ignore)`,
                })
            }

            const response = await prompts(questions, { onCancel: () => process.exit(0) });
            const changes: Change[] = []

            changes.push(new Change({
                operation,
                modification: {
                    objectClass: objectClassV
                }
            }))

            const entry = Object.assign(response)
            for (const key of Object.keys(entry)) {
                if (!entry[key] || entry[key].length < 1) continue
                if (object[key]) {
                    if (entry[key] !== object[key]) {
                        changes.push(new Change({
                            operation: 'replace',
                            modification: {
                                [key]: entry[key]
                            }
                        }))
                    }
                } else {
                    changes.push(new Change({
                        operation: 'add',
                        modification: {
                            [key]: entry[key]
                        }
                    }))
                }
            }

            await e.extended(object, changes)
        } else {
            console.log(`The objectclass ${objectclass} does not exist.`)
            process.exit(1)
        }
    } catch (e) {
        console.log(e)
        throw e
    }
}

