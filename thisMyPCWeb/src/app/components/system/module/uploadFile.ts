export class uploadFiles {
    uploadFile ;
     static BYTES_PER_CHUNK = 1024;



    onFileChange(event) {
        this.uploadFile = event.target.files[0];


        let json = JSON.stringify({
            fileName: this.uploadFile.name,
            fileSize: this.uploadFile.size
        });
        console.log(json);

//        this.readNextChunk();

    }


}
