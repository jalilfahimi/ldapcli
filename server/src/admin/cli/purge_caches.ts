import readline from 'readline'
import { Cache } from '../../classes/cache/Cache';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question(`Do you really want to purge the caches? [y/n] `, async (entry) => {
    if (entry === 'y') {
        try {
            console.log('Started')
            await Cache.purge()
            console.log('Finished')
        } catch (e) {
            console.log(e)
        }
    } else {
        console.log('Cancelled')
    }
    rl.close()
    process.exit(0)
})