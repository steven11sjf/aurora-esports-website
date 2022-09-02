var Busboy = require("busboy");
var path = require("path");
var fs = require("fs");
var sha1 = require("sha1");
const AdmZip = require("adm-zip");

// Gets a filename extension.
function getExtension(filename) {
	console.log(filename);
    return filename.split(".").pop();
}

// Test if a image is valid based on its extension and mime type.
function isImageValid(filename, mimetype) {
    var allowedExts = ["gif", "jpeg", "jpg", "png", "svg", "blob"];
    var allowedMimeTypes = ["image/gif", "image/jpeg", "image/pjpeg", "image/x-png", "image/png", "image/svg+xml"];

    // Get image extension.
    var extension = getExtension(filename);

    return allowedExts.indexOf(extension.toLowerCase()) != -1 &&
        allowedMimeTypes.indexOf(mimetype) != -1;
}

function uploadImage(req, callback) {
    // The route on which the image is saved.
	var preFileRoute = "/public";
    var fileRoute = "/newblog";
	var folder = "/0"

    // Server side file path on which the image is saved.
    var saveToPath = null;

    // Flag to tell if a stream had an error.
    var hadStreamError = null;

    // Used for sending response.
    var link = null;

    // Stream error handler.
    function handleStreamError(error) {
        // Do not enter twice in here.
        if (hadStreamError) {
            return;
        }

        hadStreamError = error;

        // Cleanup: delete the saved path.
        if (saveToPath) {
            return fs.unlink(saveToPath, function(err) {
                return callback(error);
            });
        }

        return callback(error);
    }

    // Instantiate Busboy.
    try {
        var busboy = Busboy({
            headers: req.headers
        });
    } catch (e) {
        return callback(e);
    }
	
	// handle fields
	busboy.on("field", function(fieldname, value, info) {
		if ("id" == fieldname) {
			folder = value.toString() + "/";
		}
	});

    // Handle file arrival.
    busboy.on("file", function(fieldname, file, filename, encoding, mimetype) {
        // Check fieldname:
        if ("file" != fieldname) {
            // Stop receiving from this stream.
            file.resume();
            return callback("Fieldname is not correct. It must be " +
                file + ".");
        }

        // Generate link.
        var randomName = sha1(new Date().getTime()) + "." + getExtension(filename.filename);
        link = path.join(fileRoute, folder, randomName);

        // Generate path where the file will be saved.
        var appDir = path.dirname(require.main.filename);
        saveToPath = path.join(appDir, preFileRoute, link);
		
		// make file path if route doesn't exist
		var folderPath = path.join(appDir, preFileRoute, fileRoute, folder);
		if(!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);

        // Pipe reader stream (file from client) into writer stream (file from disk).
        file.on("error", handleStreamError);

        // Create stream writer to save to file to disk.
        var diskWriterStream = fs.createWriteStream(saveToPath);
        diskWriterStream.on("error", handleStreamError);

        // Validate image after it is successfully saved to disk.
        diskWriterStream.on("finish", function() {
            // Check if image is valid
            var status = isImageValid(saveToPath, mimetype);

            if (!status) {
                //return handleStreamError("File does not meet the validation.");
            }

            return callback(null, {
                link: link
            });
        });

        // Save image to disk.
        file.pipe(diskWriterStream);
    });

    // Handle file upload termination.
    busboy.on("error", handleStreamError);
    req.on("error", handleStreamError);

    // Pipe reader stream into writer stream.
    return req.pipe(busboy);
}

function uploadHtml(req, callback) {
	// get html from POST body
	let body = req.body.content;
	let id = req.body.id;
	// write html into /newblog/id/content.html
	if(!fs.existsSync(`./public/newblog/${id}`)) fs.mkdirSync(`./public/newblog/${id}`);
	fs.writeFile(`./public/newblog/${id}/content.html`, body.toString(), err => { return callback(err) });
	// callback success
	return callback(null, `/newblog/content.html`);
}

function generateArticle(req, callback) {
	let articleInfo = {
		title : req.body.title,
		byline : req.body.byline,
		id : req.body.id
	}
	
	// zip up /public/newblog
	const zip = new AdmZip();
	const outputFile = `./public/${articleInfo.title+' - '+articleInfo.byline}.zip`
	
	zip.addLocalFolder(`./public/newblog/${articleInfo.id}`);
	zip.writeZip(outputFile);
	
	// use the callback
	callback(null, `/download/${articleInfo.id}/${articleInfo.title+' - '+articleInfo.byline}.zip`);
}

module.exports = {
	uploadImage,
	uploadHtml,
	generateArticle
}