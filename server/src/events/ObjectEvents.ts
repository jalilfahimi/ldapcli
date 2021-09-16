import { SearchEntryObject } from "ldapjs";
import { ServerError } from "../classes/error/ServerError";
import { LdapClient } from "../classes/ldap/LdapClient";
import { BaseEvents } from "./BaseEvents";


/**
 * BaseEvents class
 * 
 * @copyright (c) 2021 Jalil Fahimi
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export class ObjectEvents extends BaseEvents {

    /**
     * 
     * 
     * @param {string} dn
     * @param {Record<string, unknown>} entry_raw 
     * @returns {void} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    async create(dn: string, entry_raw: Record<string, unknown>): Promise<void> {
        try {
            const ldap_client = new LdapClient()

            const entry = Object.assign(entry_raw)
            for (const [key, value] of Object.entries(entry)) {
                if (!value)
                    delete entry[key]
            }

            const create_action = await ldap_client.create(dn, entry)
            if (Object.prototype.hasOwnProperty.call(create_action, 'lde_message')) {
                new ServerError(create_action)
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
    async delete(object: SearchEntryObject): Promise<void> {
        try {
            const ldap_client = new LdapClient()
            const change_actions = await ldap_client.delete(object)
            if (Object.prototype.hasOwnProperty.call(change_actions, 'lde_message')) {
                new ServerError(change_actions.toString())
            }
        } catch (e) {
            console.log(e)
        }
    }
}