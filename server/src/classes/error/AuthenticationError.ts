import { LdapManagerError } from "./LdapManagerError"


/**
 * AuthenticationError class
 * 
 * @copyright (c) 2021 Jalil Fahimi
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export class AuthenticationError extends LdapManagerError {
    constructor(msg: string) {
        super(403, 'AUTHENTICATION_ERROR', msg)
    }
}