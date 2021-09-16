import { LdapManagerError } from "./LdapManagerError"


/**
 * ParameterError class
 * 
 * @copyright (c) 2021 Jalil Fahimi
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export class ParameterError extends LdapManagerError {
    constructor(msg: string, code: number) {
        super(code, 'PARAMETER_ERROR', msg)
    }
}