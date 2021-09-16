import { SearchEntryObject, Change } from "ldapjs";
import { ServerError } from "../classes/error/ServerError";
import { LdapClient } from "../classes/ldap/LdapClient";
import { BaseEvents } from "./BaseEvents";


/**
 * AttributeEvents class
 * 
 * @copyright (c) 2021 Jalil Fahimi
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export class AttributeEvents extends BaseEvents {

    /**
     * 
     * @param {SearchEntryObject} object 
     * @param {string} field
     * @param {string} value
     * @returns {void} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    async add(object: SearchEntryObject, field: string, value: string): Promise<void> {
        try {
            const ldap_client = new LdapClient()
            const changes: Change[] = []

            changes.push(new Change({
                operation: 'add',
                modification: {
                    [field]: value
                }
            }))

            const change_actions = await ldap_client.update(object, changes)
            if (Object.prototype.hasOwnProperty.call(change_actions, 'lde_message')) {
                new ServerError(change_actions.toString())
            }
        } catch (e) {
            console.log(e)
        }
    }

    /**
     * 
     * @param {SearchEntryObject} object 
     * @param {string} field
     * @returns {void} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    async delete(object: SearchEntryObject, field: string): Promise<void> {
        try {
            const ldap_client = new LdapClient()
            const changes: Change[] = []

            changes.push(new Change({
                operation: 'delete',
                modification: {
                    [field]: object[field]
                }
            }))

            const change_actions = await ldap_client.update(object, changes)
            if (Object.prototype.hasOwnProperty.call(change_actions, 'lde_message')) {
                new ServerError(change_actions.toString())
            }
        } catch (e) {
            console.log(e)
        }
    }

    /**
     * 
     * @param {SearchEntryObject} object 
     * @param {string} field
     * @param {string} value
     * @returns {void} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    async replace(object: SearchEntryObject, field: string, value: string): Promise<void> {
        try {
            if (object[field] && object[field] !== value) {
                const ldap_client = new LdapClient()
                const changes: Change[] = []

                changes.push(new Change({
                    operation: 'replace',
                    modification: {
                        [field]: value
                    }
                }))

                const change_actions = await ldap_client.update(object, changes)
                if (Object.prototype.hasOwnProperty.call(change_actions, 'lde_message')) {
                    new ServerError(change_actions.toString())
                }
            }
        } catch (e) {
            console.log(e)
        }
    }
}