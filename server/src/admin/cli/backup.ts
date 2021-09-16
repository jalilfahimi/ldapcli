import fs from "fs"
import appRoot from 'app-root-path'
import { LdapClient } from "../../classes/ldap/LdapClient";
import { make_readable_date } from "../../lib/lib";
import { ldif } from "../../lib/ldap/lib";

const json_path = appRoot + '/data/backups/backup_' + make_readable_date() + '.json'
const ldif_path = appRoot + '/data/backups/backup_' + make_readable_date() + '.ldif'

const promise = async () => {
  try {
    // Create the LDAP export
    const ldap_client = new LdapClient()

    const objects = await ldap_client.get_everything(ldap_client.base_dn)
    if (Array.isArray(objects)) {
      const encoding: BufferEncoding = 'utf8'

      const data = JSON.stringify(objects)
      fs.writeFileSync(json_path, data, { encoding })

      const ldif_string = ldif(objects)
      fs.writeFileSync(ldif_path, ldif_string, { encoding })

    } else {
      throw `${objects['lde_message']}: ${objects['lde_dn']}`
    }
  } catch (e) {
    console.log("Errors:", e);
    process.kill(process.pid);
  }
}

promise()
  .then(() => {
    console.log(`LDIF backup file is saved here as json: ${json_path}`)
    console.log(`LDIF backup file is saved here as ldif: ${ldif_path}`)
    console.log("Exiting process with status OK")
    process.exit(0)
  })
  .catch((e) => {
    console.log("Exiting process with status FAILURE");
    console.log(e)
    process.exit(1)
  })