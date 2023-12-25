require('dotenv').config();

const { google } = require('googleapis');
const SCOPE = ['https://www.googleapis.com/auth/drive'];

async function authorize() {
    const jwtClient = new google.auth.JWT(
        process.env.CLIENT_EMAIL,
        null,
        process.env.PRIVATE_KEY,
        SCOPE
    );

    await jwtClient.authorize();

    return jwtClient;
}

async function moveFiles(sourceFolderId, destinationFolderId) {

    try {
        const auth = await authorize();

        const drive = google.drive({ version: 'v3', auth });

        const { data } = await drive.files.list({
            q: `'${sourceFolderId}' in parents`,
        });

        for (const file of data.files) {
            await drive.files.update({
                fileId: file.id,
                addParents: destinationFolderId,
                removeParents: sourceFolderId,
            });
            console.log(`File "${file.name}" moved successfully.`);
        }

        console.log('All files moved successfully.');

    } catch (error) {

        console.error('Error moving files:', error.message);

    }
}


const main = () => {
    const sourceFolderId = process.argv[2];
    const destinationFolderId = process.argv[3];

    if (!sourceFolderId || !destinationFolderId) {
        console.error('Usage: node index.js <sourceFolderId> <destinationFolderId>');
        process.exit(1);
    }
    const message = `Are you sure you want to move files from ${sourceFolderId} to ${destinationFolderId}?`;
    process.stdout.write(`${message} (y/n): `);
    process.stdin.once('data', async (data) => {
        const input = data.toString().trim();
        if (input === 'y' || input === 'yes') await moveFiles(sourceFolderId, destinationFolderId, destinationFolderId);

        else console.log('Operation has been cancelled.');
        process.exit(0);
    });
};

main();
