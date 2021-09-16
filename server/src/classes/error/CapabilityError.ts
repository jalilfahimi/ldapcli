import { LdapManagerError } from "./LdapManagerError"


/**
 * CapabilityError class
 * 
 * @copyright (c) 2021 Jalil Fahimi
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export class CapabilityError extends LdapManagerError {
    constructor(msg: string) {
        super(403, 'CAPABILITY_ERROR', msg)
    }
}