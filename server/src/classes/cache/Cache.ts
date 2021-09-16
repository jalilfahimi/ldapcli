
import fs from "fs"
import path from 'path'
import appRoot from 'app-root-path'


/**
 * Cache class
 * 
 * @copyright (c) 2021 Jalil Fahimi
 * @author Jalil Fahimi (jalilfahimi535@gmail.com) 
 */
export class Cache {

    private static readonly dir = appRoot + '/data/cache/'
    private static readonly extension = '.json'
    private static readonly encoding: BufferEncoding = 'utf8'

    /**
     * 
     *
     * @param {string} key
     * @returns {boolean}
     * @author Jalil Fahimi (jfahimi@multamedio.de)
     */
    static async exists(key: string): Promise<boolean> {
        try {
            const path = Cache.dir + key + Cache.extension
            return fs.existsSync(path)
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
     * 
     *
     * @param {string} key
     * @returns {string}
     * @author Jalil Fahimi (jfahimi@multamedio.de)
     */
    static async get(key: string): Promise<string> {
        try {
            const path = Cache.dir + key + Cache.extension
            return fs.readFileSync(path, { encoding: Cache.encoding })
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
     * 
     *
     * @param {string} key
     * @param {string} value
     * @returns {void}
     * @author Jalil Fahimi (jfahimi@multamedio.de)
     */
    static async set(key: string, value: string): Promise<void> {
        try {
            const path = Cache.dir + key + Cache.extension
            return fs.writeFileSync(path, value, { encoding: Cache.encoding })
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
     * 
     *
     * @param {string} key
     * @returns {void}
     * @author Jalil Fahimi (jfahimi@multamedio.de)
     */
    static async unset(key: string): Promise<void> {
        try {
            const path = Cache.dir + key + Cache.extension
            fs.unlinkSync(path)
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    /**
     * 
     *
     * @returns {void}
     * @author Jalil Fahimi (jfahimi@multamedio.de)
     */
    static async purge(): Promise<void> {
        try {
            fs.readdirSync(Cache.dir).forEach(file => {
                const filepath = Cache.dir + file
                if (path.extname(filepath) === Cache.extension) {
                    fs.unlinkSync(filepath)
                }
            })
        } catch (e) {
            console.log(e)
            throw e
        }
    }
}
