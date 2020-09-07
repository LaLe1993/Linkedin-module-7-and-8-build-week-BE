const express = require("express");
const ProfilesSchema = require("./schema");
const profilesRouter = express.Router();
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const upload = multer({});
const PDFDocument = require("pdfkit");

// Get all profiles
profilesRouter.get("/", async (req, res, next) => {
  try {
    const profiles = await ProfilesSchema.find(req.query);
    res.status(200).send(profiles);
  } catch (error) {
    next(error);
  }
});

// Get single profile
profilesRouter.get("/:username", async (req, res, next) => {
  try {
    const username = req.params.username;
    const profile = await ProfilesSchema.find({username: username});
    if (profile) {
      res.status(200).send(profile);
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next("While reading profiles list a problem occurred!");
  }
});

// Post a new image for a profile
profilesRouter.post(
  "/:id/uploadImage",
  upload.single("image"),
  async (req, res) => {
    const imagesPath = path.join(__dirname, "/images");
    await fs.writeFile(
      path.join(
        imagesPath,
        req.params.id + "." + req.file.originalname.split(".").pop()
      ),
      req.file.buffer
    );

    //
    var obj = {
      image: fs.readFileSync(
        path.join(
          __dirname +
            "/images/" +
            req.params.id +
            "." +
            req.file.originalname.split(".").pop()
        )
      ),
    };
    //
    await ProfilesSchema.findByIdAndUpdate(req.params.id, obj);
    res.send("image added successfully");
  }
);

// Post a new profile
profilesRouter.post("/", upload.single("image"), async (req, res, next) => {
  try {
    if (req.file) {
      const imagesPath = path.join(__dirname, "/images");
      await fs.writeFile(
        path.join(
          imagesPath,
          req.body.username + "." + req.file.originalname.split(".").pop()
        ),
        req.file.buffer
      );
      var obj = {
        ...req.body,
        image: fs.readFileSync(
          path.join(
            __dirname +
              "/images/" +
              req.body.username +
              "." +
              req.file.originalname.split(".").pop()
          )
        ),
      };
    } else {
      var obj = {
        ...req.body,
        image: fs.readFileSync(path.join(__dirname, "./images/default.jpg")),
      };
    }

    const newProfile = new ProfilesSchema(obj);
    await newProfile.save();
    res.send("ok");
    /*
        const newProfile = {
            ...req.body,
            "image": "https://i.dlpng.com/static/png/5326621-pingu-png-images-png-cliparts-free-download-on-seekpng-pingu-png-300_255_preview.png"
        }
        const rawNewProfile = new ProfilesSchema(newProfile)
        const { id } = await rawNewProfile.save()
        res.status(201).send(id)

        */
  } catch (error) {
    next(error);
  }
});

// Create a PDF file of a profile
profilesRouter.get("/:id/profilePDF", async (req, res, next) => {
  try {
    console.log("here");
    const id = req.params.id;
    const profile = await ProfilesSchema.findById(id);

    console.log(profile);
    function example() {
      var doc = new PDFDocument();

      var writeStream = fs.createWriteStream(`${profile.username}.pdf`);
      doc.pipe(writeStream);
      //line to the middle
      doc.moveTo(270, 90).lineTo(270, 190).stroke();

      row(doc, 90);
      row(doc, 110);
      row(doc, 130);
      row(doc, 150);
      row(doc, 170);

      textInRowFirst(doc, "Name:", 100);
      textInRowFirst(doc, "Surname", 120);
      textInRowFirst(doc, "Email", 140);
      textInRowFirst(doc, "Area", 160);
      textInRowFirst(doc, "Username", 180);

      textInRowSecond(doc, profile.name, 100);
      textInRowSecond(doc, profile.surname, 120);
      textInRowSecond(doc, profile.email, 140);
      textInRowSecond(doc, profile.area, 160);
      textInRowSecond(doc, profile.username, 180);
      doc.end();

      writeStream.on("finish", function () {
        // do stuff with the PDF file
        return res.status(200).json({
          ok: "ok",
        });
      });
    }

    function textInRowFirst(doc, text, heigth) {
      doc.y = heigth;
      doc.x = 30;
      doc.fillColor("black");
      doc.text(text, {
        paragraphGap: 5,
        indent: 5,
        align: "justify",
        columns: 1,
      });
      return doc;
    }

    function textInRowSecond(doc, text, heigth) {
      doc.y = heigth;
      doc.x = 270;
      doc.fillColor("black");
      doc.text(text, {
        paragraphGap: 5,
        indent: 5,
        align: "justify",
        columns: 1,
      });
      return doc;
    }

    function row(doc, heigth) {
      doc.lineJoin("miter").rect(30, heigth, 500, 20).stroke();
      return doc;
    }

    example();
  } catch (error) {
    console.log(error);
    next("While reading profiles list a problem occurred!");
  }
});

// Modifie a profile
profilesRouter.put("/:id", async (req, res, next) => {
  try {
    const profile = await ProfilesSchema.findOneAndUpdate(
      req.params.id,
      req.body
    );
    if (profile) {
      res.status(200).send("OK");
    } else {
      const error = new Error(`Profile with id ${req.params.id} not found!`);
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

// Delete a profile
profilesRouter.delete("/:id", async (req, res, next) => {
  try {
    const profile = await ProfilesSchema.findByIdAndDelete(req.params.id);
    if (profile) {
      res.status(200).send("Delete!");
    } else {
      const error = new Error(`Profile with id ${req.params.id} not found!`);
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = profilesRouter;
