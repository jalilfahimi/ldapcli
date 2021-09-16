import { SearchEntryObject, Change } from "ldapjs"
import { ServerError } from "../classes/error/ServerError"
import { LdapClient } from "../classes/ldap/LdapClient"
import { CRUD } from "../definitions/types/CRUD.type"
import { LOGGER } from "../lib/log/lib"

/**
 * BaseEvents class
 * 
 * @copyright (c) 2021 Jalil Fahimi
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export abstract class BaseEvents {


    /**
     * 
     * @param {SearchEntryObject} object 
     * @param {Change[]} changes
     * @returns {void} 
     * @author Jalil Fahimi (jfahimi@multamedio.de)
     */
    async extended(object: SearchEntryObject, changes: Change[]): Promise<void> {
        try {
            const ldap_client = new LdapClient()
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
     * 
     * @param {string} operand
     * @param {CRUD} crud 
     * @param {string} data
     * @param {string} laststate
     * @returns {void} 
     * @author Jalil Fahimi (jfahimi@multamedio.de)
     */
    async log(operand: string, crud: CRUD, data?: string, laststate?: string): Promise<void> {
        try {

            const record = {
                operand,
                crud,
                data: data ? data : '{}',
                laststate: laststate ? laststate : '{}',
                time: Date.now()
            }

            LOGGER.info(record)
        } catch (e) {
            console.log(e)
        }
    }
}