import { SearchEntryObject } from 'ldapjs'
import { LdapManagerError } from "./LdapManagerError"


/**
 * ServerError class
 * 
 * @copyright (c) 2021 Jalil Fahimi
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export class ServerError extends LdapManagerError {
    private msg: string
    constructor(msg: string) {
        super(500, 'SERVER_ERROR', msg)
        this.msg = msg
    }

    /**
     * This function creates an error record and saves it into the database. 
     * 
     * @param {SearchEntryObject} operator
     * @param {string} dn
     * @returns {void} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    async create_server_error(operator: SearchEntryObject, dn: string): Promise<void> {
        try {
            const type = 'SERVER_ERROR'
            const time = Date.now()
            const record = {
                id: 0,
                type,
                message: this.message,
                operator: Number(operator.cn),
                time,
                dn
            }
        } catch (e) {
            console.log(e)
            throw e
        }
    }
}