/**
 * LdapManagerError class
 * 
 * @copyright (c) 2021 Jalil Fahimi
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export abstract class LdapManagerError extends Error {
    private status: number
    private type: string
    constructor(status: number, type: string, msg: string) {
        super()
        this.status = status
        this.type = type
        this.message = msg
    }

    /**
     * Builds an api response.
     * 
     * @returns {{ status: number, error: { type: string, message: string } }}
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    build_api_response(): { status: number, error: { type: string, message: string } } {
        try {
            return {
                status: this.status,
                error: this.build_error()
            }
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
     * Builds an error
     * 
     * @returns {{ type: string, message: string }}
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    build_error(): { type: string, message: string } {
        try {
            return {
                type: this.type,
                message: this.message
            }
        } catch (e) {
            console.log(e)
            throw e
        }
    }
}