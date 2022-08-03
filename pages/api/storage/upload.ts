import { createClient } from '@supabase/supabase-js'
import formidable from 'formidable'
import fs from 'fs'
import type { NextApiRequest, NextApiResponse } from 'next'

const supabaseUrl: string = 'https://odax-master.v4.uat.opendax.app/api'
console.log('supabaseURL:', process.env.STORAGE_URL);
const supabaseServiceKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE2NTE2NzMzNTksImV4cCI6MTgwOTM1MzM1OX0.JGtaoXUV4BZ4g86dIKSRRqvBCM9xmh39aZvrCeKET88'
console.log('supabase STORAGE_SERVICE_KEY', process.env.STORAGE_SERVICE_KEY);

export const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Disable default body parser cause we parse body using `formidable`
export const config = {
    api: {
        bodyParser: false,
    },
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const form = new formidable.IncomingForm()

    form.parse(req, async function (err, fields, files) {
        const fileName = Object.keys(files)[0]

        if (err) {
            return res
                .status(400)
                .send({ error: `${fileName} parsing error: ${err}` })
        }

        //@ts-ignore
        const file = fs.readFileSync(files[fileName].filepath)

        const { error: bucketErr } = await supabase.storage.getBucket('logos')

        if (bucketErr && bucketErr.message === 'The resource was not found') {
            const { error } = await supabase.storage.createBucket('logos', {
                public: true,
            })

            if (error) {
                return res.status(400).send({
                    error: `Couldn't create a new bucket: ${error.message}`,
                })
            }
        }

        const { error: uploadErr } = await supabase.storage
            .from('logos')
            .upload(fileName, file, {
                upsert: true,
            })

        if (uploadErr) {
            return res.status(400).send({
                error: `${fileName} upload error: ${uploadErr.message}`,
            })
        }

        const { publicURL, error: publicUrlErr } = supabase.storage
            .from('logos')
            .getPublicUrl(fileName)

        if (publicUrlErr) {
            return res.status(400).send({
                error: `${fileName} getting public URL error: ${publicUrlErr.message}`,
            })
        }

        res.status(200).json({ publicURL })
    })
}
