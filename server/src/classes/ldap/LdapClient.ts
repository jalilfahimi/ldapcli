import { SearchEntryObject, Change, SearchOptions, parseDN } from 'ldapjs'
import { LdapBase } from "./LdapBase"
import { Cache } from '../cache/Cache'
import config from "../../config/ldapconfig.json"
import { SearchScope } from '../../definitions/LDAP/SearchScopes.type'


/**
 * LdapClient class
 * This class contains all necessary functions and attributes for ldap realted actions.
 * The client class is the gateway to the actual base class which performs the ldap queries against the LDAP server.
 * 
 * @copyright (c) 2021 Jalil Fahimi
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export class LdapClient extends LdapBase {
    readonly raw_config = config
    readonly base_dn = config.base_dn

    constructor() {
        super()
    }

    /**
     * Retrieves the dn of the parent of the given dn
     *     
     * @param {string} dn
     * @returns {string} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    async get_parent_dn(dn: string): Promise<string> {
        try {
            const parsed_dn = await parseDN(dn)
            const parent_obj = parsed_dn.parent()
            let parent_dn = ""

            for (const rdn of parent_obj.rdns) {
                for (const key in rdn.attrs) {
                    if (Object.prototype.hasOwnProperty.call(rdn.attrs, key)) {
                        parent_dn += key
                        parent_dn += "="
                        parent_dn += rdn.attrs[key].value
                        parent_dn += ","
                    }
                }
            }

            parent_dn = parent_dn.slice(0, -1) + ''
            return parent_dn

        } catch (e) {
            return ''
        }
    }

    /**
     * This function retrieves the rdn value of the given dn
     *     
     * @param {string} dn
     * @returns {string} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    get_rdn_from_dn(dn: string): { rdn: string, value: string } {
        try {
            const dn_arr = dn.split(",")
            const rdn = dn_arr.splice(0, 1).join("")
            const rdn_array = rdn.split("=")
            return { rdn: rdn_array[0], value: rdn_array[1] }
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
     * Performs a create action against the LDAP server and creates an object with given entries from form.
     *
     * @param {string} dn Distinguished name for the LDAP object 
     * @param {object} entry
     * @returns {string} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    async create(dn: string, entry: Record<string, unknown>): Promise<string> {
        try {
            return await this.create_object(dn, entry)
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
     * Performs an update action against the LDAP server and updates objects entries
     *
     * @param {SearchEntryObject} object 
     * @param {Change[]} changes
     * @returns {string[]} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    async update(object: SearchEntryObject, changes: Change | Change[]): Promise<string> {
        try {
            return await this.update_object(object.dn, changes)
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
     * Performs a modifyDN action against the LDAP server and updates objects dn
     *
     * @param {SearchEntryObject} object
     * @param {string} new_dn
     * @returns {string} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    async update_dn(object: SearchEntryObject, new_dn: string): Promise<string> {
        try {
            return await this.update_object_dn(object.dn, new_dn)
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
     * Performs a delete action against the LDAP server and deletes the object with the given dn
     * 
     * @param {SearchEntryObject} object  
     * @returns {string} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    async delete(object: SearchEntryObject): Promise<string> {
        try {
            return await this.delete_object(object.dn)
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
     * Retrieves an array of every object inside the given context.
     *
     * @param {string} context
     * @returns {SearchEntryObject[]} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    async get_everything(context: string): Promise<SearchEntryObject[]> {
        try {
            const options: SearchOptions = {
                scope: 'sub',
                paged: true,
            }
            return await this.get_objects_from_context(context, options)
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
     * Checks if the given dn has sub entries of the given type.
     *
     * @param {string} dn
     * @param {string} type
     * @returns {boolean} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    async has_direct_children(dn: string, type: string): Promise<boolean> {
        try {
            const context = dn
            const options: SearchOptions = {
                filter: type,
                scope: 'one',
                paged: true
            }
            const children = await this.get_objects_from_context(context, options)
            if (children.length > 0) return true
            return false
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
     * This function calculates the depth of an object in the tree.
     * 
     * @param {string} dn
     * @returns {number}
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    async get_depth(dn: string): Promise<number> {
        try {
            let parent = await this.get_parent_dn(dn)
            let depth = 0
            do {
                if (parent === this.base_dn) {
                    break
                }
                depth++
                parent = await this.get_parent_dn(parent)
            } while (parent !== this.base_dn)

            return Number(depth)
        } catch (e) {
            console.log(e)
            return 0
        }
    }

    /**
     * Gets an array of ldap objects with given conditions.
     *
     * @param {[{ field: string, value: string }]} conditions
     * @param {string} context
     * @returns {SearchEntryObject[]} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    async get_objects_by_fields(conditions: [{ field: string, value: string }], context: string): Promise<SearchEntryObject[]> {
        try {
            let filter = ''
            for (const condition of conditions) {
                filter += '(' + condition.field + '=' + condition.value + ')'
            }
            const options: SearchOptions = {
                filter,
                scope: 'sub',
                paged: true,
            }
            return await this.get_objects_from_context(context, options)
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
     * Gets an array of ldap objects with given conditions.
     *
     * @param {string} query
     * @param {SearchScope} scope
     * @param {string} context
     * @returns {SearchEntryObject[]} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    async search_raw(query: string, scope: SearchScope, context: string): Promise<SearchEntryObject[]> {
        try {
            const options: SearchOptions = {
                filter: query,
                scope,
                paged: true,
            }
            return await this.get_objects_from_context(context, options)
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
     * Performs a search action against the LDAP server and checks if the user exists and then authenticate the user.
     *
     * @param {string} password
     * @returns {boolean} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    async check_credentials(password: string): Promise<boolean> {
        try {
            return password === this.bind_pw
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
     *
     * @param {string} attributeType
     * @returns {boolean} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    async attributeType_exists(attributeType: string): Promise<boolean> {
        try {
            const opts: SearchOptions = { scope: 'base', attributes: ['attributeTypes',] }
            const records = await this.get_objects_from_context('cn=subschema', opts)

            const searchStr = `'${attributeType.toLowerCase()}'`

            for (const record of records) {
                if (typeof record.attributeTypes === 'string') {
                    return record.attributeTypes.toLowerCase().includes(searchStr)
                }
                if (typeof record.attributeTypes === 'object') {
                    for (const attributeType of record.attributeTypes) {
                        if (attributeType.toLowerCase().includes(searchStr)) {
                            return true
                        }
                    }
                }
            }

            return false
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
     *
     * @param {string} attributeType
     * @returns {string} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    async get_attributeType(attributeType: string): Promise<string> {
        try {
            const opts: SearchOptions = { scope: 'base', attributes: ['attributeTypes',] }
            const records = await this.get_objects_from_context('cn=subschema', opts)

            const searchStr = `'${attributeType.toLowerCase()}'`

            for (const record of records) {
                if (typeof record.attributeTypes === 'string') {
                    if (record.attributeTypes.toLowerCase().includes(searchStr)) {
                        return record.attributeTypes
                    }
                }
                if (typeof record.attributeTypes === 'object') {
                    for (const attributeType of record.attributeTypes) {
                        if (attributeType.toLowerCase().includes(searchStr)) {
                            return attributeType
                        }
                    }
                }
            }

            return 'No attributeType found.'
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
    *
    * @param {string} attributeType
    * @returns {string} 
    * @author Jalil Fahimi (jalilfahimi535@gmail.com)
    */
    async attributeType_is_single_value(attributeType: string): Promise<boolean> {
        try {
            const searchStr = 'SINGLE-VALUE'
            const specs = await this.get_attributeType(attributeType)
            return specs.toLowerCase().includes(searchStr.toLowerCase())
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
     *
     * @param {string} objectclass
     * @returns {boolean} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    async objectclass_exists(objectclass: string): Promise<boolean> {
        try {
            const opts: SearchOptions = { scope: 'base', attributes: ['objectclasses',] }
            const records = await this.get_objects_from_context('cn=subschema', opts)

            const searchStr = `'${objectclass.toLowerCase()}'`

            for (const record of records) {
                if (typeof record.objectClasses === 'string') {
                    return record.objectClasses.toLowerCase().includes(searchStr)
                }
                if (typeof record.objectClasses === 'object') {
                    for (const objectClass of record.objectClasses) {
                        if (objectClass.toLowerCase().includes(searchStr)) {
                            return true
                        }
                    }
                }
            }

            return false
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
     *
     * @param {string} objectclass
     * @returns {string} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    async get_objectclass(objectclass: string): Promise<string> {
        try {
            const opts: SearchOptions = { scope: 'base', attributes: ['objectclasses',] }
            const records = await this.get_objects_from_context('cn=subschema', opts)

            const searchStr = `'${objectclass.toLowerCase()}'`

            for (const record of records) {
                if (typeof record.objectClasses === 'string') {
                    if (record.objectClasses.toLowerCase().includes(searchStr)) {
                        return record.objectClasses
                    }
                }
                if (typeof record.objectClasses === 'object') {
                    for (const objectClass of record.objectClasses) {
                        if (objectClass.toLowerCase().includes(searchStr)) {
                            return objectClass
                        }
                    }
                }
            }

            return 'No objectclass found.'
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
    *
    * @param {string} objectclass
    * @returns {string} 
    * @author Jalil Fahimi (jalilfahimi535@gmail.com)
    */
    async objectclass_is_structural(objectclass: string): Promise<boolean> {
        try {
            const searchStr = 'STRUCTURAL'
            const specs = await this.get_objectclass(objectclass)
            return specs.toLowerCase().includes(searchStr.toLowerCase())
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
     *
     * @param {string} objectclass
     * @returns {string[]} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    async get_objectclass_parents(objectclass: string): Promise<string[]> {
        try {
            const key = 'parents_of_' + objectclass.toLocaleLowerCase()
            if (await Cache.exists(key)) {
                const cached = await Cache.get(key)
                return JSON.parse(cached)
            }

            const parents = await this.calc_objectclass_parents(objectclass)

            const content = JSON.stringify(parents)
            await Cache.set(key, content)

            return parents
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
     *
     * @param {string} objectclass
     * @param {string[]} parents
     * @returns {{required: string[], optional: string[]}} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    async get_objectclass_attributes(objectclass: string, parents: string[]): Promise<{ required: string[], optional: string[] }> {
        try {
            const key = 'attributes_of_' + objectclass.toLocaleLowerCase()
            if (await Cache.exists(key)) {
                const cached = await Cache.get(key)
                return JSON.parse(cached)
            }

            const combined = await this.calc_objectclass_attributes(objectclass, parents)
            const required: string[] = combined.required
            const optional: string[] = combined.optional

            const content = JSON.stringify({ required, optional })
            await Cache.set(key, content)

            return { required, optional }
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
     *
     * @param {string} objectclass
     * @param {string[]} parents_from_last_level
     * @returns {string[]} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    private async calc_objectclass_parents(objectclass: string, parents_from_last_level?: string[]): Promise<string[]> {
        try {
            const parents: string[] = parents_from_last_level ? parents_from_last_level : ['top']

            const specs = await this.get_objectclass(objectclass)
            if (specs.toLowerCase().includes('sup')) {
                const after = specs.toLowerCase().split('sup')[1]
                const array = after.split(" ");
                for (const val of array) {
                    if (val === 'top' || val.length < 1) continue
                    if (!await this.objectclass_exists(val)) continue
                    if (parents.includes(val)) continue
                    parents.push(val)
                    await this.calc_objectclass_parents(val, parents)
                }
            }

            return parents
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
     *
     * @param {string} objectclass
     * @param {string[]} parents
     * @returns {{required: string[], optional: string[]}} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    private async calc_objectclass_attributes(objectclass: string, parents: string[]): Promise<{ required: string[], optional: string[] }> {
        try {
            const combined = await this.get_objectclass_direct_attributes(objectclass)
            const required: string[] = combined.required
            const optional: string[] = combined.optional

            for (const parent of parents) {
                const atts = await this.get_objectclass_direct_attributes(parent)
                for (const requiredOfParent of atts.required) {
                    if (required.includes(requiredOfParent)) continue
                    required.push(requiredOfParent)
                }

                for (const optionalOfParent of atts.optional) {
                    if (optional.includes(optionalOfParent)) continue
                    optional.push(optionalOfParent)
                }
            }

            return { required, optional }
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
     *
     * @param {string} objectclass
     * @returns {{required: string[], optional: string[]}} 
     * @author Jalil Fahimi (jalilfahimi535@gmail.com)
     */
    private async get_objectclass_direct_attributes(objectclass: string): Promise<{ required: string[], optional: string[] }> {
        try {
            const required: string[] = []
            const optional: string[] = []

            const specs = await this.get_objectclass(objectclass)
            if (specs.includes('MUST')) {
                const after = specs.split('MUST')[1]
                const array = after.split(" ");
                for (const val of array) {
                    if (val === 'MAY' || val === ')') break;
                    if (await this.attributeType_exists(val)) required.push(val)
                }
            }
            if (specs.includes('MAY')) {
                const after = specs.split('MAY')[1]
                const array = after.split(" ");
                for (const val of array) {
                    if (val === 'MUST' || val === ')') break;
                    if (await this.attributeType_exists(val)) optional.push(val)
                }
            }

            return { required, optional }

        } catch (e) {
            console.log(e)
            throw e
        }
    }
}