import { LdapManagerError } from "./LdapManagerError"


/**
 * AuthorizationError class
 * 
 * @copyright (c) 2021 Jalil Fahimi
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export class AuthorizationError extends LdapManagerError {
    constructor(msg: string) {
        super(401, 'AUTHORIZATION_ERROR', msg)
    }
}