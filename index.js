const express = require('express');
const fs = require("fs");

const upload = require('./middleware/imgUpload');
const app = express();

/**
 * @description Handles urlencoding
 */
app.use(
    express.urlencoded({
        extended: true,
    }),
);

/**
 * @description Handles / path
 */
app.get("/", (_, res) => {
    res.status(200).send({ status: 200, message: "OK" });
});

/**
 * @description Handles / path
 */
app.get("/:id", (req, res) => {
    let fileId = req.params["id"];

    // search dir
    fs.readdir(`${__dirname}/uploads/`, (err, files) => {
        if (err) {
            return res.status(500).send({ status: 500, message: "I/O Error" });
        } else {
            let noFound = true;

            for (let i = 0; i < files.length; i++) {
                let fileName = files[i];

                if (fileName.startsWith(fileId)) {
                    res.status(200).sendFile(`${__dirname}/uploads/${fileName}`);
                    noFound = false;

                    break;
                }
            }

            if (noFound) {
                res.status(404).send({ status: 404, message: "Not found" });
            }
        }
    });
});

/**
 * @description Handles /api/v1 path
 */
app.get("/api/v1", (_, res) => {
    res.status(200).send({ status: 200, message: "OK", apiVersion: 1 });
});

/**
 * @description Handles /api/v1/upload path
 */
app.post("/api/v1/upload", async (req, res) => {
    try {
        await upload(req, res)

        if (req.file == undefined) {
            return res.status(400).send({ message: 'Select image to upload' })
        }

        res.status(200).send({
            message: `http://localhost:3000/${req.file.filename}`,
        })
    } catch (err) {
        console.log(err)

        if (err.code == 'LIMIT_FILE_SIZE') {
            return res.status(500).send({
                message: 'File size should be less than 5MB',
            })
        }

        res.status(500).send({
            message: `Error: ${err}`,
        })
    }
});

/**
 * @description Handles /* path
 */
app.get("*", (_, res) => {
    res.status(404).send({ status: 404, message: "Route not found" });
});

/**
 * @description Handles listening
 */
app.listen(3000, () => {
    console.log('App working on: ' + 3000)
});