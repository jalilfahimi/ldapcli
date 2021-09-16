import { LdapManagerError } from "./LdapManagerError"


/**
 * FileError class
 * 
 * @copyright (c) 2021 Jalil Fahimi
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export class FileError extends LdapManagerError {
    constructor(msg: string) {
        super(400, 'FILE_ERROR', msg)
    }
}