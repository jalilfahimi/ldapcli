import { LdapManagerError } from "./LdapManagerError"


/**
 * ReferenceError class
 * 
 * @copyright (c) 2021 Jalil Fahimi
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export class ReferenceError extends LdapManagerError {
    constructor(msg: string) {
        super(404, 'REFRENCE_ERROR', msg)
    }
}