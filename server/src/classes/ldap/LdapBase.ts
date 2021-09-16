import { SearchEntryObject, Change, SearchOptions, Client, createClient } from 'ldapjs'
import config from "../../config/ldapconfig.json"


/**
 * LdapBase class
 * This abstract class contains all necessary functions and attributes for ldap binding, unbinding, searching, adding, modifying and deleting actions.
 * 
 * @copyright (c) 2021 Jalil Fahimi
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export abstract class LdapBase {
    readonly url = config.url
    readonly schema = config.schema
    readonly bind_dn = config.bind_dn
    readonly bind_pw = config.bind_pw

    /**
     * Performs a bind action against the LDAP server
     *
     * @returns {Client}
     * @author Jalil Fahimi (jfahimi@multamedio.de)
     */
    private connect(): Client {
        return createClient({
            url: this.url,
            tlsOptions: true
        })
    }

    /**
     * Performs an unbind action against the LDAP server
     *
     * @param {Client} client
     * @returns {void}
     * @author Jalil Fahimi (jfahimi@multamedio.de)
     */
    private disconnect(client: Client): void {
        return client.unbind(function (err) {
            if (err) {
                console.log(err)
                console.log('Error occurred while binding')
                return (err)
            }
        })
    }

    /**
     * Performs a bind action against the LDAP server 
     *
     * @param {string} dn
     * @param {string} password
     * @returns {boolean} entries
     * @author Jalil Fahimi (jfahimi@multamedio.de)
     */
    protected async bind(dn: string, password: string): Promise<boolean> {
        const client = this.connect()
        return new Promise((resolve) => {
            client.bind(dn, password, async (err) => {
                if (err) {
                    this.disconnect(client)
                    return resolve(false)
                } else {
                    this.disconnect(client)
                    return resolve(true)
                }
            })
        })
    }

    /**
     * Performs a create action against the LDAP server
     *
     * @param {string} dn
     * @param {object} entry
     * @returns {string}
     * @author Jalil Fahimi (jfahimi@multamedio.de)
     */
    protected async create_object(dn: string, entry: Record<string, unknown>): Promise<string> {
        const client = this.connect()
        return new Promise((resolve, reject) => {
            client.bind(this.bind_dn, this.bind_pw, async (err) => {
                if (err) {
                    console.log(err)
                    console.log('Error occurred while binding')
                    return (err)
                } else {
                    client.add(dn, entry, (err) => {
                        if (err) {
                            this.disconnect(client)
                            return reject(err)
                        }
                        this.disconnect(client)
                        return resolve(dn)
                    })
                }
            })
        })
    }

    /**
     * Performs an update action against the LDAP server
     *
     * @param {string} dn
     * @param {Change} changes
     * @returns {string}
     * @author Jalil Fahimi (jfahimi@multamedio.de)
     */
    protected async update_object(dn: string, changes: Change | Change[]): Promise<string> {
        const client = this.connect()
        return new Promise((resolve, reject) => {
            client.bind(this.bind_dn, this.bind_pw, async (err) => {
                if (err) {
                    console.log(err)
                    console.log('Error occurred while binding')
                    return (err)
                } else {
                    client.modify(dn, changes, (err) => {
                        if (err) {
                            this.disconnect(client)
                            return reject(err)
                        }
                        this.disconnect(client)
                        return resolve('success')
                    })
                }
            })
        })
    }

    /**
     * Performs a modifyDN action against the LDAP server
     *
     * @param {string} old_dn
     * @param {string} new_dn
     * @returns {string}
     * @author Jalil Fahimi (jfahimi@multamedio.de)
     */
    protected async update_object_dn(old_dn: string, new_dn: string): Promise<string> {
        const client = this.connect()
        return new Promise((resolve, reject) => {
            client.bind(this.bind_dn, this.bind_pw, async (err) => {
                if (err) {
                    console.log(err)
                    console.log('Error occurred while binding')
                    return (err)
                } else {
                    client.modifyDN(old_dn, new_dn, (err) => {
                        if (err) {
                            this.disconnect(client)
                            return reject(err)
                        }
                        this.disconnect(client)
                        return resolve(new_dn)
                    })
                }
            })
        })
    }

    /**
     * Performs a delete action against the LDAP server
     *
     * @param {string} dn
     * @returns {string}
     * @author Jalil Fahimi (jfahimi@multamedio.de)
     */
    protected async delete_object(dn: string): Promise<string> {
        const client = this.connect()
        return new Promise((resolve, reject) => {
            client.bind(this.bind_dn, this.bind_pw, async (err) => {
                if (err) {
                    console.log(err)
                    console.log('Error occurred while binding')
                    return (err)
                } else {
                    client.del(dn, (err) => {
                        if (err) {
                            this.disconnect(client)
                            return reject(err)
                        }
                        this.disconnect(client)
                        return resolve(dn)
                    })
                }
            })
        })
    }

    /**
     * Performs a search action against the LDAP server and return the returned entries 
     *
     * @param {string} context
     * @param {SearchOptions} options
     * @returns {SearchEntryObject[]}
     * @author Jalil Fahimi (jfahimi@multamedio.de)
     */
    protected async get_objects_from_context(context: string, options: SearchOptions): Promise<SearchEntryObject[]> {
        try {
            const client = this.connect()
            const records: SearchEntryObject[] = []
            return new Promise((resolve, reject) => {
                client.bind(this.bind_dn, this.bind_pw, async (err) => {
                    if (err) {
                        console.log(err)
                        console.log('Error occurred while binding')
                        return (err)
                    } else {
                        client.search(context, options, (err, res) => {
                            if (err) {
                                this.disconnect(client)
                                return reject(err)
                            }
                            res.on('searchEntry', async function (entry) {
                                records.push(entry.object)
                            })

                            res.on('error', (e) => {
                                this.disconnect(client)
                                return reject(e)
                            })
                            res.on('end', () => {
                                this.disconnect(client)
                                return resolve(records)
                            })
                        })
                    }
                })
            })
        } catch (e) {
            console.log(e)
            throw e
        }
    }
}