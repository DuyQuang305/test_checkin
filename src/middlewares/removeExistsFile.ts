const fs = require('fs');

export default function removeFile(imagePath) {
    fs.unlink(imagePath, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(`file ${imagePath} have been deleted successfully`);
        
    })
}